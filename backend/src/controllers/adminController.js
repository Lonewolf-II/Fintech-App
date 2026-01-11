import { ActivityLog, User, IPOApplication, Account } from '../models/index.js';
import { logActivity } from '../utils/logger.js';

/**
 * Get all activity logs with pagination and filtering
 */
export const getActivityLogs = async (req, res) => {
    try {
        const { page = 1, limit = 20, userId, action } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        if (userId) where.userId = userId;
        if (action) where.action = action;

        const { count, rows } = await ActivityLog.findAndCountAll({
            where,
            include: [
                { model: User, as: 'user', attributes: ['name', 'email', 'role'] }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            logs: rows,
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error('Get activity logs error:', error);
        res.status(500).json({ error: 'Failed to fetch activity logs' });
    }
};

export const deleteIPOApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const application = await IPOApplication.findByPk(id);

        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        // If verified, unblock funds
        if (application.status === 'verified') {
            const account = await Account.findOne({
                where: { customerId: application.customerId, isPrimary: true }
            });

            if (account) {
                account.blockedAmount = Math.max(0, parseFloat(account.blockedAmount) - parseFloat(application.totalAmount));
                await account.save();
            }
        }

        await application.destroy();
        await logActivity(req.user.id, 'DELETE_IPO', 'IPOApplication', id, { company: application.companyName }, req);

        res.json({ message: 'IPO Application deleted successfully' });
    } catch (error) {
        console.error('Delete IPO error:', error);
        res.status(500).json({ error: 'Failed to delete IPO application' });
    }
};
