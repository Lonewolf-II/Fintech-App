import { IPOApplication, Account, Customer, IPOListing, ModificationRequest, sequelize } from '../models/index.js';
import { Op } from 'sequelize';

export const applyIPO = async (req, res) => {
    try {
        const { customerId, accountId, companyName, quantity, pricePerShare } = req.body;

        const totalAmount = parseFloat(quantity) * parseFloat(pricePerShare);

        // Check if account has sufficient balance (Balance - Blocked)
        const account = await Account.findByPk(accountId);
        if (!account) {
            return res.status(404).json({ error: 'Account not found' });
        }

        const availableBalance = parseFloat(account.balance) - parseFloat(account.blockedAmount);

        if (availableBalance < totalAmount) {
            return res.status(400).json({ error: 'Insufficient available funds' });
        }

        // Check for existing application (any status except rejected)
        const existingApplication = await IPOApplication.findOne({
            where: {
                customerId,
                companyName,
                status: { [Op.ne]: 'rejected' }
            }
        });

        if (existingApplication) {
            return res.status(400).json({ error: 'You have already applied for this IPO' });
        }

        const application = await IPOApplication.create({
            customerId,
            companyName,
            quantity,
            pricePerShare,
            totalAmount,
            status: 'pending'
        });

        res.status(201).json(application);
    } catch (error) {
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

        // Simplification: We assume the account ID is passed or we find the primary account/linked account.
        // For strictness, IPOApplication should probably store accountId, but for now we look up the customer's primary account.
        const account = await Account.findOne({
            where: { customerId: application.customerId, isPrimary: true }
        });

        if (!account) {
            await transaction.rollback();
            return res.status(400).json({ error: 'No primary account found for customer' });
        }

        if (status === 'verified') {
            // Re-check balance
            const availableBalance = parseFloat(account.balance) - parseFloat(account.blockedAmount);
            if (availableBalance < parseFloat(application.totalAmount)) {
                await transaction.rollback();
                return res.status(400).json({ error: 'Insufficient funds for verification' });
            }

            // Block amount
            await account.update({
                blockedAmount: parseFloat(account.blockedAmount) + parseFloat(application.totalAmount)
            }, { transaction });

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
        const { companyName, pricePerShare, totalShares, openDate, closeDate, description } = req.body;

        const listing = await IPOListing.create({
            companyName,
            pricePerShare,
            totalShares,
            openDate,
            closeDate,
            description,
            status: 'upcoming'
        });

        res.status(201).json(listing);
    } catch (error) {
        console.error('Create IPO Listing error:', error);
        res.status(500).json({ error: 'Failed to create IPO listing' });
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
            const account = await Account.findOne({
                where: { customerId: application.customerId, isPrimary: true }
            });
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
