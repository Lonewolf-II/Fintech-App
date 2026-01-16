import { ProfitDistribution, Investment, Fee, SpecialAccount, Transaction, Account, sequelize } from '../models/index.js';

/**
 * Calculate and distribute profit from share sale
 * POST /api/profit-distribution/calculate
 */
export const calculateProfitDistribution = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const {
            investmentId,
            saleQuantity,
            salePrice,
            saleDate
        } = req.body;

        // Get investment details
        const investment = await Investment.findByPk(investmentId, {
            include: [
                { association: 'investor' },
                { association: 'customer' },
                { association: 'account' }
            ]
        });

        if (!investment) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Investment not found' });
        }

        // Calculate sale proceeds
        const saleAmount = parseFloat(saleQuantity) * parseFloat(salePrice);
        const costPerShare = parseFloat(investment.costPerShare);
        const principalAmount = parseFloat(saleQuantity) * costPerShare;
        const totalProfit = saleAmount - principalAmount;

        // 60-40 split
        const investorShare = totalProfit * 0.60;
        const adminShare = totalProfit * 0.40;

        // Get pending fees for this customer
        const pendingFees = await Fee.findAll({
            where: {
                customerId: investment.customerId,
                status: 'pending'
            }
        });

        const totalPendingFees = pendingFees.reduce((sum, fee) => sum + parseFloat(fee.amount), 0);

        // Deduct fees from admin's 40% share
        const feesDeducted = Math.min(adminShare, totalPendingFees);
        const customerShare = adminShare - feesDeducted;

        // Create profit distribution record
        const distribution = await ProfitDistribution.create({
            investmentId,
            sharesSold: saleQuantity,
            salePricePerShare: salePrice,
            totalSaleAmount: saleAmount,
            principalReturned: principalAmount,
            totalProfit,
            investorShare,
            // adminShare is ignored as it's not in the model
            adminFee: feesDeducted,
            customerShare,
            distributedAt: saleDate || new Date(),
            createdBy: req.user.id
        }, { transaction });

        // Get accounts
        const customerAccount = await Account.findByPk(investment.accountId);
        const investorSpecialAccount = await SpecialAccount.findOne({
            where: { investorId: investment.investorId }
        });
        const officeAccount = await SpecialAccount.findOne({
            where: { accountType: 'office' }
        });

        if (!customerAccount || !investorSpecialAccount || !officeAccount) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Required accounts not found' });
        }

        // 1. Return principal to customer account
        await customerAccount.update({
            balance: parseFloat(customerAccount.balance) + principalAmount
        }, { transaction });

        await Transaction.create({
            transactionId: `TXN-PRINCIPAL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            accountId: customerAccount.id,
            transactionType: 'principal_return',
            amount: principalAmount,
            balanceAfter: parseFloat(customerAccount.balance) + principalAmount,
            description: `Principal return from share sale - ${saleQuantity} shares`,
            referenceId: distribution.id,
            referenceType: 'ProfitDistribution',
            createdBy: req.user.id
        }, { transaction });

        // 2. Distribute 60% to investor special account
        await investorSpecialAccount.update({
            balance: parseFloat(investorSpecialAccount.balance) + investorShare
        }, { transaction });

        await Transaction.create({
            transactionId: `TXN-PROFIT-INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            accountId: investorSpecialAccount.id,
            transactionType: 'profit_distribution',
            amount: investorShare,
            balanceAfter: parseFloat(investorSpecialAccount.balance) + investorShare,
            description: `Investor profit share (60%) - Investment #${investmentId}`,
            referenceId: distribution.id,
            referenceType: 'ProfitDistribution',
            createdBy: req.user.id
        }, { transaction });

        // 3. Deduct fees from admin share and send to office account
        if (feesDeducted > 0) {
            await officeAccount.update({
                balance: parseFloat(officeAccount.balance) + feesDeducted
            }, { transaction });

            await Transaction.create({
                transactionId: `TXN-FEE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                accountId: officeAccount.id,
                transactionType: 'fee_deduction',
                amount: feesDeducted,
                balanceAfter: parseFloat(officeAccount.balance) + feesDeducted,
                description: `Fee collection from profit distribution`,
                referenceId: distribution.id,
                referenceType: 'ProfitDistribution',
                createdBy: req.user.id
            }, { transaction });

            // Mark fees as paid
            for (const fee of pendingFees) {
                const feeAmount = parseFloat(fee.amount);
                if (feesDeducted >= feeAmount) {
                    await fee.update({
                        status: 'paid',
                        paidDate: new Date(),
                        paidFromDistribution: true,
                        distributionId: distribution.id
                    }, { transaction });
                }
            }
        }

        // 4. Distribute remaining 40% to customer account
        if (customerShare > 0) {
            await customerAccount.update({
                balance: parseFloat(customerAccount.balance) + customerShare
            }, { transaction });

            await Transaction.create({
                transactionId: `TXN-PROFIT-CUST-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                accountId: customerAccount.id,
                transactionType: 'profit_distribution',
                amount: customerShare,
                balanceAfter: parseFloat(customerAccount.balance) + customerShare,
                description: `Customer profit share (40% after fees)`,
                referenceId: distribution.id,
                referenceType: 'ProfitDistribution',
                createdBy: req.user.id
            }, { transaction });
        }

        await transaction.commit();

        res.status(201).json({
            distribution,
            breakdown: {
                saleAmount,
                principalAmount,
                totalProfit,
                investorShare: investorShare.toFixed(2),
                adminShare: adminShare.toFixed(2),
                feesDeducted: feesDeducted.toFixed(2),
                customerShare: customerShare.toFixed(2)
            }
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Calculate profit distribution error:', error);
        res.status(500).json({ error: 'Failed to calculate profit distribution', details: error.message });
    }
};

/**
 * Get all profit distributions
 * GET /api/profit-distribution
 */
export const getAllDistributions = async (req, res) => {
    try {
        const { investmentId, customerId } = req.query;
        const whereClause = {};

        if (investmentId) whereClause.investmentId = investmentId;

        const distributions = await ProfitDistribution.findAll({
            where: whereClause,
            include: [
                {
                    association: 'investment',
                    include: [
                        { association: 'customer', attributes: ['id', 'customerId', 'fullName'] },
                        { association: 'investor', attributes: ['id', 'investorId', 'name'] }
                    ]
                }
            ],
            order: [['distribution_date', 'DESC']]
        });

        // Filter by customerId if provided
        let filteredDistributions = distributions;
        if (customerId) {
            filteredDistributions = distributions.filter(d =>
                d.investment && d.investment.customerId === parseInt(customerId)
            );
        }

        res.json(filteredDistributions);
    } catch (error) {
        console.error('Get distributions error:', error);
        res.status(500).json({ error: 'Failed to fetch profit distributions' });
    }
};

/**
 * Get profit distribution statistics
 * GET /api/profit-distribution/stats
 */
export const getDistributionStats = async (req, res) => {
    try {
        const totalDistributions = await ProfitDistribution.count();

        const totalProfitDistributed = await ProfitDistribution.sum('totalProfit') || 0;
        const totalInvestorShare = await ProfitDistribution.sum('investorShare') || 0;
        const totalCustomerShare = await ProfitDistribution.sum('customerShare') || 0;
        const totalFeesCollected = await ProfitDistribution.sum('adminFee') || 0;

        res.json({
            totalDistributions,
            totalProfitDistributed: parseFloat(totalProfitDistributed).toFixed(2),
            totalInvestorShare: parseFloat(totalInvestorShare).toFixed(2),
            totalCustomerShare: parseFloat(totalCustomerShare).toFixed(2),
            totalFeesCollected: parseFloat(totalFeesCollected).toFixed(2)
        });
    } catch (error) {
        console.error('Get distribution stats error:', error);
        res.status(500).json({ error: 'Failed to fetch distribution statistics' });
    }
};
