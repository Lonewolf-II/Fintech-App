import { Customer, Account, IPOApplication, Investor, SpecialAccount, Transaction, ProfitDistribution, sequelize } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Get comprehensive admin dashboard statistics
 * GET /api/admin/dashboard/stats
 */
export const getDashboardStats = async (req, res) => {
    try {
        // Customer Statistics
        const totalCustomers = await Customer.count();
        const verifiedCustomers = await Customer.count({ where: { kycStatus: 'verified' } });
        const pendingKYC = await Customer.count({ where: { kycStatus: 'pending' } });

        // Account Statistics
        const totalAccounts = await Account.count();
        const activeAccounts = await Account.count({ where: { status: 'active' } });

        const totalBalance = await Account.sum('balance') || 0;
        const totalBlockedAmount = await Account.sum('blockedAmount') || 0;
        const availableBalance = totalBalance - totalBlockedAmount;

        // IPO Statistics
        const totalIPOApplications = await IPOApplication.count();
        const pendingApplications = await IPOApplication.count({ where: { status: 'pending' } });
        const verifiedApplications = await IPOApplication.count({ where: { status: 'verified' } });
        const allottedApplications = await IPOApplication.count({ where: { status: 'allotted' } });

        const totalFundsHeld = await IPOApplication.sum('totalAmount', {
            where: { status: 'verified' }
        }) || 0;

        // Investor Statistics
        const totalInvestors = await Investor.count();
        const activeInvestors = await Investor.count({ where: { status: 'active' } });

        const totalInvestorCapital = await Investor.sum('totalCapital') || 0;
        const totalInvestedAmount = await Investor.sum('investedAmount') || 0;
        const totalInvestorProfit = await Investor.sum('totalProfit') || 0;

        // Special Accounts
        const officeAccount = await SpecialAccount.findOne({
            where: { accountType: 'office' },
            attributes: ['accountNumber', 'balance']
        });

        const investorAccountsBalance = await SpecialAccount.sum('balance', {
            where: { accountType: 'investor' }
        }) || 0;

        // Profit Distribution Statistics
        const totalDistributions = await ProfitDistribution.count();
        const totalProfitDistributed = await ProfitDistribution.sum('totalProfit') || 0;
        const totalFeesCollected = await ProfitDistribution.sum('feesDeducted') || 0;

        // Recent Activity (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const newCustomersLast30Days = await Customer.count({
            where: {
                createdAt: {
                    [Op.gte]: thirtyDaysAgo
                }
            }
        });

        const newApplicationsLast30Days = await IPOApplication.count({
            where: {
                createdAt: {
                    [Op.gte]: thirtyDaysAgo
                }
            }
        });

        // Transaction Statistics
        const totalTransactions = await Transaction.count();
        const recentTransactions = await Transaction.count({
            where: {
                createdAt: {
                    [Op.gte]: thirtyDaysAgo
                }
            }
        });

        res.json({
            customers: {
                total: totalCustomers,
                verified: verifiedCustomers,
                pendingKYC,
                newLast30Days: newCustomersLast30Days
            },
            accounts: {
                total: totalAccounts,
                active: activeAccounts,
                totalBalance: parseFloat(totalBalance).toFixed(2),
                blockedAmount: parseFloat(totalBlockedAmount).toFixed(2),
                availableBalance: parseFloat(availableBalance).toFixed(2)
            },
            ipo: {
                totalApplications: totalIPOApplications,
                pending: pendingApplications,
                verified: verifiedApplications,
                allotted: allottedApplications,
                fundsHeld: parseFloat(totalFundsHeld).toFixed(2),
                newApplicationsLast30Days
            },
            investors: {
                total: totalInvestors,
                active: activeInvestors,
                totalCapital: parseFloat(totalInvestorCapital).toFixed(2),
                invested: parseFloat(totalInvestedAmount).toFixed(2),
                available: parseFloat(totalInvestorCapital - totalInvestedAmount).toFixed(2),
                totalProfit: parseFloat(totalInvestorProfit).toFixed(2)
            },
            specialAccounts: {
                office: {
                    accountNumber: officeAccount?.accountNumber || 'N/A',
                    balance: parseFloat(officeAccount?.balance || 0).toFixed(2)
                },
                investorAccounts: {
                    totalBalance: parseFloat(investorAccountsBalance).toFixed(2)
                }
            },
            profitDistribution: {
                totalDistributions,
                totalProfit: parseFloat(totalProfitDistributed).toFixed(2),
                feesCollected: parseFloat(totalFeesCollected).toFixed(2)
            },
            transactions: {
                total: totalTransactions,
                last30Days: recentTransactions
            }
        });

    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics', details: error.message });
    }
};

/**
 * Get recent activity feed
 * GET /api/admin/dashboard/activity
 */
export const getRecentActivity = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;

        // Get recent transactions
        const recentTransactions = await Transaction.findAll({
            limit,
            order: [['created_at', 'DESC']],
            include: [
                {
                    association: 'account',
                    attributes: ['accountNumber', 'accountName']
                }
            ]
        });

        // Get recent IPO applications
        const recentApplications = await IPOApplication.findAll({
            limit: 10,
            order: [['created_at', 'DESC']],
            include: [
                {
                    association: 'customer',
                    attributes: ['customerId', 'fullName']
                }
            ]
        });

        // Get recent customers
        const recentCustomers = await Customer.findAll({
            limit: 10,
            order: [['created_at', 'DESC']],
            attributes: ['id', 'customerId', 'fullName', 'email', 'kycStatus', 'createdAt']
        });

        // Fix: Ensure timestamps are serialized correctly
        const mapTimestamps = (items) => items.map(item => {
            const data = item.toJSON();
            if (!data.createdAt && (item.dataValues?.created_at || item['created_at'])) {
                data.createdAt = item.dataValues?.created_at || item['created_at'];
            }
            return data;
        });

        res.json({
            recentTransactions: mapTimestamps(recentTransactions),
            recentApplications: mapTimestamps(recentApplications),
            recentCustomers: mapTimestamps(recentCustomers)
        });

    } catch (error) {
        console.error('Get recent activity error:', error);
        res.status(500).json({ error: 'Failed to fetch recent activity' });
    }
};

/**
 * Get special accounts overview
 * GET /api/admin/special-accounts
 */
export const getSpecialAccountsOverview = async (req, res) => {
    try {
        const specialAccounts = await SpecialAccount.findAll({
            include: [
                {
                    association: 'investor',
                    attributes: ['id', 'investorId', 'name']
                }
            ],
            order: [['account_type', 'ASC'], ['created_at', 'DESC']]
        });

        // Group by type
        const officeAccounts = specialAccounts.filter(acc => acc.accountType === 'office');
        const investorAccounts = specialAccounts.filter(acc => acc.accountType === 'investor');

        res.json({
            office: officeAccounts,
            investors: investorAccounts,
            summary: {
                totalOfficeBalance: officeAccounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0).toFixed(2),
                totalInvestorBalance: investorAccounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0).toFixed(2)
            }
        });

    } catch (error) {
        console.error('Get special accounts error:', error);
        res.status(500).json({ error: 'Failed to fetch special accounts' });
    }
};

/**
 * Withdraw from office account
 * POST /api/admin/special-accounts/office/withdraw
 */
export const withdrawFromOfficeAccount = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { amount, description } = req.body;

        if (!amount || amount <= 0) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Invalid withdrawal amount' });
        }

        const officeAccount = await SpecialAccount.findOne({
            where: { accountType: 'office' }
        });

        if (!officeAccount) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Office account not found' });
        }

        if (parseFloat(officeAccount.balance) < parseFloat(amount)) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Insufficient balance in office account' });
        }

        // Update balance
        await officeAccount.update({
            balance: parseFloat(officeAccount.balance) - parseFloat(amount)
        }, { transaction });

        // Create transaction record
        await Transaction.create({
            transactionId: `TXN-WITHDRAW-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            accountId: officeAccount.id,
            transactionType: 'withdrawal',
            amount: -parseFloat(amount),
            balanceAfter: parseFloat(officeAccount.balance) - parseFloat(amount),
            description: description || 'Office account withdrawal',
            createdBy: req.user.id
        }, { transaction });

        await transaction.commit();

        res.json({
            message: 'Withdrawal successful',
            newBalance: parseFloat(officeAccount.balance).toFixed(2)
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Withdraw from office account error:', error);
        res.status(500).json({ error: 'Failed to process withdrawal', details: error.message });
    }
};
