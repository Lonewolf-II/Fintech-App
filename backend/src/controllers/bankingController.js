import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import { Customer, ModificationRequest } from '../models/index.js';
import { Op } from 'sequelize';

// Get all accounts
export const getAllAccounts = async (req, res) => {
    try {
        const accounts = await Account.findAll({
            include: [{ model: Customer, as: 'customer', attributes: ['fullName', 'email'] }],
            order: [['createdAt', 'DESC']]
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
            status: status || 'active'
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

        const transactions = await Transaction.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            limit: 100 // Increased limit for statement view
        });
        res.json(transactions);
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
