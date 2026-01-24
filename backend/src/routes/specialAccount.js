import express from 'express';
import { getChargeAccounts } from '../controllers/specialAccountController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// Admin only routes
router.get('/charge-accounts', requireRole('admin'), getChargeAccounts);

export default router;
