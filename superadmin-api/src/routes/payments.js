import express from 'express';
import { PaymentSubmission, PaymentVerification, Tenant, Subscription } from '../../central-db/index.js';
import { authenticateSuperadmin } from './auth.js';
import { createAuditLog } from '../utils/audit.js';

const router = express.Router();
router.use(authenticateSuperadmin);

// Get pending payments
router.get('/pending', async (req, res) => {
    try {
        const payments = await PaymentSubmission.findAll({
            where: { status: 'pending' },
            include: [
                { model: Tenant, as: 'tenant' },
                { model: Subscription, as: 'subscription' }
            ],
            order: [['submittedAt', 'DESC']]
        });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pending payments' });
    }
});

// Approve payment
router.post('/:id/approve', async (req, res) => {
    try {
        const payment = await PaymentSubmission.findByPk(req.params.id, {
            include: [{ model: Subscription, as: 'subscription' }]
        });

        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        // Update payment status
        await payment.update({ status: 'approved' });

        // Create verification record
        await PaymentVerification.create({
            paymentSubmissionId: payment.id,
            superadminId: req.superadmin.id,
            decision: 'approved',
            adminNotes: req.body.notes,
            actionTaken: 'renewed_subscription'
        });

        // Extend subscription if exists
        if (payment.subscription) {
            const newEndDate = new Date(payment.subscription.endDate);
            newEndDate.setMonth(newEndDate.getMonth() +
                (payment.subscription.billingCycle === 'yearly' ? 12 : 1));

            await payment.subscription.update({ endDate: newEndDate });
        }

        await createAuditLog({
            superadminId: req.superadmin.id,
            tenantId: payment.tenantId,
            action: 'approved_payment',
            details: { invoiceNumber: payment.invoiceNumber, amount: payment.amount },
            ipAddress: req.ip
        });

        res.json({ message: 'Payment approved successfully', payment });
    } catch (error) {
        console.error('Approve payment error:', error);
        res.status(500).json({ error: 'Failed to approve payment' });
    }
});

// Reject payment
router.post('/:id/reject', async (req, res) => {
    try {
        const payment = await PaymentSubmission.findByPk(req.params.id);
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        await payment.update({ status: 'rejected' });

        await PaymentVerification.create({
            paymentSubmissionId: payment.id,
            superadminId: req.superadmin.id,
            decision: 'rejected',
            adminNotes: req.body.reason,
            actionTaken: 'none'
        });

        await createAuditLog({
            superadminId: req.superadmin.id,
            tenantId: payment.tenantId,
            action: 'rejected_payment',
            details: { invoiceNumber: payment.invoiceNumber, reason: req.body.reason },
            ipAddress: req.ip
        });

        res.json({ message: 'Payment rejected', payment });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reject payment' });
    }
});

export default router;
