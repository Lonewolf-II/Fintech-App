import express from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { getActivityLogs, deleteIPOApplication } from '../controllers/adminController.js';

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole(['admin']));

router.get('/logs', getActivityLogs);
router.delete('/ipo-applications/:id', deleteIPOApplication);

export default router;
