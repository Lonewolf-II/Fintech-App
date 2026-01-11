import express from 'express';
import { IPWhitelist, Tenant } from '../../central-db/index.js';
import { authenticateSuperadmin } from './auth.js';
import { createAuditLog } from '../utils/audit.js';

const router = express.Router();
router.use(authenticateSuperadmin);

// Get IP whitelist for tenant
router.get('/:tenantId', async (req, res) => {
    try {
        const whitelist = await IPWhitelist.findAll({
            where: { tenantId: req.params.tenantId },
            order: [['addedAt', 'DESC']]
        });
        res.json(whitelist);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch IP whitelist' });
    }
});

// Add IP to whitelist
router.post('/', async (req, res) => {
    try {
        const { tenantId, ipAddress, description } = req.body;

        const entry = await IPWhitelist.create({
            tenantId,
            ipAddress,
            description
        });

        await createAuditLog({
            superadminId: req.superadmin.id,
            tenantId,
            action: 'added_ip_whitelist',
            details: { ipAddress },
            ipAddress: req.ip
        });

        res.status(201).json(entry);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add IP to whitelist' });
    }
});

// Remove IP from whitelist
router.delete('/:id', async (req, res) => {
    try {
        const entry = await IPWhitelist.findByPk(req.params.id);
        if (!entry) {
            return res.status(404).json({ error: 'IP whitelist entry not found' });
        }

        await createAuditLog({
            superadminId: req.superadmin.id,
            tenantId: entry.tenantId,
            action: 'removed_ip_whitelist',
            details: { ipAddress: entry.ipAddress },
            ipAddress: req.ip
        });

        await entry.destroy();
        res.json({ message: 'IP removed from whitelist' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove IP from whitelist' });
    }
});

export default router;
