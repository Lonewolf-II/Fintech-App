import Portfolio from '../models/Portfolio.js';
import Holding from '../models/Holding.js';
import { Customer } from '../models/index.js';

// Get all portfolios
export const getAllPortfolios = async (req, res) => {
    try {
        const portfolios = await Portfolio.findAll({
            include: [
                { model: Customer, as: 'customer', attributes: ['fullName', 'email'] },
                { model: Holding, as: 'holdings' }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(portfolios);
    } catch (error) {
        console.error('Get portfolios error:', error);
        res.status(500).json({ error: 'Failed to fetch portfolios' });
    }
};

// Create portfolio
export const createPortfolio = async (req, res) => {
    try {
        const { customerId } = req.body;
        const portfolioId = `PF-${Date.now()}`;

        const portfolio = await Portfolio.create({
            portfolioId,
            customerId,
            totalValue: 0,
            totalInvestment: 0,
            profitLoss: 0
        });

        res.status(201).json(portfolio);
    } catch (error) {
        console.error('Create portfolio error:', error);
        res.status(500).json({ error: 'Failed to create portfolio' });
    }
};

// Get holdings for a portfolio
export const getPortfolioHoldings = async (req, res) => {
    try {
        const holdings = await Holding.findAll({
            where: { portfolioId: req.params.portfolioId },
            order: [['createdAt', 'DESC']]
        });
        res.json(holdings);
    } catch (error) {
        console.error('Get holdings error:', error);
        res.status(500).json({ error: 'Failed to fetch holdings' });
    }
};

// Add holding (buy stock)
export const addHolding = async (req, res) => {
    try {
        const { portfolioId, stockSymbol, companyName, quantity, purchasePrice } = req.body;

        const portfolio = await Portfolio.findByPk(portfolioId);
        if (!portfolio) {
            return res.status(404).json({ error: 'Portfolio not found' });
        }

        const holding = await Holding.create({
            holdingId: `HLD-${Date.now()}`,
            portfolioId,
            stockSymbol,
            companyName,
            quantity,
            purchasePrice,
            currentPrice: purchasePrice,
            profitLossPercent: 0
        });

        // Update portfolio totals
        const investment = parseFloat(quantity) * parseFloat(purchasePrice);
        await portfolio.update({
            totalInvestment: parseFloat(portfolio.totalInvestment) + investment,
            totalValue: parseFloat(portfolio.totalValue) + investment
        });

        res.status(201).json(holding);
    } catch (error) {
        console.error('Add holding error:', error);
        res.status(500).json({ error: 'Failed to add holding' });
    }
};

// Update holding price
export const updateHoldingPrice = async (req, res) => {
    try {
        const { currentPrice } = req.body;
        const holding = await Holding.findByPk(req.params.id);

        if (!holding) {
            return res.status(404).json({ error: 'Holding not found' });
        }

        const profitLossPercent = ((parseFloat(currentPrice) - parseFloat(holding.purchasePrice)) / parseFloat(holding.purchasePrice)) * 100;

        await holding.update({
            currentPrice,
            profitLossPercent
        });

        res.json(holding);
    } catch (error) {
        console.error('Update holding error:', error);
        res.status(500).json({ error: 'Failed to update holding' });
    }
};
