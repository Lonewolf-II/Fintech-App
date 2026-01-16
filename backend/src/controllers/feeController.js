import { Fee, Customer, Account, sequelize } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Create fee for customer
 * POST /api/fees
 */
export const createFee = async (req, res) => {
    try {
        const { customerId, accountId, feeType, amount, dueDate } = req.body;

        // Generate fee ID
        const feeId = `FEE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const fee = await Fee.create({
            feeId,
            customerId,
            accountId,
            feeType,
            amount,
            dueDate,
            status: 'pending',
            paidFromDistribution: false
        });

        res.status(201).json(fee);
    } catch (error) {
        console.error('Create fee error:', error);
        res.status(500).json({ error: 'Failed to create fee', details: error.message });
    }
};

/**
 * Get all fees with filtering
 * GET /api/fees?customerId=123&status=pending
 */
export const getAllFees = async (req, res) => {
    try {
        const { customerId, status, feeType } = req.query;
        const whereClause = {};

        if (customerId) whereClause.customerId = customerId;
        if (status) whereClause.status = status;
        if (feeType) whereClause.feeType = feeType;

        const fees = await Fee.findAll({
            where: whereClause,
            include: [
                {
                    association: 'customer',
                    attributes: ['id', 'customerId', 'fullName', 'email']
                },
                {
                    association: 'account',
                    attributes: ['id', 'accountNumber', 'accountName']
                }
            ],
            order: [['due_date', 'ASC']]
        });

        res.json(fees);
    } catch (error) {
        console.error('Get fees error:', error);
        res.status(500).json({ error: 'Failed to fetch fees' });
    }
};

/**
 * Get fee by ID
 * GET /api/fees/:id
 */
export const getFeeById = async (req, res) => {
    try {
        const fee = await Fee.findByPk(req.params.id, {
            include: [
                {
                    association: 'customer',
                    attributes: ['id', 'customerId', 'fullName', 'email']
                },
                {
                    association: 'account',
                    attributes: ['id', 'accountNumber', 'accountName']
                },
                {
                    association: 'distribution'
                }
            ]
        });

        if (!fee) {
            return res.status(404).json({ error: 'Fee not found' });
        }

        res.json(fee);
    } catch (error) {
        console.error('Get fee error:', error);
        res.status(500).json({ error: 'Failed to fetch fee' });
    }
};

/**
 * Update fee
 * PUT /api/fees/:id
 */
export const updateFee = async (req, res) => {
    try {
        const fee = await Fee.findByPk(req.params.id);

        if (!fee) {
            return res.status(404).json({ error: 'Fee not found' });
        }

        await fee.update(req.body);
        res.json(fee);
    } catch (error) {
        console.error('Update fee error:', error);
        res.status(500).json({ error: 'Failed to update fee' });
    }
};

/**
 * Mark fee as paid manually
 * POST /api/fees/:id/pay
 */
export const markFeeAsPaid = async (req, res) => {
    try {
        const fee = await Fee.findByPk(req.params.id);

        if (!fee) {
            return res.status(404).json({ error: 'Fee not found' });
        }

        if (fee.status === 'paid') {
            return res.status(400).json({ error: 'Fee is already paid' });
        }

        await fee.update({
            status: 'paid',
            paidDate: new Date(),
            paidFromDistribution: false
        });

        res.json(fee);
    } catch (error) {
        console.error('Mark fee as paid error:', error);
        res.status(500).json({ error: 'Failed to mark fee as paid' });
    }
};

/**
 * Waive fee
 * POST /api/fees/:id/waive
 */
export const waiveFee = async (req, res) => {
    try {
        const fee = await Fee.findByPk(req.params.id);

        if (!fee) {
            return res.status(404).json({ error: 'Fee not found' });
        }

        await fee.update({
            status: 'waived'
        });

        res.json(fee);
    } catch (error) {
        console.error('Waive fee error:', error);
        res.status(500).json({ error: 'Failed to waive fee' });
    }
};

/**
 * Get fee statistics
 * GET /api/fees/stats
 */
export const getFeeStats = async (req, res) => {
    try {
        const totalFees = await Fee.count();
        const pendingFees = await Fee.count({ where: { status: 'pending' } });
        const paidFees = await Fee.count({ where: { status: 'paid' } });
        const waivedFees = await Fee.count({ where: { status: 'waived' } });

        const totalPendingAmount = await Fee.sum('amount', {
            where: { status: 'pending' }
        }) || 0;

        const totalPaidAmount = await Fee.sum('amount', {
            where: { status: 'paid' }
        }) || 0;

        const feesFromDistribution = await Fee.count({
            where: { paidFromDistribution: true }
        });

        res.json({
            totalFees,
            pendingFees,
            paidFees,
            waivedFees,
            totalPendingAmount: parseFloat(totalPendingAmount).toFixed(2),
            totalPaidAmount: parseFloat(totalPaidAmount).toFixed(2),
            feesFromDistribution
        });
    } catch (error) {
        console.error('Get fee stats error:', error);
        res.status(500).json({ error: 'Failed to fetch fee statistics' });
    }
};

/**
 * Bulk create annual fees for all customers
 * POST /api/fees/bulk-annual
 */
export const bulkCreateAnnualFees = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { amount, dueDate } = req.body;

        // Get all active customers with account opening date
        const customers = await Customer.findAll({
            where: {
                accountOpeningDate: {
                    [Op.ne]: null
                }
            },
            include: [
                {
                    association: 'accounts',
                    where: { isPrimary: true }
                }
            ]
        });

        const createdFees = [];

        for (const customer of customers) {
            const account = customer.accounts[0];
            if (!account) continue;

            const feeId = `FEE-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

            const fee = await Fee.create({
                feeId,
                customerId: customer.id,
                accountId: account.id,
                feeType: 'annual_fee',
                amount,
                dueDate,
                status: 'pending',
                paidFromDistribution: false
            }, { transaction });

            createdFees.push(fee);
        }

        await transaction.commit();

        res.status(201).json({
            message: `Created ${createdFees.length} annual fees`,
            count: createdFees.length,
            fees: createdFees
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Bulk create annual fees error:', error);
        res.status(500).json({ error: 'Failed to create annual fees', details: error.message });
    }
};
