import express from 'express';
import {
    getAllPortfolios,
    createPortfolio,
    getPortfolioHoldings,
    addHolding,
    updateHoldingPrice,
    updateHolding,
    deleteHolding,
    updateMarketPrice,
    sellShares
} from '../controllers/portfolioController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// Portfolio routes - accessible to all authenticated users
router.get('/portfolios', getAllPortfolios);
router.post('/portfolios', requireRole('admin', 'investor'), createPortfolio);

// Holding routes - viewing accessible to all, modifications require specific roles
router.get('/portfolios/:portfolioId/holdings', getPortfolioHoldings);
router.post('/holdings', requireRole('admin', 'investor'), addHolding);
router.put('/holdings/:id/price', requireRole('admin', 'investor'), updateHoldingPrice);

// New Routes
router.post('/market-price', requireRole('admin'), updateMarketPrice);
router.post('/holdings/:id/sell', requireRole('admin', 'investor', 'maker'), sellShares);

// Maker-Checker Holding Routes
router.put('/holdings/:id', requireRole('maker', 'admin'), updateHolding);
router.delete('/holdings/:id', requireRole('maker', 'admin'), deleteHolding);

export default router;
