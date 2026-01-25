import { IPOApplication, Account, Customer, IPOListing, ModificationRequest, BankConfiguration, SpecialAccount, Transaction, Portfolio, Holding, sequelize } from '../models/index.js';
import { Op } from 'sequelize';

export const applyIPO = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { customerId, accountId, companyName, quantity, pricePerShare } = req.body;

        console.log('=== IPO APPLICATION START ===');
        console.log('Request Body:', { customerId, accountId, companyName, quantity, pricePerShare });

        const totalAmount = parseFloat(quantity) * parseFloat(pricePerShare);

        // Check if account has sufficient balance (Balance - Blocked)
        const account = await Account.findByPk(accountId, { transaction });
        if (!account) {
            console.error(`Apply IPO: Account ${accountId} not found`);
            await transaction.rollback();
            return res.status(404).json({ error: 'Account not found' });
        }

        console.log(`Apply IPO: Using account ${accountId} - ${account.bankName} ${account.accountNumber}`);

        // Calculate available balance considering blocked amount
        const currentBlocked = parseFloat(account.blockedAmount || 0);
        const currentHeld = parseFloat(account.heldBalance || 0);
        const Balance = parseFloat(account.balance || 0);
        // Available = Balance - (Blocked + Held) 
        // Note: Model virtual might only subtract Held, but we must subtract both for safety
        const availableBalance = Balance - (currentBlocked + currentHeld);

        if (availableBalance < totalAmount) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Insufficient available funds' });
        }

        // Check for existing application (any status except rejected)
        const existingApplication = await IPOApplication.findOne({
            where: {
                customerId,
                companyName,
                status: { [Op.ne]: 'rejected' }
            },
            transaction
        });

        if (existingApplication) {
            await transaction.rollback();
            return res.status(400).json({ error: 'You have already applied for this IPO' });
        }

        const application = await IPOApplication.create({
            customerId,
            accountId, // Save the selected account ID
            companyName,
            quantity,
            pricePerShare,
            totalAmount,
            status: 'pending'
        }, { transaction });

        // BLOCK FUNDS on Selected Account
        // Update account blocked amount
        await account.update({
            blockedAmount: currentBlocked + totalAmount
        }, { transaction });

        // Create Informational Transaction for Block (Statement Visibility)
        await Transaction.create({
            accountId,
            transactionType: 'ipo_hold',
            amount: 0, // 0 because funds are blocked, not deducted from ledger balance yet
            description: `Fund Block for IPO: ${companyName}. Amount: ${totalAmount}.`, // Explicitly mention amount in description
            balanceAfter: Balance // Ledger balance remains same
        }, { transaction });

        console.log(`Apply IPO: Funds blocked on Account ${accountId}. Amount: ${totalAmount}. New Blocked: ${currentBlocked + totalAmount}`);

        await transaction.commit();

        // Convert to plain object
        const applicationData = application.toJSON();

        console.log('=== IPO APPLICATION END ===');

        res.status(201).json(applicationData);
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Apply IPO error:', error);
        res.status(500).json({ error: 'Failed to apply for IPO' });
    }
};

export const verifyIPO = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { status } = req.body; // 'verified' or 'rejected'

        const application = await IPOApplication.findByPk(id);
        if (!application) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Application not found' });
        }

        console.log('=== IPO VERIFICATION START ===');
        console.log(`Verifying application ${id} for customer ${application.customerId}`);
        console.log(`Application accountId: ${application.accountId}`);

        // STRICT REQUIREMENT: Application MUST have an accountId
        if (!application.accountId) {
            console.error(`Verify IPO: Application ${id} has NO accountId specified!`);
            await transaction.rollback();
            return res.status(400).json({
                error: 'Invalid application: No bank account specified. Please delete and recreate this application.'
            });
        }

        // Find ONLY the account specified in the application - NO FALLBACK TO PRIMARY
        const account = await Account.findByPk(application.accountId);

        if (!account) {
            console.error(`Verify IPO: Account ${application.accountId} not found in database!`);
            await transaction.rollback();
            return res.status(400).json({
                error: `Selected bank account (ID: ${application.accountId}) not found. It may have been deleted.`
            });
        }

        // Verify the account belongs to the customer (security check)
        if (account.customerId !== application.customerId) {
            console.error(`Verify IPO: Account ${account.id} does NOT belong to customer ${application.customerId}!`);
            await transaction.rollback();
            return res.status(400).json({
                error: 'Security error: Account does not belong to this customer.'
            });
        }

        console.log(`Verify IPO: Using account ${account.id} - Bank: ${account.bankName}, Account#: ${account.accountNumber}`);
        console.log(`Verify IPO: Account balance: ${account.balance}, Blocked: ${account.blockedAmount || 0}, Held: ${account.heldBalance || 0}`);
        console.log(`Verify IPO: CONFIRMED - This is ${account.isPrimary ? 'PRIMARY' : 'SECONDARY'} account`);

        if (status === 'verified') {
            // Check available balance (balance - heldBalance)
            const currentBalance = parseFloat(account.balance);
            const currentHeld = parseFloat(account.heldBalance || 0);
            const availableBalance = currentBalance - currentHeld;

            const ipoAmount = parseFloat(application.totalAmount);

            // Check if bank charges CASBA
            // Normalize names for comparison (trim + uppercase)
            const normalizedBankName = account.bankName.trim().toUpperCase();

            // Try to find exact or case-insensitive match
            const bankConfig = await BankConfiguration.findOne({
                where: sequelize.where(
                    sequelize.fn('upper', sequelize.col('bank_name')),
                    normalizedBankName
                )
            });

            console.log(`Verify IPO: Checking CASBA for bank '${account.bankName}' (Normalized: '${normalizedBankName}'). Config Found: ${!!bankConfig}, Active: ${bankConfig?.isActive}, Charges: ${bankConfig?.chargesCasba}`);

            const chargesCasba = (bankConfig?.isActive && bankConfig?.chargesCasba) || false;
            // Strict logic: If chargesCasba is false, amount is 0. If true, use configured amount (default 5)
            const casbaAmount = chargesCasba ? parseFloat(bankConfig?.casbaAmount || 5.00) : 0;

            console.log(`Verify IPO: CASBA Amount determined: ${casbaAmount}`);

            if (!bankConfig) {
                console.warn(`Verify IPO: No Bank Configuration found for '${normalizedBankName}'. CASBA charge will be 0.`);
            }

            const totalNeeded = ipoAmount + casbaAmount;

            if (availableBalance < totalNeeded) {
                await transaction.rollback();
                return res.status(400).json({
                    error: `Insufficient funds. Need NPR ${casbaAmount} for CASBA charge + NPR ${ipoAmount} for application.`
                });
            }

            // Atomic update: Deduct charge from balance, Increase held amount, Release Blocked Amount (from Apply phase)
            console.log(`Verify IPO: UPDATING ACCOUNT ${account.id} - Before: Balance=${currentBalance}, Held=${currentHeld}, Blocked=${account.blockedAmount}`);
            console.log(`Verify IPO: Changes - Deducting CASBA=${casbaAmount}, Adding to Held=${ipoAmount}, Releasing Blocked=${ipoAmount}`);

            const currentBlocked = parseFloat(account.blockedAmount || 0);

            await account.update({
                balance: currentBalance - casbaAmount,
                heldBalance: currentHeld + ipoAmount,
                blockedAmount: Math.max(0, currentBlocked - ipoAmount) // Release the block placed during Apply
            }, { transaction });

            console.log(`Verify IPO: UPDATED ACCOUNT ${account.id} - After: Balance=${currentBalance - casbaAmount}, Held=${currentHeld + ipoAmount}`);

            // Handle CASBA Transaction only if amount > 0
            if (casbaAmount > 0) {
                // Create debit transaction for customer
                await Transaction.create({
                    accountId: account.id,
                    transactionType: 'fee_deduction',
                    amount: -casbaAmount,
                    description: `IPO application: ${application.companyName}`, // Updated description per user request
                    balanceAfter: currentBalance - casbaAmount // Logic balance after deduction
                }, { transaction });

                // Credit CASBA Collection Account
                const casbaAccount = await SpecialAccount.findOne({
                    where: { accountNumber: '1115240001' },
                    transaction // Ensure transaction is used
                });

                if (casbaAccount) {
                    console.log(`Verify IPO: Crediting CASBA Collection Account ${casbaAccount.accountNumber}`);
                    await casbaAccount.increment('balance', { by: casbaAmount, transaction });
                } else {
                    console.error('Verify IPO: CASBA Collection Account 1115240001 NOT FOUND!');
                }
            }

            // Update application status
            await application.update({
                status: 'verified',
                verifiedBy: req.user.id
            }, { transaction });

        } else if (status === 'rejected') {
            await application.update({
                status: 'rejected',
                verifiedBy: req.user.id
            }, { transaction });
        }

        console.log(`Verify IPO: Application ${id} ${status === 'verified' ? 'VERIFIED' : 'REJECTED'} successfully`);
        console.log('=== IPO VERIFICATION END ===');

        await transaction.commit();
        res.json(application);
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Verify IPO error:', error);
        res.status(500).json({ error: 'Failed to verify IPO' });
    }
};

export const getIPOApplications = async (req, res) => {
    try {
        const { customerId } = req.query;
        const whereClause = customerId ? { customerId } : {};

        const applications = await IPOApplication.findAll({
            where: whereClause,
            include: [
                { association: 'customer', attributes: ['fullName', 'customerId'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(applications);
    } catch (error) {
        console.error('Get IPOs error:', error);
        res.status(500).json({ error: 'Failed to fetch IPO applications' });
    }
};

export const createIPOListing = async (req, res) => {
    try {
        const {
            companyName,
            scripName,
            pricePerShare,
            totalShares,
            openDate,
            closeDate,
            openTime,
            closeTime,
            allotmentDate,
            allotmentTime,
            resultPublishDate,
            resultPublishTime,
            description,
            status
        } = req.body;

        console.log('Received IPO payload:', req.body);

        // Sanitization helper: Convert empty strings to null
        const sanitize = (val) => (val === '' || val === undefined ? null : val);

        const sanitizedData = {
            openDate: sanitize(openDate),
            closeDate: sanitize(closeDate),
            openTime: sanitize(openTime),
            closeTime: sanitize(closeTime),
            allotmentDate: sanitize(allotmentDate),
            allotmentTime: sanitize(allotmentTime),
            resultPublishDate: sanitize(resultPublishDate),
            resultPublishTime: sanitize(resultPublishTime),
            totalShares: sanitize(totalShares)
        };

        // Validate required fields explicitly to avoid DB errors
        if (!companyName || !sanitizedData.openDate || !pricePerShare) {
            return res.status(400).json({ error: 'Missing required fields: Company Name, Open Date, or Price' });
        }

        // Auto-generate scrip name if not provided (from company name)
        const finalScripName = scripName || companyName.substring(0, 20).toUpperCase().replace(/\s+/g, '_');

        const listing = await IPOListing.create({
            companyName,
            scripName: finalScripName,
            pricePerShare,
            totalShares: sanitizedData.totalShares,
            openDate: sanitizedData.openDate,
            closeDate: sanitizedData.closeDate,
            openTime: sanitizedData.openTime,
            closeTime: sanitizedData.closeTime,
            allotmentDate: sanitizedData.allotmentDate,
            allotmentTime: sanitizedData.allotmentTime,
            resultPublishDate: sanitizedData.resultPublishDate,
            resultPublishTime: sanitizedData.resultPublishTime,
            description,
            status: status || 'upcoming'
        });

        res.status(201).json(listing);
    } catch (error) {
        console.error('Create IPO Listing error:', error);
        console.error('Error details:', error.message);
        res.status(500).json({ error: 'Failed to create IPO listing', details: error.message });
    }
};

export const getIPOListings = async (req, res) => {
    try {
        const listings = await IPOListing.findAll({
            order: [['created_at', 'DESC']]
        });
        res.json(listings);
    } catch (error) {
        console.error('Get IPO Listings error:', error);
        res.status(500).json({ error: 'Failed to fetch IPO listings' });
    }
};

export const getOpenIPOListings = async (req, res) => {
    try {
        const listings = await IPOListing.findAll({
            where: { status: 'open' },
            order: [['created_at', 'DESC']]
        });
        res.json(listings);
    } catch (error) {
        console.error('Get Open IPO Listings error:', error);
        res.status(500).json({ error: 'Failed to fetch open IPO listings' });
    }
};

export const updateIPOStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const listing = await IPOListing.findByPk(id);
        if (!listing) {
            return res.status(404).json({ error: 'IPO listing not found' });
        }

        listing.status = status;
        await listing.save();

        res.json(listing);
    } catch (error) {
        console.error('Update IPO Status error:', error);
        res.status(500).json({ error: 'Failed to update IPO status' });
    }
};

export const updateIPOListing = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const listing = await IPOListing.findByPk(id);
        if (!listing) {
            return res.status(404).json({ error: 'IPO listing not found' });
        }

        // Allow updating fields
        await listing.update(updates);

        res.json(listing);
    } catch (error) {
        console.error('Update IPO Listing error:', error);
        console.error('Error details:', error.message);
        res.status(500).json({ error: 'Failed to update IPO listing', details: error.message });
    }
};

export const bulkApplyIPO = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { ipoListingId, applications } = req.body; // applications: [{ customerId, quantity }]

        const listing = await IPOListing.findByPk(ipoListingId);
        if (!listing) {
            await transaction.rollback();
            return res.status(404).json({ error: 'IPO listing not found' });
        }

        const results = [];
        const errors = [];

        for (const app of applications) {
            const { customerId, quantity } = app;

            try {
                // Find primary account
                const account = await Account.findOne({
                    where: { customerId, isPrimary: true }
                });

                if (!account) {
                    errors.push({ customerId, error: 'No primary account found' });
                    continue;
                }

                const totalAmount = parseFloat(quantity) * parseFloat(listing.pricePerShare);
                const availableBalance = parseFloat(account.balance) - parseFloat(account.blockedAmount);

                if (availableBalance < totalAmount) {
                    errors.push({ customerId, error: 'Insufficient funds' });
                    continue;
                }

                // Create application
                const application = await IPOApplication.create({
                    customerId,
                    companyName: listing.companyName,
                    quantity,
                    pricePerShare: listing.pricePerShare,
                    totalAmount,
                    status: 'pending'
                }, { transaction });

                results.push(application);
            } catch (err) {
                errors.push({ customerId, error: err.message });
            }
        }

        await transaction.commit();
        res.status(201).json({ success: results, errors });
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Bulk IPO error:', error);
        res.status(500).json({ error: 'Failed to process bulk IPO applications' });
    }
};

// Update IPO Application
export const updateIPOApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body; // e.g., { quantity: 100, totalAmount: 10000 }
        const application = await IPOApplication.findByPk(id);

        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        if (req.user.role === 'maker') {
            await ModificationRequest.create({
                targetModel: 'IPOApplication',
                targetId: id,
                requestedChanges: updates,
                changeType: 'update',
                status: 'pending',
                requestedBy: req.user.id
            });
            return res.json({ message: 'Modification request submitted for approval', pending: true });
        }

        // Admin direct update logic
        await application.update(updates);
        res.json(application);
    } catch (error) {
        console.error('Update IPO error:', error);
        res.status(500).json({ error: 'Failed to update IPO application' });
    }
};

// Delete IPO Application
export const deleteIPOApplication = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const application = await IPOApplication.findByPk(id);

        if (!application) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Application not found' });
        }

        if (req.user.role === 'maker') {
            await transaction.commit(); // No db changes yet
            await ModificationRequest.create({
                targetModel: 'IPOApplication',
                targetId: id,
                requestedChanges: {}, // No changes, just delete
                changeType: 'delete',
                status: 'pending',
                requestedBy: req.user.id
            });
            return res.json({ message: 'Deletion request submitted for approval', pending: true });
        }

        // Direct delete (Admin)
        // Unblock funds if verified
        if (application.status === 'verified') {
            // FIX: Use application.accountId if present, otherwise fallback to primary
            let account;
            if (application.accountId) {
                account = await Account.findByPk(application.accountId);
            }

            if (!account) {
                account = await Account.findOne({
                    where: { customerId: application.customerId, isPrimary: true }
                });
            }

            if (account) {
                account.blockedAmount = Math.max(0, parseFloat(account.blockedAmount) - parseFloat(application.totalAmount));
                await account.save({ transaction });
            }
        }

        await application.destroy({ transaction });
        await transaction.commit();
        res.json({ message: 'IPO application deleted' });
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Delete IPO error:', error);
        res.status(500).json({ error: 'Failed to delete IPO application' });
    }
};


// Delete IPO Listing (Admin only)
export const deleteIPOListing = async (req, res) => {
    try {
        const { id } = req.params;

        const listing = await IPOListing.findByPk(id);
        if (!listing) {
            return res.status(404).json({ error: 'IPO listing not found' });
        }

        // Check if there are any applications
        const applicationCount = await IPOApplication.count({
            where: { ipoListingId: id }
        });

        if (applicationCount > 0) {
            return res.status(400).json({
                error: 'Cannot delete IPO listing with existing applications. Please reject/delete applications first.'
            });
        }

        await listing.destroy();

        res.json({ message: 'IPO listing deleted successfully' });
    } catch (error) {
        console.error('Delete IPO listing error:', error);
        res.status(500).json({ error: 'Failed to delete IPO listing' });
    }
};


// Close IPO Listing
export const closeIPO = async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await IPOListing.findByPk(id);

        if (!listing) {
            return res.status(404).json({ error: 'IPO listing not found' });
        }

        listing.status = 'closed';
        await listing.save();

        res.json({ message: 'IPO closed successfully', listing });
    } catch (error) {
        console.error('Close IPO error:', error);
        res.status(500).json({ error: 'Failed to close IPO' });
    }
};

// Process IPO Allotment (Single Application)
export const processAllotment = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { status, allottedQuantity } = req.body; // status: 'allotted' or 'not_allotted'

        const application = await IPOApplication.findByPk(id, {
            include: [{ model: IPOListing, as: 'listing' }]
        });

        if (!application) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Application not found' });
        }

        if (application.status !== 'verified') {
            await transaction.rollback();
            return res.status(400).json({ error: 'Application must be verified before allotment' });
        }

        // Find primary account
        let account = await Account.findByPk(application.accountId);
        if (!account) {
            account = await Account.findOne({
                where: { customerId: application.customerId, isPrimary: true }
            });
        }

        if (!account) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Customer account not found' });
        }

        const currentHeld = parseFloat(account.heldBalance || 0);
        const currentBalance = parseFloat(account.balance);
        const appliedAmount = parseFloat(application.totalAmount);

        if (status === 'allotted') {
            const quantity = parseInt(allottedQuantity) || application.quantity;
            const price = parseFloat(application.pricePerShare);
            const totalCost = quantity * price;

            if (totalCost > currentHeld) {
                await transaction.rollback();
                return res.status(400).json({ error: 'Allotted amount exceeds held balance' });
            }

            const remainingHeld = appliedAmount - totalCost;

            await account.update({
                balance: currentBalance + remainingHeld,
                heldBalance: currentHeld - appliedAmount
            }, { transaction });

            await Transaction.create({
                accountId: account.id,
                transactionType: 'ipo_allotment',
                amount: -totalCost,
                description: `IPO Allotment - ${application.companyName} (${quantity} shares)`,
                balanceAfter: currentBalance + remainingHeld
            }, { transaction });

            if (remainingHeld > 0) {
                await Transaction.create({
                    accountId: account.id,
                    transactionType: 'ipo_release',
                    amount: remainingHeld,
                    description: `IPO Refund - ${application.companyName} (Partial)`,
                    balanceAfter: currentBalance + remainingHeld
                }, { transaction });
            }

            let portfolio = await Portfolio.findOne({ where: { customerId: application.customerId } });
            if (!portfolio) {
                portfolio = await Portfolio.create({
                    portfolioId: `PF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    customerId: application.customerId,
                    totalValue: 0,
                    totalInvestment: 0,
                    profitLoss: 0
                }, { transaction });
            }

            const scripName = application.listing ? application.listing.scripName : application.companyName;

            await Holding.create({
                holdingId: `HLD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                portfolioId: portfolio.id,
                stockSymbol: scripName,
                companyName: application.companyName,
                quantity: quantity,
                purchasePrice: price,
                currentPrice: price,
                profitLossPercent: 0
            }, { transaction });

            await portfolio.increment({
                totalInvestment: totalCost,
                totalValue: totalCost
            }, { transaction });

            await application.update({
                status: 'allotted',
                allotmentStatus: 'allotted',
                allotmentQuantity: quantity,
                allotmentDate: new Date()
            }, { transaction });

        } else {
            // Not Allotted
            await account.update({
                balance: currentBalance + appliedAmount,
                heldBalance: currentHeld - appliedAmount
            }, { transaction });

            await Transaction.create({
                accountId: account.id,
                transactionType: 'ipo_release',
                amount: appliedAmount,
                description: `IPO Refund - ${application.companyName} (Not Allotted)`,
                balanceAfter: currentBalance + appliedAmount
            }, { transaction });

            await application.update({
                status: 'allotted', // Completed state
                allotmentStatus: 'not_allotted',
                allotmentQuantity: 0,
                allotmentDate: new Date()
            }, { transaction });
        }

        await transaction.commit();
        res.json({ message: 'Allotment processed successfully', application });

    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Allotment error:', error);
        res.status(500).json({ error: 'Failed to process allotment' });
    }
};
