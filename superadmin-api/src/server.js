import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { centralSequelize } from '../../central-db/index.js';

// Import routes (will create these next)
import authRoutes from './routes/auth.js';
import tenantRoutes from './routes/tenants.js';
import subscriptionRoutes from './routes/subscriptions.js';
import licenseRoutes from './routes/licenses.js';
import ipWhitelistRoutes from './routes/ipWhitelists.js';
import paymentRoutes from './routes/payments.js';
import auditRoutes from './routes/audit.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors({
    origin: ['http://localhost:5174', 'http://localhost:5173'],
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'superadmin-api' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/licenses', licenseRoutes);
app.use('/api/ip-whitelists', ipWhitelistRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/audit', auditRoutes);

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
});

// Database connection and server start
async function startServer() {
    try {
        // Test central database connection
        await centralSequelize.authenticate();
        console.log('✅ Connected to central management database');

        // Sync models (in development)
        if (process.env.NODE_ENV === 'development') {
            await centralSequelize.sync({ alter: true });
            console.log('✅ Database models synced');
        }

        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 Superadmin API running on port ${PORT}`);
            console.log(`📍 Health check: http://localhost:${PORT}/health`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

export default app;
