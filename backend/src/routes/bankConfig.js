import express from 'express';
import { getAllBankConfigs, createBankConfig, updateBankConfig, deleteBankConfig } from '../controllers/bankConfigController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// Bank configuration routes - admin only
router.get('/banks', requireRole('admin', 'maker', 'checker'), getAllBankConfigs);
router.post('/banks', requireRole('admin'), createBankConfig);
router.put('/banks/:id', requireRole('admin'), updateBankConfig);
router.delete('/banks/:id', requireRole('admin'), deleteBankConfig);

export default router;
