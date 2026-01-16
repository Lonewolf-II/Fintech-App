import express from 'express';
import {
    createTenant,
    getAllTenants,
    deleteTenant,
    getTenantUsers,
    createTenantUser,
    deleteTenantUser
} from '../controllers/tenantController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public route for now (or protect with superadmin auth)
// Requirements imply superadmin panel uses this
router.post('/', authMiddleware, requireRole(['superadmin']), createTenant);
router.get('/', authMiddleware, requireRole(['superadmin']), getAllTenants);
router.delete('/:id', authMiddleware, requireRole(['superadmin']), deleteTenant);

// User Management Routes
router.get('/:id/users', authMiddleware, requireRole(['superadmin']), getTenantUsers);
router.post('/:id/users', authMiddleware, requireRole(['superadmin']), createTenantUser);
router.delete('/:id/users/:userId', authMiddleware, requireRole(['superadmin']), deleteTenantUser);

export default router;
