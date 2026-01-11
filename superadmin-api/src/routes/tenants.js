import express from 'express';
import { Tenant, Subscription, License } from '../../central-db/index.js';
import { authenticateSuperadmin } from './auth.js';
import { createAuditLog } from '../utils/audit.js';
import { provisionTenantDatabase } from '../utils/provisioning.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateSuperadmin);

// Get all tenants
router.get('/', async (req, res) => {
    try {
        const { status, search } = req.query;
        const where = {};

        if (status) where.status = status;
        if (search) {
            where[Op.or] = [
                { companyName: { [Op.iLike]: `%${search}%` } },
                { subdomain: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const tenants = await Tenant.findAll({
            where,
            include: [
                { model: Subscription, as: 'subscriptions' },
                { model: License, as: 'licenses' }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json(tenants);
    } catch (error) {
        console.error('Get tenants error:', error);
        res.status(500).json({ error: 'Failed to fetch tenants' });
    }
});

// Get single tenant
router.get('/:id', async (req, res) => {
    try {
        const tenant = await Tenant.findByPk(req.params.id, {
            include: [
                { model: Subscription, as: 'subscriptions' },
                { model: License, as: 'licenses' }
            ]
        });

        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }

        res.json(tenant);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tenant' });
    }
});

// Create new tenant
router.post('/', async (req, res) => {
    try {
        const {
            companyName,
            subdomain,
            autoProvision = true,
            databaseHost,
            databaseName,
            databaseUser,
            databasePassword
        } = req.body;

        // Validate required fields
        if (!companyName || !subdomain) {
            return res.status(400).json({ error: 'Company name and subdomain required' });
        }

        // Check if subdomain already exists
        const existing = await Tenant.findOne({ where: { subdomain } });
        if (existing) {
            return res.status(400).json({ error: 'Subdomain already exists' });
        }

        let dbConfig;
        if (autoProvision) {
            // Auto-provision database
            dbConfig = await provisionTenantDatabase(subdomain);
        } else {
            // Use provided database credentials
            if (!databaseHost || !databaseName || !databaseUser || !databasePassword) {
                return res.status(400).json({ error: 'Database credentials required' });
            }
            dbConfig = { databaseHost, databaseName, databaseUser, databasePassword };
        }

        // Create tenant
        const tenant = await Tenant.create({
            tenantKey: subdomain,
            companyName,
            subdomain,
            ...dbConfig,
            status: 'trial'
        });

        // Create audit log
        await createAuditLog({
            superadminId: req.superadmin.id,
            tenantId: tenant.id,
            action: 'created_tenant',
            details: { companyName, subdomain, autoProvision },
            ipAddress: req.ip
        });

        res.status(201).json(tenant);
    } catch (error) {
        console.error('Create tenant error:', error);
        res.status(500).json({ error: 'Failed to create tenant' });
    }
});

// Update tenant
router.patch('/:id', async (req, res) => {
    try {
        const tenant = await Tenant.findByPk(req.params.id);
        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }

        const { companyName, notes } = req.body;
        await tenant.update({ companyName, notes });

        await createAuditLog({
            superadminId: req.superadmin.id,
            tenantId: tenant.id,
            action: 'updated_tenant',
            details: { changes: req.body },
            ipAddress: req.ip
        });

        res.json(tenant);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update tenant' });
    }
});

// Suspend tenant
router.post('/:id/suspend', async (req, res) => {
    try {
        const tenant = await Tenant.findByPk(req.params.id);
        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }

        await tenant.update({
            status: 'suspended',
            suspendedAt: new Date()
        });

        await createAuditLog({
            superadminId: req.superadmin.id,
            tenantId: tenant.id,
            action: 'suspended_tenant',
            details: { reason: req.body.reason },
            ipAddress: req.ip
        });

        res.json({ message: 'Tenant suspended successfully', tenant });
    } catch (error) {
        res.status(500).json({ error: 'Failed to suspend tenant' });
    }
});

// Activate tenant
router.post('/:id/activate', async (req, res) => {
    try {
        const tenant = await Tenant.findByPk(req.params.id);
        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }

        await tenant.update({
            status: 'active',
            suspendedAt: null
        });

        await createAuditLog({
            superadminId: req.superadmin.id,
            tenantId: tenant.id,
            action: 'activated_tenant',
            ipAddress: req.ip
        });

        res.json({ message: 'Tenant activated successfully', tenant });
    } catch (error) {
        res.status(500).json({ error: 'Failed to activate tenant' });
    }
});

// Soft delete tenant
router.delete('/:id', async (req, res) => {
    try {
        const tenant = await Tenant.findByPk(req.params.id);
        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }

        await tenant.update({ status: 'expired' });

        await createAuditLog({
            superadminId: req.superadmin.id,
            tenantId: tenant.id,
            action: 'deleted_tenant',
            ipAddress: req.ip
        });

        res.json({ message: 'Tenant deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete tenant' });
    }
});

export default router;
