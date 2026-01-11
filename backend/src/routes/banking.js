import express from 'express';
import multer from 'multer';
import {
    getAllAccounts,
    createAccount,
    getAccountTransactions,
    createTransaction,
    updateAccount,
    bulkDeposit
} from '../controllers/bankingController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

const upload = multer({ dest: 'uploads/' });

// Account routes
router.get('/accounts', requireRole('admin', 'maker', 'checker'), getAllAccounts);
router.post('/accounts', requireRole('admin', 'maker'), createAccount);
router.put('/accounts/:id', requireRole('admin', 'maker'), updateAccount);

// Transaction routes
router.get('/accounts/:accountId/transactions', requireRole('admin', 'maker', 'checker'), getAccountTransactions);
router.post('/transactions', requireRole('admin', 'maker'), createTransaction);
router.post('/bulk-deposit', requireRole('admin', 'maker'), upload.single('file'), bulkDeposit);

export default router;
