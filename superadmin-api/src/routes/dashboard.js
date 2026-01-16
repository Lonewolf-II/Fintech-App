import express from 'express';
import { Sequelize } from 'sequelize';
import { Tenant, Subscription, PaymentSubmission, AuditLog } from '../../central-db/index.js';
import { authenticateSuperadmin } from './auth.js';

const router = express.Router();
const { Op } = Sequelize;

// All routes require authentication
router.use(authenticateSuperadmin);

// Get dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        // Get tenant counts by status - using raw query to avoid Sequelize group issues
        const [tenantCountsRaw] = await Tenant.sequelize.query(`
            SELECT status, COUNT(*) as count
            FROM "tenants"
            GROUP BY status
        `);

        const statusCounts = {
            total: 0,
            active: 0,
            trial: 0,
            suspended: 0,
            expired: 0
        };

        tenantCountsRaw.forEach(item => {
            const count = parseInt(item.count);
            statusCounts[item.status] = count;
            statusCounts.total += count;
        });

        // Get active subscriptions count
        const activeSubscriptions = await Subscription.count({
            where: {
                endDate: {
                    [Op.gte]: new Date()
                }
            }
        });

        // Get expiring subscriptions (next 30 days)
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const expiringSubscriptions = await Subscription.count({
            where: {
                endDate: {
                    [Op.between]: [new Date(), thirtyDaysFromNow]
                }
            }
        });

        // Get pending payments
        const pendingPayments = await PaymentSubmission.count({
            where: {
                status: 'pending'
            }
        });

        // Calculate total revenue (from approved payments)
        const revenueResult = await PaymentSubmission.findOne({
            attributes: [
                [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalRevenue']
            ],
            where: {
                status: 'approved'
            }
        });

        const totalRevenue = parseFloat(revenueResult?.dataValues?.totalRevenue || 0);

        // Get monthly revenue (current month)
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlyRevenueResult = await PaymentSubmission.findOne({
            attributes: [
                [Sequelize.fn('SUM', Sequelize.col('amount')), 'monthlyRevenue']
            ],
            where: {
                status: 'approved',
                submitted_at: {
                    [Op.gte]: startOfMonth
                }
            }
        });

        const monthlyRevenue = parseFloat(monthlyRevenueResult?.dataValues?.monthlyRevenue || 0);

        // Get tenant growth (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const tenantGrowth = await Tenant.findAll({
            attributes: [
                [Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('created_at')), 'month'],
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
            ],
            where: {
                created_at: {
                    [Op.gte]: sixMonthsAgo
                }
            },
            group: [Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('created_at'))],
            order: [[Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('created_at')), 'ASC']]
        });

        res.json({
            tenants: statusCounts,
            subscriptions: {
                active: activeSubscriptions,
                expiring: expiringSubscriptions
            },
            payments: {
                pending: pendingPayments
            },
            revenue: {
                total: totalRevenue,
                monthly: monthlyRevenue
            },
            growth: tenantGrowth.map(item => ({
                month: item.dataValues.month,
                count: parseInt(item.dataValues.count)
            }))
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
});

// Get recent activity
router.get('/recent-activity', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;

        const recentActivity = await AuditLog.findAll({
            include: [
                {
                    model: Tenant,
                    as: 'tenant',
                    attributes: ['id', 'companyName', 'subdomain']
                }
            ],
            order: [['created_at', 'DESC']],
            limit
        });

        res.json(recentActivity);
    } catch (error) {
        console.error('Recent activity error:', error);
        res.status(500).json({ error: 'Failed to fetch recent activity' });
    }
});

// Get system health overview
router.get('/health', async (req, res) => {
    try {
        // Check database connection
        const dbHealthy = await Tenant.sequelize.authenticate()
            .then(() => true)
            .catch(() => false);

        // Get system uptime (this is a placeholder - in production, track actual uptime)
        const uptime = process.uptime();

        // Get memory usage
        const memoryUsage = process.memoryUsage();

        res.json({
            status: dbHealthy ? 'healthy' : 'unhealthy',
            database: dbHealthy ? 'connected' : 'disconnected',
            uptime: Math.floor(uptime),
            memory: {
                used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
                total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
                percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
            },
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({ error: 'Failed to check system health' });
    }
});

export default router;
