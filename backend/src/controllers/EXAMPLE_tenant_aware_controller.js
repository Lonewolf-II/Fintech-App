// Example: How to update controllers to use tenant-specific database models
//
// BEFORE (using global models):
// import { Customer, Account } from '../models/index.js';
// const customers = await Customer.findAll();
//
// AFTER (using tenant models from request):
// const { Customer, Account } = req.tenantModels;
// const customers = await Customer.findAll();

import { Op } from 'sequelize';

// Helper to generate Customer ID: 202601XXXX
const generateCustomerId = async (CustomerModel) => {
    const prefix = '202601';

    const latestCustomer = await CustomerModel.findOne({
        where: {
            customerId: {
                [Op.like]: `${prefix}%`
            }
        },
        order: [['customerId', 'DESC']],
        attributes: ['customerId']
    });

    let nextSequence = 1;
    if (latestCustomer && latestCustomer.customerId) {
        const currentSequence = parseInt(latestCustomer.customerId.substring(6));
        if (!isNaN(currentSequence)) {
            nextSequence = currentSequence + 1;
        }
    }

    return `${prefix}${nextSequence.toString().padStart(4, '0')}`;
};

export const getAllCustomers = async (req, res) => {
    try {
        // Use tenant-specific models from request
        const { Customer } = req.tenantModels;

        const customers = await Customer.findAll({
            include: [
                { association: 'creator', attributes: ['name'] },
                { association: 'verifier', attributes: ['name'] }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json(customers);
    } catch (error) {
        console.error('Get customers error:', error);
        res.status(500).json({ error: 'Failed to fetch customers', details: error.message });
    }
};

export const createCustomer = async (req, res) => {
    try {
        // Use tenant-specific models
        const { Customer, Account } = req.tenantModels;
        const { tenantDb } = req;

        const {
            fullName,
            email,
            phone,
            address,
            dateOfBirth,
            panNumber,
            accountType,
            initialDeposit
        } = req.body;

        // Start transaction on tenant's database
        const transaction = await tenantDb.transaction();

        try {
            // Generate customer ID
            const customerId = await generateCustomerId(Customer);

            // Create customer
            const customer = await Customer.create({
                customerId,
                fullName,
                email,
                phone,
                address,
                dateOfBirth: dateOfBirth || null,
                panNumber,
                status: 'pending',
                createdBy: req.user.id
            }, { transaction });

            // Create primary account
            const account = await Account.create({
                customerId: customer.id,
                accountNumber: `ACC${Date.now()}`,
                accountType: accountType?.toLowerCase() || 'savings',
                balance: initialDeposit || 0,
                status: 'active',
                isPrimary: true
            }, { transaction });

            await transaction.commit();

            res.status(201).json({
                customer,
                account
            });
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        console.error('Create customer error:', error);
        res.status(500).json({
            error: 'Failed to create customer',
            details: error.message
        });
    }
};

// ... other controller methods follow the same pattern
// Always use req.tenantModels instead of importing global models
