import { InvestorCategory, CategoryAccountAssignment, Investor, Account, Customer, sequelize } from '../models/index.js';

// GET /api/categories - List all categories
export const getAllCategories = async (req, res) => {
    try {
        const categories = await InvestorCategory.findAll({
            include: [
                { association: 'investor', attributes: ['name', 'investorId'] },
                { association: 'assignments' }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json(categories);
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
};

// POST /api/categories - Create category
export const createCategory = async (req, res) => {
    try {
        const { categoryName, investorId, description } = req.body;

        const category = await InvestorCategory.create({
            categoryName,
            investorId,
            description,
            status: 'active'
        });

        res.status(201).json(category);
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ error: 'Failed to create category' });
    }
};

// PUT /api/categories/:id - Update category
export const updateCategory = async (req, res) => {
    try {
        const category = await InvestorCategory.findByPk(req.params.id);

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        await category.update(req.body);
        res.json(category);
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ error: 'Failed to update category' });
    }
};

// POST /api/categories/:id/assign-accounts - Assign accounts to category
export const assignAccountsToCategory = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { accountIds } = req.body; // Array of account IDs
        const categoryId = req.params.id;

        const category = await InvestorCategory.findByPk(categoryId, { transaction });

        if (!category) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Category not found' });
        }

        const assignments = [];

        for (const accountId of accountIds) {
            const account = await Account.findByPk(accountId, { transaction });

            if (!account) {
                continue; // Skip invalid accounts
            }

            // Check if already assigned
            const existing = await CategoryAccountAssignment.findOne({
                where: { categoryId, accountId },
                transaction
            });

            if (!existing) {
                const assignment = await CategoryAccountAssignment.create({
                    categoryId,
                    customerId: account.customerId,
                    accountId,
                    assignedBy: req.user.id,
                    assignedAt: new Date()
                }, { transaction });

                assignments.push(assignment);
            }
        }

        await transaction.commit();
        res.json({
            message: `Assigned ${assignments.length} accounts to category`,
            assignments
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Assign accounts error:', error);
        res.status(500).json({ error: 'Failed to assign accounts' });
    }
};

// GET /api/categories/:id/accounts - Get assigned accounts
export const getCategoryAccounts = async (req, res) => {
    try {
        const category = await InvestorCategory.findByPk(req.params.id, {
            include: [
                { association: 'investor', attributes: ['name', 'investorId'] },
                {
                    association: 'assignments',
                    include: [
                        { association: 'customer', attributes: ['fullName', 'customerId', 'email'] },
                        { association: 'account', attributes: ['accountNumber', 'accountType', 'balance'] }
                    ]
                }
            ]
        });

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.json(category);
    } catch (error) {
        console.error('Get category accounts error:', error);
        res.status(500).json({ error: 'Failed to fetch category accounts' });
    }
};

// DELETE /api/categories/:categoryId/accounts/:accountId - Remove account from category
export const removeAccountFromCategory = async (req, res) => {
    try {
        const { categoryId, accountId } = req.params;

        const assignment = await CategoryAccountAssignment.findOne({
            where: { categoryId, accountId }
        });

        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        await assignment.destroy();
        res.json({ message: 'Account removed from category' });
    } catch (error) {
        console.error('Remove account error:', error);
        res.status(500).json({ error: 'Failed to remove account' });
    }
};
