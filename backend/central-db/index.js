import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import TenantModel from './models/Tenant.js';
import SubscriptionModel from './models/Subscription.js';
import LicenseModel from './models/License.js';
import IPWhitelistModel from './models/IPWhitelist.js';
import SuperadminModel from './models/Superadmin.js';
import PaymentSubmissionModel from './models/PaymentSubmission.js';
import PaymentVerificationModel from './models/PaymentVerification.js';
import AuditLogModel from './models/AuditLog.js';

dotenv.config();

// Central Management Database Connection
const centralSequelize = new Sequelize(
    process.env.CENTRAL_DB_NAME || 'fintech_central',
    process.env.CENTRAL_DB_USER || 'postgres',
    process.env.CENTRAL_DB_PASSWORD || 'postgres',
    {
        host: process.env.CENTRAL_DB_HOST || 'localhost',
        port: process.env.CENTRAL_DB_PORT || 5432,
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

// Initialize models
const Tenant = TenantModel(centralSequelize);
const Subscription = SubscriptionModel(centralSequelize);
const License = LicenseModel(centralSequelize);
const IPWhitelist = IPWhitelistModel(centralSequelize);
const Superadmin = SuperadminModel(centralSequelize);
const PaymentSubmission = PaymentSubmissionModel(centralSequelize);
const PaymentVerification = PaymentVerificationModel(centralSequelize);
const AuditLog = AuditLogModel(centralSequelize);

// Define associations
Tenant.hasMany(Subscription, { foreignKey: 'tenantId', as: 'subscriptions' });
Subscription.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });

Tenant.hasMany(License, { foreignKey: 'tenantId', as: 'licenses' });
License.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });

Tenant.hasMany(IPWhitelist, { foreignKey: 'tenantId', as: 'ipWhitelists' });
IPWhitelist.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });

Tenant.hasMany(PaymentSubmission, { foreignKey: 'tenantId', as: 'paymentSubmissions' });
PaymentSubmission.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });

Subscription.hasMany(PaymentSubmission, { foreignKey: 'subscriptionId', as: 'payments' });
PaymentSubmission.belongsTo(Subscription, { foreignKey: 'subscriptionId', as: 'subscription' });

PaymentSubmission.hasOne(PaymentVerification, { foreignKey: 'paymentSubmissionId', as: 'verification' });
PaymentVerification.belongsTo(PaymentSubmission, { foreignKey: 'paymentSubmissionId', as: 'payment' });

Superadmin.hasMany(PaymentVerification, { foreignKey: 'superadminId', as: 'verifications' });
PaymentVerification.belongsTo(Superadmin, { foreignKey: 'superadminId', as: 'superadmin' });

Tenant.hasMany(AuditLog, { foreignKey: 'tenantId', as: 'auditLogs' });
AuditLog.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });

Superadmin.hasMany(AuditLog, { foreignKey: 'superadminId', as: 'auditLogs' });
AuditLog.belongsTo(Superadmin, { foreignKey: 'superadminId', as: 'superadmin' });

export {
    centralSequelize,
    Tenant,
    Subscription,
    License,
    IPWhitelist,
    Superadmin,
    PaymentSubmission,
    PaymentVerification,
    AuditLog
};
