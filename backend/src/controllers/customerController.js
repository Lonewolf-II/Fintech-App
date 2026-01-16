import { Customer, Account, CustomerCredential, ModificationRequest, sequelize } from '../models/index.js';
import { Op } from 'sequelize';
import fs from 'fs';
import csv from 'csv-parser';

// Helper to generate Customer ID: 202601XXXX
const generateCustomerId = async () => {
    const prefix = '202601';

    // Find the latest customer ID starting with the prefix
    // Note: We use raw query or Op.like logic if customerId is string in DB
    const latestCustomer = await Customer.findOne({
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

    // Pad with zeros to 4 digits (e.g. 0001)
    return `${prefix}${nextSequence.toString().padStart(4, '0')}`;
};

export const getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.findAll({
            include: [
                { association: 'creator', attributes: ['name'] },
                { association: 'verifier', attributes: ['name'] },
                {
                    association: 'accounts',
                    attributes: ['accountNumber', 'accountName', 'balance', 'isPrimary', 'accountType'] // Fetch necessary fields
                }
            ], // Include accounts
            order: [['created_at', 'DESC']]
        });

        res.json(customers);
    } catch (error) {
        console.error('Get customers error:', error);
        res.status(500).json({ error: 'Failed to fetch customers', details: error.message });
    }
};

export const getCustomerById = async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.id, {
            include: [
                { association: 'creator', attributes: ['name'] },
                { association: 'verifier', attributes: ['name'] },
                { association: 'accounts' },
                { association: 'ipoApplications' },
                {
                    association: 'portfolios',
                    include: [{ association: 'holdings' }]
                },
                { association: 'credentials' }
            ]
        });

        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        // Fetch pending modification requests
        const accountIds = (customer.accounts || []).map(a => a.id);
        const ipoIds = (customer.ipoApplications || []).map(i => i.id);
        const portfolioIds = (customer.portfolios || []).map(p => p.id);
        let holdingIds = [];
        if (customer.portfolios) {
            customer.portfolios.forEach(p => {
                if (p.holdings) {
                    holdingIds = [...holdingIds, ...p.holdings.map(h => h.id)];
                }
            });
        }

        const pendingRequests = await ModificationRequest.findAll({
            where: {
                status: 'pending',
                [Op.or]: [
                    { targetModel: 'Customer', targetId: customer.id },
                    { targetModel: 'Account', targetId: { [Op.in]: accountIds } },
                    { targetModel: 'IPOApplication', targetId: { [Op.in]: ipoIds } },
                    { targetModel: 'Holding', targetId: { [Op.in]: holdingIds } }
                ]
            }
        });

        const customerData = customer.toJSON();
        customerData.pendingRequests = pendingRequests;

        res.json(customerData);
    } catch (error) {
        console.error('Get customer error:', error);
        res.status(500).json({ error: 'Failed to fetch customer' });
    }
};

export const createCustomer = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { fullName, email, phone, address, dateOfBirth, accountType, accountNumber, accountName, bankName, branch } = req.body;

        const customerId = await generateCustomerId();

        const customer = await Customer.create({
            customerId,
            fullName,
            email,
            phone,
            address,
            dateOfBirth: dateOfBirth || null, // Handle empty string
            accountType: accountType ? accountType.toLowerCase() : 'individual',
            kycStatus: 'pending',
            createdBy: req.user.id
        }, { transaction });

        // Create default bank account based on customer type
        const bankAccountType = accountType === 'corporate' ? 'current' : 'savings';
        const finalAccountNumber = accountNumber || `ACC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        await Account.create({
            accountNumber: finalAccountNumber,
            accountName: accountName || fullName,
            bankName: bankName,
            branch: branch,
            customerId: customer.id,
            accountType: bankAccountType,
            balance: 0.00,
            isPrimary: true,
            status: 'active'
        }, { transaction });

        await transaction.commit();
        res.status(201).json(customer);
    } catch (error) {
        await transaction.rollback();
        console.error('Create customer error:', error);
        res.status(500).json({ error: error.message || 'Failed to create customer' });
    }
};

export const bulkCreateCustomers = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const results = [];
    const errors = [];

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            // Process results
            const createdCustomers = [];

            for (const row of results) {
                const transaction = await sequelize.transaction();
                try {
                    // Normalize keys (trim whitespace)
                    const cleanRow = {};
                    Object.keys(row).forEach(key => {
                        cleanRow[key.trim()] = row[key];
                    });

                    const { name, dateOfBirth, contact, email, accountType } = cleanRow;

                    if (!name || !email || !accountType) {
                        throw new Error(`Missing mandatory fields for ${name || email}`);
                    }

                    const customerId = await generateCustomerId();

                    const customer = await Customer.create({
                        customerId,
                        fullName: name,
                        email,
                        phone: contact,
                        dateOfBirth, // Ensure format YYYY-MM-DD in CSV
                        accountType: accountType.toLowerCase(), // individual/corporate
                        kycStatus: 'pending',
                        createdBy: req.user.id
                    }, { transaction });

                    // Create Account
                    const bankAccountType = accountType.toLowerCase() === 'corporate' ? 'current' : 'savings';
                    const accountNumber = `ACC-${customerId}-${Math.floor(Math.random() * 1000)}`;

                    await Account.create({
                        accountNumber,
                        customerId: customer.id,
                        accountType: bankAccountType,
                        balance: 0.00,
                        isPrimary: true,
                        status: 'active'
                    }, { transaction });

                    await transaction.commit();
                    createdCustomers.push(customer);
                } catch (error) {
                    if (transaction) await transaction.rollback();
                    console.error(`Error creating customer ${row.name}:`, error);
                    errors.push({ row, error: error.message });
                }
            }

            // Clean up file
            fs.unlinkSync(req.file.path);

            res.json({
                message: `Processed ${results.length} rows`,
                created: createdCustomers.length,
                errors: errors.length > 0 ? errors : undefined
            });
        });
};

export const updateCustomer = async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.id);

        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        // Check for Maker role
        if (req.user.role === 'maker') {
            await ModificationRequest.create({
                targetModel: 'Customer',
                targetId: req.params.id,
                requestedChanges: req.body,
                changeType: 'update',
                status: 'pending',
                requestedBy: req.user.id
            });
            return res.json({ message: 'Modification request submitted for approval', pending: true });
        }

        await customer.update(req.body);
        res.json(customer);
    } catch (error) {
        console.error('Update customer error:', error);
        res.status(500).json({ error: 'Failed to update customer' });
    }
};

export const deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.id);

        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        await customer.destroy();
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        console.error('Delete customer error:', error);
        res.status(500).json({ error: 'Failed to delete customer' });
    }
};

// Credentials Management
export const addCredential = async (req, res) => {
    try {
        const { platform, loginId, password } = req.body;
        const customerId = req.params.id;

        const credential = await CustomerCredential.create({
            customerId,
            platform,
            loginId,
            password, // NOTE: In prod, encrypt this!
            status: 'active',
            updatedBy: req.user.id
        });

        res.status(201).json(credential);
    } catch (error) {
        console.error('Add credential error:', error);
        res.status(500).json({ error: 'Failed to add credential' });
    }
};

export const updateCredential = async (req, res) => {
    try {
        const { credentialId } = req.params;
        const credential = await CustomerCredential.findByPk(credentialId);

        if (!credential) {
            return res.status(404).json({ error: 'Credential not found' });
        }

        await credential.update({
            ...req.body,
            updatedBy: req.user.id
        });
        res.json(credential);
    } catch (error) {
        console.error('Update credential error:', error);
        res.status(500).json({ error: 'Failed to update credential' });
    }
};

export const deleteCredential = async (req, res) => {
    try {
        const { credentialId } = req.params;
        const credential = await CustomerCredential.findByPk(credentialId);

        if (!credential) {
            return res.status(404).json({ error: 'Credential not found' });
        }

        await credential.destroy();
        res.json({ message: 'Credential removed' });
    } catch (error) {
        console.error('Delete credential error:', error);
        res.status(500).json({ error: 'Failed to delete credential' });
    }
};
