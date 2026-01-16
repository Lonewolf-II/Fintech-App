import express from 'express';
import {
    getAllInvestors,
    createInvestor,
    getInvestorById,
    updateInvestor,
    addCapital,
    getInvestorPortfolio,
    assignAccountToInvestor
} from '../controllers/investorController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all investors
router.get('/', requireRole('admin', 'checker'), getAllInvestors);

// Create investor (Admin only)
router.post('/', requireRole('admin'), createInvestor);

// Get investor by ID
router.get('/:id', requireRole('admin', 'checker'), getInvestorById);

// Update investor (Admin only)
router.put('/:id', requireRole('admin'), updateInvestor);

// Add capital to investor (Admin only)
router.post('/:id/add-capital', requireRole('admin'), addCapital);

// Get investor portfolio summary
router.get('/:id/portfolio', requireRole('admin', 'checker'), getInvestorPortfolio);

// Assign customer account to investor (Admin only)
router.post('/:id/assign-account', requireRole('admin'), assignAccountToInvestor);

export default router;
