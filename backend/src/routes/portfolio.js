import express from 'express';
import {
    getAllPortfolios,
    createPortfolio,
    getPortfolioHoldings,
    addHolding,
    updateHoldingPrice
} from '../controllers/portfolioController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// Portfolio routes
router.get('/portfolios', requireRole('admin', 'investor'), getAllPortfolios);
router.post('/portfolios', requireRole('admin', 'investor'), createPortfolio);

// Holding routes
router.get('/portfolios/:portfolioId/holdings', requireRole('admin', 'investor'), getPortfolioHoldings);
router.post('/holdings', requireRole('admin', 'investor'), addHolding);
router.put('/holdings/:id/price', requireRole('admin', 'investor'), updateHoldingPrice);

export default router;
