import express from 'express';
import {
    getAllCategories,
    createCategory,
    updateCategory,
    assignAccountsToCategory,
    getCategoryAccounts,
    removeAccountFromCategory
} from '../controllers/categoryController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// Category routes (Admin only)
router.get('/categories', requireRole('admin'), getAllCategories);
router.post('/categories', requireRole('admin'), createCategory);
router.put('/categories/:id', requireRole('admin'), updateCategory);
router.post('/categories/:id/assign-accounts', requireRole('admin'), assignAccountsToCategory);
router.get('/categories/:id/accounts', requireRole('admin'), getCategoryAccounts);
router.delete('/categories/:categoryId/accounts/:accountId', requireRole('admin'), removeAccountFromCategory);

export default router;
