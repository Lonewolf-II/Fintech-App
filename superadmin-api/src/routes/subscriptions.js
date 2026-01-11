import express from 'express';
import { Subscription, Tenant } from '../../central-db/index.js';
import { authenticateSuperadmin } from './auth.js';
import { createAuditLog } from '../utils/audit.js';

const router = express.Router();
router.use(authenticateSuperadmin);

// Get all subscriptions
router.get('/', async (req, res) => {
    try {
        const subscriptions = await Subscription.findAll({
            include: [{ model: Tenant, as: 'tenant' }],
            order: [['createdAt', 'DESC']]
        });
        res.json(subscriptions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }
});

// Create subscription
router.post('/', async (req, res) => {
    try {
        const {
            tenantId,
            planName,
            maxUsers,
            maxCustomers,
            maxTransactionsPerMonth,
            pricePerMonth,
            billingCycle,
            startDate,
            endDate
        } = req.body;

        const subscription = await Subscription.create({
            tenantId,
            planName,
            maxUsers,
            maxCustomers,
            maxTransactionsPerMonth,
            pricePerMonth,
            billingCycle,
            startDate,
            endDate,
            autoRenew: false
        });

        await createAuditLog({
            superadminId: req.superadmin.id,
            tenantId,
            action: 'created_subscription',
            details: { planName, pricePerMonth },
            ipAddress: req.ip
        });

        res.status(201).json(subscription);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create subscription' });
    }
});

// Update subscription
router.patch('/:id', async (req, res) => {
    try {
        const subscription = await Subscription.findByPk(req.params.id);
        if (!subscription) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        await subscription.update(req.body);

        await createAuditLog({
            superadminId: req.superadmin.id,
            tenantId: subscription.tenantId,
            action: 'updated_subscription',
            details: { changes: req.body },
            ipAddress: req.ip
        });

        res.json(subscription);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update subscription' });
    }
});

export default router;
