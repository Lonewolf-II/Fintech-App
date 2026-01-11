import express from 'express';
import { getPendingRequests, actionRequest } from '../controllers/checkerController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// Get pending modification requests
router.get('/requests', requireRole('admin', 'checker'), getPendingRequests);

// Action on request (approve/reject)
router.post('/requests/:id/action', requireRole('admin', 'checker'), actionRequest);

export default router;
