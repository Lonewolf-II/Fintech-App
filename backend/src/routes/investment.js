import express from 'express';
import {
    createInvestment,
    updateMarketPrice,
    sellShares,
    getInvestorInvestments,
    getInvestmentById,
    getAllInvestments,
    getAllHoldings,
    updateScripPrices
} from '../controllers/investmentController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// Investment routes (Admin only)
router.get('/investments', requireRole('admin'), getAllInvestments);
router.get('/investments/:id', requireRole('admin'), getInvestmentById);
router.post('/investments/create', requireRole('admin'), createInvestment);
router.put('/investments/:id/update-price', requireRole('admin'), updateMarketPrice);
router.post('/investments/:id/sell', requireRole('admin'), sellShares);
router.get('/investments/investor/:id', requireRole('admin'), getInvestorInvestments);

// Holdings management routes (Admin only)
router.get('/holdings/summary', requireRole('admin'), getAllHoldings);
router.put('/scrip-prices', requireRole('admin'), updateScripPrices);

export default router;
