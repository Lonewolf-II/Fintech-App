import { ModificationRequest, Account, Customer, User, IPOApplication, Portfolio, Holding } from '../models/index.js';
import { logActivity } from '../utils/logger.js';

export const getPendingRequests = async (req, res) => {
    try {
        const modifications = await ModificationRequest.findAll({
            where: { status: 'pending' },
            include: [{ model: User, as: 'requester', attributes: ['name', 'email'] }]
        });

        // Enrich modifications with current data
        const enrichedModifications = await Promise.all(modifications.map(async (mod) => {
            let currentData = null;
            if (mod.targetModel === 'Account') {
                currentData = await Account.findByPk(mod.targetId);
            } else if (mod.targetModel === 'Customer') {
                currentData = await Customer.findByPk(mod.targetId);
            } else if (mod.targetModel === 'User') {
                currentData = await User.findByPk(mod.targetId);
            }
            return {
                ...mod.toJSON(),
                currentData
            };
        }));

        // Fetch pending KYC customers
        const kyc = await Customer.findAll({
            where: { kycStatus: 'pending' },
            include: [{ model: User, as: 'creator', attributes: ['name', 'email'] }]
        });

        // Fetch pending IPO
        const ipo = await IPOApplication.findAll({
            where: { status: 'pending' },
            include: [{ model: Customer, as: 'customer', attributes: ['fullName', 'customerId'] }]
        });

        res.json({
            modifications: enrichedModifications,
            kyc,
            ipo
        });
    } catch (error) {
        console.error('Get pending requests error:', error);
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
};

export const actionRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, notes, type } = req.body; // type: 'modification', 'kyc', 'ipo'
        const reviewerId = req.user.id;

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ error: 'Invalid action' });
        }

        // Handle Modification Requests
        if (!type || type === 'modification') {
            const request = await ModificationRequest.findByPk(id);
            if (!request) return res.status(404).json({ error: 'Request not found' });

            if (request.status !== 'pending') {
                return res.status(400).json({ error: 'Request is not pending' });
            }

            if (action === 'approve') {
                if (request.targetModel === 'Account') {
                    const account = await Account.findByPk(request.targetId);
                    if (account) {
                        await account.update(request.requestedChanges);
                    }
                } else if (request.targetModel === 'Holding') {
                    const holding = await Holding.findByPk(request.targetId);

                    if (request.changeType === 'delete') {
                        if (holding) {
                            const portfolioId = holding.portfolioId;
                            const investmentToRemove = parseFloat(holding.quantity) * parseFloat(holding.purchasePrice);
                            const valueToRemove = parseFloat(holding.quantity) * parseFloat(holding.currentPrice);

                            await holding.destroy();

                            const portfolio = await Portfolio.findByPk(portfolioId);
                            if (portfolio) {
                                await portfolio.update({
                                    totalInvestment: Math.max(0, parseFloat(portfolio.totalInvestment) - investmentToRemove),
                                    totalValue: Math.max(0, parseFloat(portfolio.totalValue) - valueToRemove)
                                });
                            }
                        }
                    } else if (holding) {
                        const changes = request.requestedChanges;

                        // If quantity or purchase price changes, we need to adjust portfolio totals?
                        // This is complex because we need the delta. 
                        // Simplified: If quantity changes, diff * purchasePrice = investment diff.
                        if (changes.quantity || changes.purchasePrice) {
                            const oldQty = parseFloat(holding.quantity);
                            const oldPrice = parseFloat(holding.purchasePrice);
                            const newQty = changes.quantity ? parseFloat(changes.quantity) : oldQty;
                            const newPrice = changes.purchasePrice ? parseFloat(changes.purchasePrice) : oldPrice;

                            const oldInvest = oldQty * oldPrice;
                            const newInvest = newQty * newPrice;
                            const diffInvest = newInvest - oldInvest;

                            // Value diff (assuming current price stays same unless updated?)
                            // Current price usually follows market, but initial is purchase.
                            // Let's assume currentPrice is separate.
                            const oldVal = oldQty * parseFloat(holding.currentPrice);
                            const newVal = newQty * parseFloat(holding.currentPrice);
                            const diffVal = newVal - oldVal;

                            const portfolio = await Portfolio.findByPk(holding.portfolioId);
                            if (portfolio) {
                                await portfolio.update({
                                    totalInvestment: parseFloat(portfolio.totalInvestment) + diffInvest,
                                    totalValue: parseFloat(portfolio.totalValue) + diffVal
                                });
                            }
                        }

                        await holding.update(changes);
                    }
                } else if (request.targetModel === 'IPOApplication') {
                    const application = await IPOApplication.findByPk(request.targetId);

                    if (request.changeType === 'delete') {
                        if (application) {
                            // Unblock funds if verified
                            if (application.status === 'verified') {
                                const account = await Account.findOne({
                                    where: { customerId: application.customerId, isPrimary: true }
                                });
                                if (account) {
                                    account.blockedAmount = Math.max(0, parseFloat(account.blockedAmount) - parseFloat(application.totalAmount));
                                    await account.save();
                                }
                            }
                            await application.destroy();
                        }
                    } else if (application) {
                        // Update Logic
                        const changes = request.requestedChanges;

                        // 1. Status Change (Revert)
                        if (changes.status && application.status === 'verified' && changes.status !== 'verified') {
                            const account = await Account.findOne({
                                where: { customerId: application.customerId, isPrimary: true }
                            });
                            if (account) {
                                account.blockedAmount = Math.max(0, parseFloat(account.blockedAmount) - parseFloat(application.totalAmount));
                                await account.save();
                            }
                        }

                        // 2. Amount/Quantity Change (if valid status)
                        // If we are verified, we need to adjust the block
                        if (changes.totalAmount && application.status === 'verified') {
                            const account = await Account.findOne({
                                where: { customerId: application.customerId, isPrimary: true }
                            });
                            if (account) {
                                const oldAmount = parseFloat(application.totalAmount);
                                const newAmount = parseFloat(changes.totalAmount);
                                const diff = newAmount - oldAmount;

                                // Check if we need to block more and have funds
                                if (diff > 0) {
                                    const available = parseFloat(account.balance) - parseFloat(account.blockedAmount);
                                    if (available < diff) {
                                        return res.status(400).json({ error: 'Insufficient funds for updated amount' });
                                    }
                                }

                                account.blockedAmount = parseFloat(account.blockedAmount) + diff;
                                await account.save();
                            }
                        }

                        await application.update(changes);
                    }
                }

                request.status = 'approved';
                await logActivity(reviewerId, 'APPROVE_MODIFICATION', 'ModificationRequest', id, { target: request.targetModel, targetId: request.targetId }, req);
            } else {
                request.status = 'rejected';
                await logActivity(reviewerId, 'REJECT_MODIFICATION', 'ModificationRequest', id, { target: request.targetModel, targetId: request.targetId }, req);
            }

            request.reviewedBy = reviewerId;
            request.reviewNotes = notes;
            await request.save();

            return res.json({ message: `Request ${action}d successfully`, request });
        }

        // Handle KYC Requests
        if (type === 'kyc') {
            const customer = await Customer.findByPk(id);
            if (!customer) return res.status(404).json({ error: 'Customer not found' });

            if (action === 'approve') {
                customer.kycStatus = 'verified';
                await customer.save();
                await logActivity(reviewerId, 'APPROVE_KYC', 'Customer', id, { customerName: customer.fullName }, req);
            } else {
                customer.kycStatus = 'rejected';
                await customer.save();
                await logActivity(reviewerId, 'REJECT_KYC', 'Customer', id, { customerName: customer.fullName }, req);
            }
            return res.json({ message: `KYC ${action}d successfully`, customer });
        }

        // Handle IPO Requests
        if (type === 'ipo') {
            const application = await IPOApplication.findByPk(id);
            if (!application) return res.status(404).json({ error: 'Application not found' });

            if (action === 'approve') {
                // Find primary account for the customer
                const account = await Account.findOne({
                    where: { customerId: application.customerId, status: 'active' },
                    order: [['isPrimary', 'DESC'], ['balance', 'DESC']] // Prefer primary, then highest balance
                });

                if (!account) {
                    return res.status(400).json({ error: 'No active account found for this customer' });
                }

                const totalAmount = parseFloat(application.totalAmount);
                const availableBalance = parseFloat(account.balance) - parseFloat(account.blockedAmount);

                if (availableBalance < totalAmount) {
                    return res.status(400).json({ error: 'Insufficient funds to verify IPO application' });
                }

                // Block funds
                account.blockedAmount = parseFloat(account.blockedAmount) + totalAmount;
                await account.save();

                application.status = 'verified';
                await application.save();
                await logActivity(reviewerId, 'APPROVE_IPO', 'IPOApplication', id, { company: application.companyName, qty: application.quantity, amountBlocked: totalAmount }, req);
            } else {
                application.status = 'rejected';
                await application.save();
                await logActivity(reviewerId, 'REJECT_IPO', 'IPOApplication', id, { company: application.companyName }, req);
            }
            return res.json({ message: `IPO Application ${action}d successfully`, application });
        }

        return res.status(400).json({ error: 'Invalid request type' });
    } catch (error) {
        console.error('Action request error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
};

export const bulkActionRequest = async (req, res) => {
    try {
        const { ids, action, type } = req.body;
        const reviewerId = req.user.id;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'Invalid or empty IDs array' });
        }

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ error: 'Invalid action' });
        }

        let results = { success: 0, failed: 0 };

        if (type === 'ipo') {
            for (const id of ids) {
                try {
                    const application = await IPOApplication.findByPk(id);
                    if (application && application.status === 'pending') {
                        if (action === 'approve') {
                            // Find primary account
                            const account = await Account.findOne({
                                where: { customerId: application.customerId, status: 'active' },
                                order: [['isPrimary', 'DESC'], ['balance', 'DESC']]
                            });

                            if (account) {
                                const totalAmount = parseFloat(application.totalAmount);
                                const availableBalance = parseFloat(account.balance) - parseFloat(account.blockedAmount);

                                if (availableBalance >= totalAmount) {
                                    // Block funds
                                    account.blockedAmount = parseFloat(account.blockedAmount) + totalAmount;
                                    await account.save();

                                    application.status = 'verified';
                                    await application.save();
                                    await logActivity(reviewerId, 'APPROVE_IPO_BULK', 'IPOApplication', id, { company: application.companyName, amountBlocked: totalAmount }, req);
                                    results.success++;
                                } else {
                                    // Insufficient funds - skip logic or log failure
                                    console.warn(`Insufficient funds for IPO ${id}`);
                                    results.failed++;
                                }
                            } else {
                                results.failed++;
                            }
                        } else {
                            application.status = 'rejected';
                            await logActivity(reviewerId, 'REJECT_IPO_BULK', 'IPOApplication', id, { company: application.companyName }, req);
                            await application.save();
                            results.success++;
                        }
                    } else {
                        results.failed++;
                    }
                } catch (err) {
                    console.error(`Failed to action IPO ${id}`, err);
                    results.failed++;
                }
            }
        } else {
            return res.status(400).json({ error: 'Bulk action only supported for IPO currently' });
        }

        res.json({ message: 'Bulk action processed', results });

    } catch (error) {
        console.error('Bulk action error:', error);
        res.status(500).json({ error: 'Failed to process bulk request' });
    }
};
