import express from 'express';
import {
    createFee,
    getAllFees,
    getFeeById,
    updateFee,
    markFeeAsPaid,
    waiveFee,
    getFeeStats,
    bulkCreateAnnualFees
} from '../controllers/feeController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get fee statistics
router.get('/stats', requireRole('admin', 'checker'), getFeeStats);

// Get all fees
router.get('/', requireRole('admin', 'checker'), getAllFees);

// Create fee (Admin only)
router.post('/', requireRole('admin'), createFee);

// Bulk create annual fees (Admin only)
router.post('/bulk-annual', requireRole('admin'), bulkCreateAnnualFees);

// Get fee by ID
router.get('/:id', requireRole('admin', 'checker'), getFeeById);

// Update fee (Admin only)
router.put('/:id', requireRole('admin'), updateFee);

// Mark fee as paid (Admin only)
router.post('/:id/pay', requireRole('admin'), markFeeAsPaid);

// Waive fee (Admin only)
router.post('/:id/waive', requireRole('admin'), waiveFee);

export default router;
