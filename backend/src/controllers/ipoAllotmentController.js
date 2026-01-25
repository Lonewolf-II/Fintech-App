import { IPOApplication, IPOListing, Account, Customer, Transaction, Holding, Portfolio, Investment, sequelize } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Process IPO allotment for verified applications
 * POST /api/ipo/applications/:id/allot
 */
export const allotIPOApplication = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { allotmentQuantity, allotmentStatus } = req.body; // 'allotted' or 'not_allotted'

        const application = await IPOApplication.findByPk(id, {
            include: [
                { association: 'customer' },
                { association: 'listing' }
            ]
        });

        if (!application) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Application not found' });
        }

        if (application.status !== 'verified') {
            await transaction.rollback();
            return res.status(400).json({ error: 'Only verified applications can be allotted' });
        }

        // ALLOTMENT LOGIC: STRICT ACCOUNT USAGE
        // Use specifically linked account from application
        const account = await Account.findByPk(application.accountId);

        if (!account) {
            await transaction.rollback();
            return res.status(400).json({ error: 'No linked account found for this application. Cannot process allotment.' });
        }

        if (allotmentStatus === 'allotted') {
            // Validate allotment quantity
            if (!allotmentQuantity || allotmentQuantity <= 0 || allotmentQuantity > application.quantity) {
                await transaction.rollback();
                return res.status(400).json({ error: 'Invalid allotment quantity' });
            }

            const allottedAmount = parseFloat(allotmentQuantity) * parseFloat(application.pricePerShare);
            const refundAmount = parseFloat(application.totalAmount) - allottedAmount;

            // Deduct allotted amount from balance and release held balance
            await account.update({
                balance: parseFloat(account.balance) - allottedAmount,
                heldBalance: parseFloat(account.heldBalance || 0) - parseFloat(application.totalAmount)
            }, { transaction });

            // If partial allotment, add refund back to balance (NO transaction created)
            if (refundAmount > 0) {
                await account.update({
                    balance: parseFloat(account.balance) + refundAmount
                }, { transaction });
            }

            // Create SINGLE transaction for IPO allotment
            await Transaction.create({
                transactionId: `TXN-IPO-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                accountId: account.id,
                transactionType: 'ipo_allotment',
                amount: -allottedAmount,
                balanceAfter: parseFloat(account.balance),
                description: `IPO Allotment - ${application.companyName}`,
                referenceId: application.id,
                referenceType: 'IPOApplication',
                createdBy: req.user.id
            }, { transaction });

            // Get or create portfolio
            let portfolio = await Portfolio.findOne({
                where: { customerId: application.customerId }
            });

            if (!portfolio) {
                portfolio = await Portfolio.create({
                    portfolioId: `PORT-${application.customerId}-${Date.now()}`,
                    customerId: application.customerId,
                    totalValue: 0.00,
                    totalInvestment: 0.00,
                    profitLoss: 0.00
                }, { transaction });
            }

            // Get listing to use scrip name
            const listing = await IPOListing.findByPk(application.ipoListingId);
            const scripName = listing?.scripName || application.companyName.toUpperCase().replace(/\s+/g, '');

            // Create holding
            await Holding.create({
                holdingId: `HOLD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                portfolioId: portfolio.id,
                stockSymbol: scripName,
                companyName: application.companyName,
                quantity: allotmentQuantity,
                purchasePrice: application.pricePerShare,
                currentPrice: application.pricePerShare,
                lastClosingPrice: application.pricePerShare,
                lastTransactionPrice: application.pricePerShare,
                profitLossPercent: 0.00,
                purchaseDate: new Date()
            }, { transaction });

            // Update application
            await application.update({
                status: 'allotted',
                allotmentStatus: 'allotted',
                allotmentQuantity,
                allotmentDate: new Date()
            }, { transaction });

        } else if (allotmentStatus === 'not_allotted') {
            // Release held funds - NO transaction created
            await account.update({
                heldBalance: parseFloat(account.heldBalance || 0) - parseFloat(application.totalAmount)
            }, { transaction });

            // Update application
            await application.update({
                status: 'allotted', // Status becomes allotted (process complete)
                allotmentStatus: 'not_allotted',
                allotmentQuantity: 0,
                allotmentDate: new Date()
            }, { transaction });
        }

        await transaction.commit();

        const updatedApplication = await IPOApplication.findByPk(id, {
            include: [
                { association: 'customer' },
                { association: 'listing' }
            ]
        });

        res.json(updatedApplication);
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Allot IPO error:', error);
        res.status(500).json({ error: 'Failed to process allotment', details: error.message });
    }
};

/**
 * Get IPO applications with filtering
 * GET /api/ipo/applications?status=verified&customerId=123
 */
export const getIPOApplicationsEnhanced = async (req, res) => {
    try {
        const { customerId, status, ipoListingId } = req.query;
        const whereClause = {};

        if (customerId) whereClause.customerId = customerId;
        if (status) whereClause.status = status;
        if (ipoListingId) whereClause.ipoListingId = ipoListingId;

        const applications = await IPOApplication.findAll({
            where: whereClause,
            include: [
                {
                    association: 'customer',
                    attributes: ['id', 'customerId', 'fullName', 'email', 'phone']
                },
                {
                    association: 'listing',
                    attributes: ['id', 'companyName', 'pricePerShare', 'openDate', 'closeDate', 'status']
                },
                {
                    association: 'applier',
                    attributes: ['id', 'name']
                },
                {
                    association: 'verifier',
                    attributes: ['id', 'name']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json(applications);
    } catch (error) {
        console.error('Get IPO applications error:', error);
        res.status(500).json({ error: 'Failed to fetch IPO applications' });
    }
};

/**
 * Get IPO statistics
 * GET /api/ipo/stats
 */
export const getIPOStats = async (req, res) => {
    try {
        const totalApplications = await IPOApplication.count();
        const pendingApplications = await IPOApplication.count({ where: { status: 'pending' } });
        const verifiedApplications = await IPOApplication.count({ where: { status: 'verified' } });
        const allottedApplications = await IPOApplication.count({ where: { status: 'allotted' } });

        const totalFundsBlocked = await IPOApplication.sum('totalAmount', {
            where: { status: 'verified' }
        }) || 0;

        const totalFundsAllotted = await IPOApplication.sum('totalAmount', {
            where: { status: 'allotted', allotmentStatus: 'allotted' }
        }) || 0;

        res.json({
            totalApplications,
            pendingApplications,
            verifiedApplications,
            allottedApplications,
            totalFundsBlocked: parseFloat(totalFundsBlocked).toFixed(2),
            totalFundsAllotted: parseFloat(totalFundsAllotted).toFixed(2)
        });
    } catch (error) {
        console.error('Get IPO stats error:', error);
        res.status(500).json({ error: 'Failed to fetch IPO statistics' });
    }
};
