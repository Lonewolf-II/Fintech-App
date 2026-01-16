import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { testConnection } from './config/database.js';
import { sequelize } from './models/index.js';
import { centralSequelize } from '../../central-db/index.js';
import { tenantContext, requireFeature, checkSubscriptionLimits } from './middleware/tenantContext.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import customerRoutes from './routes/customers.js';
import bankingRoutes from './routes/banking.js';
import portfolioRoutes from './routes/portfolio.js';
import ipoRoutes from './routes/ipo.js';
import checkerRoutes from './routes/checker.js';
import adminRoutes from './routes/admin.js';
import investorRoutes from './routes/investor.js';
import investorsRoutes from './routes/investors.js';
import categoryRoutes from './routes/category.js';
import investmentRoutes from './routes/investment.js';
import profitDistributionRoutes from './routes/profitDistribution.js';
import adminDashboardRoutes from './routes/adminDashboard.js';
import feeRoutes from './routes/fees.js';
import tenantRoutes from './routes/tenants.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Allow any localhost origin (for development)
        if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
            return callback(null, true);
        }

        // In production, check against FRONTEND_URL
        if (process.env.FRONTEND_URL) {
            const allowedOrigins = process.env.FRONTEND_URL.split(',');
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
        }

        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check (no tenant context needed)
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Apply tenant context middleware to all API routes
app.use('/api', tenantContext);

// Routes (now tenant-aware)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/banking', bankingRoutes);
app.use('/api/portfolio', requireFeature('portfolio'), portfolioRoutes);
app.use('/api/ipo', requireFeature('ipo'), ipoRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/checker', checkerRoutes);
app.use('/api', investorRoutes);
app.use('/api/investors', requireFeature('ipo'), investorsRoutes);
app.use('/api', categoryRoutes);
app.use('/api', investmentRoutes);
app.use('/api/profit-distribution', requireFeature('ipo'), profitDistributionRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/fees', requireFeature('ipo'), feeRoutes);
app.use('/api/tenants', tenantRoutes);



// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Something went wrong!',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Start server
const startServer = async () => {
    try {
        // Test central database connection (for tenant lookup)
        await centralSequelize.authenticate();
        console.log('✅ Connected to central management database');

        // Test default database connection (optional - for non-tenant routes)
        await testConnection();

        /* 
        // Sync database - Disabling global sync due to Enum mismatches. 
        // Use manual scripts for schema updates.
        if (process.env.NODE_ENV !== 'production') {
            await sequelize.sync({ alter: true });
            console.log('✅ Database synced successfully');
        } 
        */

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 API URL: http://localhost:${PORT}/api`);
            console.log(`🏢 Multi-tenant mode: ENABLED`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app;
