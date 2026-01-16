import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import { Customer, ModificationRequest, sequelize } from '../models/index.js';
import { Op } from 'sequelize';
import fs from 'fs';
import csv from 'csv-parser';

// Get all accounts
export const getAllAccounts = async (req, res) => {
    try {
        const accounts = await Account.findAll({
            include: [{ model: Customer, as: 'customer', attributes: ['fullName', 'email'] }],
            order: [['created_at', 'DESC']]
        });
        res.json(accounts);
    } catch (error) {
        console.error('Get accounts error:', error);
        res.status(500).json({ error: 'Failed to fetch accounts' });
    }
};

// Create account
export const createAccount = async (req, res) => {
    try {
        const { customerId, accountType, bankName, branch, accountName, accountNumber, status } = req.body;

        // Check if customer has existing accounts to determine isPrimary
        const existingAccountCount = await Account.count({ where: { customerId } });
        const isPrimary = existingAccountCount === 0;

        // Use provided account number or generate one
        const finalAccountNumber = accountNumber || `ACC-${Date.now()}`;

        const account = await Account.create({
            accountNumber: finalAccountNumber,
            customerId,
            accountType,
            bankName,
            branch,
            accountName,
            balance: 0,
            currency: 'NPR',
            status: status || 'active',
            isPrimary
        });

        res.status(201).json(account);
    } catch (error) {
        console.error('Create account error:', error);
        res.status(500).json({ error: 'Failed to create account' });
    }
};

// Get transactions for an account
export const getAccountTransactions = async (req, res) => {
    try {
        const { startDate, endDate, type } = req.query;
        const whereClause = { accountId: req.params.accountId };

        if (startDate && endDate) {
            whereClause.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        if (type && type !== 'all') {
            whereClause.transactionType = type;
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 25;
        const offset = (page - 1) * limit;

        const { count, rows } = await Transaction.findAndCountAll({
            where: whereClause,
            order: [['created_at', 'DESC']],
            limit,
            offset
        });

        res.json({
            transactions: rows,
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
};

// Create transaction (deposit/withdrawal)
export const createTransaction = async (req, res) => {
    try {
        const { accountId, transactionType, amount, description } = req.body;

        const account = await Account.findByPk(accountId);
        if (!account) {
            return res.status(404).json({ error: 'Account not found' });
        }

        let newBalance = parseFloat(account.balance);
        if (transactionType === 'deposit') {
            newBalance += parseFloat(amount);
        } else if (transactionType === 'withdrawal') {
            if (newBalance < parseFloat(amount)) {
                return res.status(400).json({ error: 'Insufficient balance' });
            }
            newBalance -= parseFloat(amount);
        }

        const transaction = await Transaction.create({
            transactionId: `TXN-${Date.now()}`,
            accountId,
            transactionType,
            amount,
            balanceAfter: newBalance,
            description,
            createdBy: req.user.id
        });

        await account.update({ balance: newBalance });

        res.status(201).json(transaction);
    } catch (error) {
        console.error('Create transaction error:', error);
        res.status(500).json({ error: 'Failed to create transaction' });
    }
};

// Update account (Maker-Checker)
export const updateAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const account = await Account.findByPk(id);

        if (!account) {
            return res.status(404).json({ error: 'Account not found' });
        }

        // Check for Maker role
        if (req.user.role === 'maker') {
            await ModificationRequest.create({
                targetModel: 'Account',
                targetId: id,
                requestedChanges: updates,
                changeType: 'update',
                status: 'pending',
                requestedBy: req.user.id
            });
            return res.json({ message: 'Modification request submitted for approval', pending: true });
        }

        // Admin/Checker/Other can update directly
        await account.update(updates);
        res.json(account);
    } catch (error) {
        console.error('Update account error:', error);
        res.status(500).json({ error: 'Failed to update account' });
    }
};
// Bulk Deposit
export const bulkDeposit = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const results = [];
    const errors = [];
    const createdTransactions = [];

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            for (const row of results) {
                const transaction = await sequelize.transaction();
                try {
                    // Expected CSV headers: accountNumber, amount, description
                    const cleanRow = {};
                    Object.keys(row).forEach(key => {
                        cleanRow[key.trim()] = row[key];
                    });

                    const { accountNumber, amount, description } = cleanRow;

                    if (!accountNumber || !amount) {
                        throw new Error(`Missing mandatory fields for row: ${JSON.stringify(cleanRow)}`);
                    }

                    const account = await Account.findOne({ where: { accountNumber } });
                    if (!account) {
                        throw new Error(`Account not found: ${accountNumber}`);
                    }

                    const newBalance = parseFloat(account.balance) + parseFloat(amount);

                    const txn = await Transaction.create({
                        transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                        accountId: account.id,
                        transactionType: 'deposit',
                        amount: parseFloat(amount),
                        balanceAfter: newBalance,
                        description: description || 'Bulk Deposit',
                        createdBy: req.user.id
                    }, { transaction });

                    await account.update({ balance: newBalance }, { transaction });

                    await transaction.commit();
                    createdTransactions.push(txn);
                } catch (error) {
                    await transaction.rollback();
                    console.error(`Error processing row ${JSON.stringify(row)}:`, error);
                    errors.push({ row, error: error.message });
                }
            }

            // Cleanup
            fs.unlinkSync(req.file.path);

            res.json({
                message: `Processed ${results.length} rows`,
                successCount: createdTransactions.length,
                errors: errors.length > 0 ? errors : undefined
            });
        });
};
