import express from 'express';
import {
    getAllAccounts,
    createAccount,
    getAccountTransactions,
    createTransaction,
    updateAccount
} from '../controllers/bankingController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// Account routes
router.get('/accounts', requireRole('admin', 'maker', 'checker'), getAllAccounts);
router.post('/accounts', requireRole('admin', 'maker'), createAccount);
router.put('/accounts/:id', requireRole('admin', 'maker'), updateAccount);

// Transaction routes
router.get('/accounts/:accountId/transactions', requireRole('admin', 'maker', 'checker'), getAccountTransactions);
router.post('/transactions', requireRole('admin', 'maker'), createTransaction);

export default router;
