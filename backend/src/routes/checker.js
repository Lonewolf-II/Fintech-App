import express from 'express';
import { getPendingRequests, actionRequest, bulkActionRequest } from '../controllers/checkerController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// Get pending modification requests
router.get('/requests', requireRole('admin', 'checker'), getPendingRequests);

// Action on request (approve/reject)
router.post('/requests/:id/action', requireRole('admin', 'checker'), actionRequest);

// Bulk action
router.post('/bulk-action', requireRole('admin', 'checker'), bulkActionRequest);

export default router;
