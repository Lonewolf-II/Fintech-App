import express from 'express';
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,

    deleteUser,
    resetUserPassword
} from '../controllers/userController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all users (admin only)
router.get('/', requireRole('admin'), getAllUsers);

// Get user by ID
router.get('/:id', getUserById);

// Create user (admin only)
router.post('/', requireRole('admin'), createUser);

// Update user (admin only)
router.put('/:id', requireRole('admin'), updateUser);

// Delete user (admin only)
router.delete('/:id', requireRole('admin'), deleteUser);

// Reset password (admin only)
router.post('/:id/reset-password', requireRole('admin'), resetUserPassword);

export default router;
