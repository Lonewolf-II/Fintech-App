import express from 'express';
import {
    getDashboardStats,
    getRecentActivity,
    getSpecialAccountsOverview,
    withdrawFromOfficeAccount
} from '../controllers/adminDashboardController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get comprehensive dashboard statistics (Admin/Checker)
router.get('/stats', requireRole('admin', 'checker'), getDashboardStats);

// Get recent activity feed (Admin/Checker)
router.get('/activity', requireRole('admin', 'checker'), getRecentActivity);

// Get special accounts overview (Admin only)
router.get('/special-accounts', requireRole('admin'), getSpecialAccountsOverview);

// Withdraw from office account (Admin only)
router.post('/special-accounts/office/withdraw', requireRole('admin'), withdrawFromOfficeAccount);

export default router;
