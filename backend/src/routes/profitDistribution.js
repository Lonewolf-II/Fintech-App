import express from 'express';
import {
    calculateProfitDistribution,
    getAllDistributions,
    getDistributionStats
} from '../controllers/profitDistributionController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Calculate and distribute profit (Admin only)
router.post('/calculate', requireRole('admin'), calculateProfitDistribution);

// Get all profit distributions
router.get('/', requireRole('admin', 'checker'), getAllDistributions);

// Get distribution statistics
router.get('/stats', requireRole('admin', 'checker'), getDistributionStats);

export default router;
