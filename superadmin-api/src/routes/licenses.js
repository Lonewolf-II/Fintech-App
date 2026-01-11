import express from 'express';
import { License, Tenant } from '../../central-db/index.js';
import { authenticateSuperadmin } from './auth.js';
import { createAuditLog } from '../utils/audit.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
router.use(authenticateSuperadmin);

// Get all licenses
router.get('/', async (req, res) => {
    try {
        const licenses = await License.findAll({
            include: [{ model: Tenant, as: 'tenant' }],
            order: [['issuedAt', 'DESC']]
        });
        res.json(licenses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch licenses' });
    }
});

// Generate new license
router.post('/', async (req, res) => {
    try {
        const { tenantId, featureFlags, expiresAt } = req.body;

        const license = await License.create({
            tenantId,
            licenseKey: uuidv4(),
            featureFlags: featureFlags || { ipo: true, portfolio: true, bulkUpload: true },
            expiresAt
        });

        await createAuditLog({
            superadminId: req.superadmin.id,
            tenantId,
            action: 'generated_license',
            details: { licenseKey: license.licenseKey, featureFlags },
            ipAddress: req.ip
        });

        res.status(201).json(license);
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate license' });
    }
});

// Update/revoke license
router.patch('/:id', async (req, res) => {
    try {
        const license = await License.findByPk(req.params.id);
        if (!license) {
            return res.status(404).json({ error: 'License not found' });
        }

        const { featureFlags, revokedAt } = req.body;
        await license.update({ featureFlags, revokedAt });

        await createAuditLog({
            superadminId: req.superadmin.id,
            tenantId: license.tenantId,
            action: revokedAt ? 'revoked_license' : 'updated_license',
            details: { licenseKey: license.licenseKey },
            ipAddress: req.ip
        });

        res.json(license);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update license' });
    }
});

export default router;
