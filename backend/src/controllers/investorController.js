import { Investor, InvestorCategory, Investment, Account, Customer, sequelize } from '../models/index.js';
import { Op } from 'sequelize';

// Helper to generate Investor ID: INV-YYYYMMDD-XXXX
const generateInvestorId = async () => {
    const prefix = 'INV-' + new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const latestInvestor = await Investor.findOne({
        where: {
            investorId: {
                [Op.like]: `${prefix}%`
            }
        },
        order: [['investorId', 'DESC']],
        attributes: ['investorId']
    });

    let nextSequence = 1;
    if (latestInvestor && latestInvestor.investorId) {
        const currentSequence = parseInt(latestInvestor.investorId.substring(prefix.length));
        if (!isNaN(currentSequence)) {
            nextSequence = currentSequence + 1;
        }
    }

    return `${prefix}${nextSequence.toString().padStart(4, '0')}`;
};

// GET /api/investors - List all investors
export const getAllInvestors = async (req, res) => {
    try {
        const investors = await Investor.findAll({
            include: [
                { association: 'creator', attributes: ['name'] },
                { association: 'categories', attributes: ['id', 'categoryName', 'status'] }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json(investors);
    } catch (error) {
        console.error('Get investors error:', error);
        res.status(500).json({ error: 'Failed to fetch investors' });
    }
};

// POST /api/investors - Create investor
export const createInvestor = async (req, res) => {
    try {
        const { name, email, phone, totalCapital } = req.body;

        const investorId = await generateInvestorId();

        const investor = await Investor.create({
            investorId,
            name,
            email,
            phone,
            totalCapital: totalCapital || 0,
            availableCapital: totalCapital || 0,
            investedAmount: 0,
            totalProfit: 0,
            status: 'active',
            createdBy: req.user.id
        });

        res.status(201).json(investor);
    } catch (error) {
        console.error('Create investor error:', error);
        res.status(500).json({ error: 'Failed to create investor' });
    }
};

// GET /api/investors/:id - Get investor details
export const getInvestorById = async (req, res) => {
    try {
        const investor = await Investor.findByPk(req.params.id, {
            include: [
                { association: 'creator', attributes: ['name'] },
                {
                    association: 'categories',
                    include: [
                        { association: 'assignments', include: ['account', 'customer'] }
                    ]
                },
                {
                    association: 'investments',
                    include: ['customer', 'account', 'ipoApplication']
                }
            ]
        });

        if (!investor) {
            return res.status(404).json({ error: 'Investor not found' });
        }

        res.json(investor);
    } catch (error) {
        console.error('Get investor error:', error);
        res.status(500).json({ error: 'Failed to fetch investor' });
    }
};

// PUT /api/investors/:id - Update investor
export const updateInvestor = async (req, res) => {
    try {
        const investor = await Investor.findByPk(req.params.id);

        if (!investor) {
            return res.status(404).json({ error: 'Investor not found' });
        }

        await investor.update(req.body);
        res.json(investor);
    } catch (error) {
        console.error('Update investor error:', error);
        res.status(500).json({ error: 'Failed to update investor' });
    }
};

// POST /api/investors/:id/add-capital - Add capital
export const addCapital = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { amount } = req.body;
        const investor = await Investor.findByPk(req.params.id, { transaction });

        if (!investor) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Investor not found' });
        }

        const newTotalCapital = parseFloat(investor.totalCapital) + parseFloat(amount);
        const newAvailableCapital = parseFloat(investor.availableCapital) + parseFloat(amount);

        await investor.update({
            totalCapital: newTotalCapital,
            availableCapital: newAvailableCapital
        }, { transaction });

        await transaction.commit();
        res.json(investor);
    } catch (error) {
        await transaction.rollback();
        console.error('Add capital error:', error);
        res.status(500).json({ error: 'Failed to add capital' });
    }
};

// GET /api/investors/:id/portfolio - Get investor portfolio summary
export const getInvestorPortfolio = async (req, res) => {
    try {
        const investor = await Investor.findByPk(req.params.id);

        if (!investor) {
            return res.status(404).json({ error: 'Investor not found' });
        }

        // Get all active investments
        const investments = await Investment.findAll({
            where: { investorId: req.params.id },
            include: [
                { association: 'customer', attributes: ['fullName', 'customerId'] },
                { association: 'account', attributes: ['accountNumber'] },
                { association: 'ipoApplication', include: ['ipoListing'] }
            ],
            order: [['invested_at', 'DESC']]
        });

        // Calculate portfolio summary
        const summary = {
            totalCapital: parseFloat(investor.totalCapital),
            investedAmount: parseFloat(investor.investedAmount),
            availableCapital: parseFloat(investor.availableCapital),
            totalProfit: parseFloat(investor.totalProfit),
            activeInvestments: investments.filter(i => i.status === 'active').length,
            totalInvestments: investments.length,
            currentPortfolioValue: investments.reduce((sum, inv) => sum + parseFloat(inv.currentValue || 0), 0)
        };

        res.json({
            investor: {
                id: investor.id,
                investorId: investor.investorId,
                name: investor.name
            },
            summary,
            investments
        });
    } catch (error) {
        console.error('Get investor portfolio error:', error);
        res.status(500).json({ error: 'Failed to fetch investor portfolio' });
    }
};
