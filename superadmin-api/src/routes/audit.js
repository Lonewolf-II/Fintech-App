import express from 'express';
import { AuditLog, Tenant, Superadmin } from '../../central-db/index.js';
import { authenticateSuperadmin } from './auth.js';

const router = express.Router();
router.use(authenticateSuperadmin);

// Get audit logs with filters
router.get('/', async (req, res) => {
    try {
        const { tenantId, superadminId, action, limit = 100 } = req.query;
        const where = {};

        if (tenantId) where.tenantId = tenantId;
        if (superadminId) where.superadminId = superadminId;
        if (action) where.action = action;

        const logs = await AuditLog.findAll({
            where,
            include: [
                { model: Tenant, as: 'tenant', attributes: ['id', 'companyName', 'subdomain'] },
                { model: Superadmin, as: 'superadmin', attributes: ['id', 'name', 'email'] }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit)
        });

        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
});

export default router;
