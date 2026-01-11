import express from 'express';
import {
    getAllInvestors,
    createInvestor,
    getInvestorById,
    updateInvestor,
    addCapital,
    getInvestorPortfolio
} from '../controllers/investorController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// Investor routes (Admin only)
router.get('/investors', requireRole('admin'), getAllInvestors);
router.post('/investors', requireRole('admin'), createInvestor);
router.get('/investors/:id', requireRole('admin'), getInvestorById);
router.put('/investors/:id', requireRole('admin'), updateInvestor);
router.post('/investors/:id/add-capital', requireRole('admin'), addCapital);
router.get('/investors/:id/portfolio', requireRole('admin'), getInvestorPortfolio);

export default router;
