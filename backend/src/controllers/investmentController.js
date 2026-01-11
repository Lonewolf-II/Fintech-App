import { Investment, ProfitDistribution, Investor, Account, Customer, IPOApplication, sequelize } from '../models/index.js';

// Helper to generate Investment ID: INV-YYYYMMDD-XXXX
const generateInvestmentId = async () => {
    const prefix = 'INV-' + new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const latestInvestment = await Investment.findOne({
        where: {
            investmentId: {
                [sequelize.Op.like]: `${prefix}%`
            }
        },
        order: [['investmentId', 'DESC']],
        attributes: ['investmentId']
    });

    let nextSequence = 1;
    if (latestInvestment && latestInvestment.investmentId) {
        const currentSequence = parseInt(latestInvestment.investmentId.substring(prefix.length));
        if (!isNaN(currentSequence)) {
            nextSequence = currentSequence + 1;
        }
    }

    return `${prefix}${nextSequence.toString().padStart(4, '0')}`;
};

// POST /api/investments/create - Create investment record (called during IPO allotment)
export const createInvestment = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { investorId, customerId, accountId, ipoApplicationId, principalAmount, sharesAllocated, costPerShare } = req.body;

        // Validate investor has sufficient capital
        const investor = await Investor.findByPk(investorId, { transaction });
        if (!investor) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Investor not found' });
        }

        if (parseFloat(investor.availableCapital) < parseFloat(principalAmount)) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Insufficient available capital' });
        }

        const investmentId = await generateInvestmentId();
        const totalCost = parseFloat(sharesAllocated) * parseFloat(costPerShare);

        // Create investment
        const investment = await Investment.create({
            investmentId,
            investorId,
            customerId,
            accountId,
            ipoApplicationId,
            principalAmount: parseFloat(principalAmount),
            sharesAllocated: parseInt(sharesAllocated),
            costPerShare: parseFloat(costPerShare),
            totalCost,
            sharesHeld: parseInt(sharesAllocated),
            currentMarketPrice: parseFloat(costPerShare),
            currentValue: totalCost,
            status: 'active',
            investedAt: new Date()
        }, { transaction });

        // Update investor capital
        await investor.update({
            investedAmount: parseFloat(investor.investedAmount) + parseFloat(principalAmount),
            availableCapital: parseFloat(investor.availableCapital) - parseFloat(principalAmount)
        }, { transaction });

        await transaction.commit();
        res.status(201).json(investment);
    } catch (error) {
        await transaction.rollback();
        console.error('Create investment error:', error);
        res.status(500).json({ error: 'Failed to create investment' });
    }
};

// PUT /api/investments/:id/update-price - Update market price
export const updateMarketPrice = async (req, res) => {
    try {
        const { currentMarketPrice } = req.body;
        const investment = await Investment.findByPk(req.params.id);

        if (!investment) {
            return res.status(404).json({ error: 'Investment not found' });
        }

        const newCurrentValue = parseFloat(investment.sharesHeld) * parseFloat(currentMarketPrice);

        await investment.update({
            currentMarketPrice: parseFloat(currentMarketPrice),
            currentValue: newCurrentValue
        });

        res.json(investment);
    } catch (error) {
        console.error('Update market price error:', error);
        res.status(500).json({ error: 'Failed to update market price' });
    }
};

// POST /api/investments/:id/sell - Record share sale & profit distribution
export const sellShares = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { sharesSold, salePricePerShare, adminFeePerAccount } = req.body;
        const investment = await Investment.findByPk(req.params.id, {
            include: ['investor', 'account'],
            transaction
        });

        if (!investment) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Investment not found' });
        }

        if (parseInt(sharesSold) > parseInt(investment.sharesHeld)) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Cannot sell more shares than held' });
        }

        // Calculate amounts
        const totalSaleAmount = parseFloat(sharesSold) * parseFloat(salePricePerShare);
        const principalPerShare = parseFloat(investment.principalAmount) / parseFloat(investment.sharesAllocated);
        const principalReturned = parseFloat(sharesSold) * principalPerShare;
        const totalProfit = totalSaleAmount - principalReturned;

        // Apply 60/40 split
        const investorShare = totalProfit * 0.60;
        const customerShare = totalProfit * 0.40;
        const adminFee = parseFloat(adminFeePerAccount || 1000);

        // Net investor amount (after admin fee)
        const netInvestorShare = investorShare - adminFee;

        // Generate distribution ID
        const distributionId = `DIST-${Date.now()}`;

        // Create profit distribution record
        const distribution = await ProfitDistribution.create({
            distributionId,
            investmentId: investment.id,
            sharesSold: parseInt(sharesSold),
            salePricePerShare: parseFloat(salePricePerShare),
            totalSaleAmount,
            principalReturned,
            totalProfit,
            investorShare: netInvestorShare,
            customerShare,
            adminFee,
            distributedAt: new Date(),
            createdBy: req.user.id
        }, { transaction });

        // Update investment
        const newSharesHeld = parseInt(investment.sharesHeld) - parseInt(sharesSold);
        const newStatus = newSharesHeld === 0 ? 'fully_realized' : 'partially_sold';

        await investment.update({
            sharesHeld: newSharesHeld,
            totalSoldAmount: parseFloat(investment.totalSoldAmount) + totalSaleAmount,
            investorProfit: parseFloat(investment.investorProfit) + netInvestorShare,
            customerProfit: parseFloat(investment.customerProfit) + customerShare,
            adminFee: parseFloat(investment.adminFee) + adminFee,
            status: newStatus,
            currentValue: newSharesHeld * parseFloat(investment.currentMarketPrice)
        }, { transaction });

        // Update investor capital
        const investor = investment.investor;
        const capitalToReturn = principalReturned + netInvestorShare;

        await investor.update({
            availableCapital: parseFloat(investor.availableCapital) + capitalToReturn,
            investedAmount: parseFloat(investor.investedAmount) - principalReturned,
            totalProfit: parseFloat(investor.totalProfit) + netInvestorShare
        }, { transaction });

        // Update customer account balance
        const account = investment.account;
        await account.update({
            balance: parseFloat(account.balance) + customerShare
        }, { transaction });

        await transaction.commit();

        res.json({
            message: 'Shares sold and profit distributed successfully',
            distribution,
            investment: await Investment.findByPk(investment.id, {
                include: ['investor', 'account', 'customer']
            })
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Sell shares error:', error);
        res.status(500).json({ error: 'Failed to sell shares' });
    }
};

// GET /api/investments/investor/:id - Get all investments for investor
export const getInvestorInvestments = async (req, res) => {
    try {
        const investments = await Investment.findAll({
            where: { investorId: req.params.id },
            include: [
                { association: 'customer', attributes: ['fullName', 'customerId'] },
                { association: 'account', attributes: ['accountNumber'] },
                { association: 'ipoApplication', include: ['ipoListing'] },
                { association: 'distributions' }
            ],
            order: [['invested_at', 'DESC']]
        });

        res.json(investments);
    } catch (error) {
        console.error('Get investor investments error:', error);
        res.status(500).json({ error: 'Failed to fetch investments' });
    }
};

// GET /api/investments/:id - Get investment details
export const getInvestmentById = async (req, res) => {
    try {
        const investment = await Investment.findByPk(req.params.id, {
            include: [
                { association: 'investor' },
                { association: 'customer' },
                { association: 'account' },
                { association: 'ipoApplication', include: ['ipoListing'] },
                { association: 'distributions' }
            ]
        });

        if (!investment) {
            return res.status(404).json({ error: 'Investment not found' });
        }

        res.json(investment);
    } catch (error) {
        console.error('Get investment error:', error);
        res.status(500).json({ error: 'Failed to fetch investment' });
    }
};

// GET /api/investments - Get all investments (admin)
export const getAllInvestments = async (req, res) => {
    try {
        const { status } = req.query;
        const where = {};

        if (status) {
            where.status = status;
        }

        const investments = await Investment.findAll({
            where,
            include: [
                { association: 'investor', attributes: ['name', 'investorId'] },
                { association: 'customer', attributes: ['fullName', 'customerId'] },
                { association: 'account', attributes: ['accountNumber'] },
                { association: 'ipoApplication', include: ['ipoListing'] }
            ],
            order: [['invested_at', 'DESC']]
        });

        res.json(investments);
    } catch (error) {
        console.error('Get all investments error:', error);
        res.status(500).json({ error: 'Failed to fetch investments' });
    }
};
