import Portfolio from '../models/Portfolio.js';
import Holding from '../models/Holding.js';
import { Customer, ModificationRequest } from '../models/index.js';

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
// Update Holding (Maker-Checker)
export const updateHolding = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const holding = await Holding.findByPk(id);

        if (!holding) {
            return res.status(404).json({ error: 'Holding not found' });
        }

        if (req.user.role === 'maker') {
            await ModificationRequest.create({
                targetModel: 'Holding',
                targetId: id,
                requestedChanges: updates,
                changeType: 'update',
                status: 'pending',
                requestedBy: req.user.id
            });
            return res.json({ message: 'Modification request submitted for approval', pending: true });
        }

        // Admin/Checker/System direct update
        await holding.update(updates);

        // Recalculate Portfolio totals if needed (simplified)
        const portfolio = await Portfolio.findByPk(holding.portfolioId);
        if (portfolio) {
            // Re-aggregating would be safer but expensive. For now, assume direct updates are handled carefully.
            // or trigger a recalc function.
        }

        res.json(holding);
    } catch (error) {
        console.error('Update holding error:', error);
        res.status(500).json({ error: 'Failed to update holding' });
    }
};

// Delete Holding (Maker-Checker)
export const deleteHolding = async (req, res) => {
    try {
        const { id } = req.params;
        const holding = await Holding.findByPk(id);

        if (!holding) {
            return res.status(404).json({ error: 'Holding not found' });
        }

        if (req.user.role === 'maker') {
            await ModificationRequest.create({
                targetModel: 'Holding',
                targetId: id,
                requestedChanges: {},
                changeType: 'delete',
                status: 'pending',
                requestedBy: req.user.id
            });
            return res.json({ message: 'Deletion request submitted for approval', pending: true });
        }

        // Direct delete
        const portfolioId = holding.portfolioId;
        const investmentToRemove = parseFloat(holding.quantity) * parseFloat(holding.purchasePrice);
        const valueToRemove = parseFloat(holding.quantity) * parseFloat(holding.currentPrice);

        await holding.destroy();

        // Update Portfolio
        const portfolio = await Portfolio.findByPk(portfolioId);
        if (portfolio) {
            await portfolio.update({
                totalInvestment: Math.max(0, parseFloat(portfolio.totalInvestment) - investmentToRemove),
                totalValue: Math.max(0, parseFloat(portfolio.totalValue) - valueToRemove)
            });
        }

        res.json({ message: 'Holding deleted' });
    } catch (error) {
        console.error('Delete holding error:', error);
        res.status(500).json({ error: 'Failed to delete holding' });
    }
};
