import { Sequelize } from 'sequelize';
import crypto from 'crypto';

// Cache for tenant database connections
const tenantConnections = new Map();

// Decrypt database password
function decryptPassword(encryptedPassword) {
    try {
        const algorithm = 'aes-256-cbc';
        const key = crypto.scryptSync(process.env.SUPERADMIN_JWT_SECRET || 'default-key', 'salt', 32);
        const [ivHex, encrypted] = encryptedPassword.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error('Password decryption failed:', error);
        throw new Error('Failed to decrypt database password');
    }
}

// Create or retrieve tenant database connection
export async function getTenantDatabase(tenant) {
    const cacheKey = `tenant_${tenant.id}`;

    // Return cached connection if exists and is healthy
    if (tenantConnections.has(cacheKey)) {
        const connection = tenantConnections.get(cacheKey);
        try {
            await connection.authenticate();
            return connection;
        } catch (error) {
            console.warn(`Cached connection for tenant ${tenant.id} is stale, recreating...`);
            tenantConnections.delete(cacheKey);
        }
    }

    // Decrypt password
    const dbPassword = decryptPassword(tenant.databasePassword);

    // Create new Sequelize instance for tenant
    const sequelize = new Sequelize(
        tenant.databaseName,
        tenant.databaseUser,
        dbPassword,
        {
            host: tenant.databaseHost,
            port: tenant.databasePort || 5432,
            dialect: 'postgres',
            logging: process.env.NODE_ENV === 'development' ? console.log : false,
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            }
        }
    );

    // Test connection
    await sequelize.authenticate();
    console.log(`✅ Connected to tenant database: ${tenant.companyName}`);

    // Cache the connection
    tenantConnections.set(cacheKey, sequelize);

    return sequelize;
}

// Import all models and apply them to tenant database
export async function initializeTenantModels(sequelize) {
    // Import model definitions from main backend
    const User = (await import('../models/User.js')).default;
    const Customer = (await import('../models/Customer.js')).default;
    const Account = (await import('../models/Account.js')).default;
    const Transaction = (await import('../models/Transaction.js')).default;
    const Portfolio = (await import('../models/Portfolio.js')).default;
    const Holding = (await import('../models/Holding.js')).default;
    const IPOApplication = (await import('../models/IPOApplication.js')).default;
    const IPOListing = (await import('../models/IPOListing.js')).default;

    // Initialize models with tenant's sequelize instance
    const models = {
        User: User(sequelize),
        Customer: Customer(sequelize),
        Account: Account(sequelize),
        Transaction: Transaction(sequelize),
        Portfolio: Portfolio(sequelize),
        Holding: Holding(sequelize),
        IPOApplication: IPOApplication(sequelize),
        IPOListing: IPOListing(sequelize)
    };

    // Set up associations (same as in models/index.js)
    // User - Customer associations
    models.User.hasMany(models.Customer, { foreignKey: 'createdBy', as: 'createdCustomers' });
    models.User.hasMany(models.Customer, { foreignKey: 'verifiedBy', as: 'verifiedCustomers' });
    models.Customer.belongsTo(models.User, { foreignKey: 'createdBy', as: 'creator' });
    models.Customer.belongsTo(models.User, { foreignKey: 'verifiedBy', as: 'verifier' });

    // Customer - Account associations
    models.Customer.hasMany(models.Account, { foreignKey: 'customerId', as: 'accounts' });
    models.Account.belongsTo(models.Customer, { foreignKey: 'customerId', as: 'customer' });

    // Account - Transaction associations
    models.Account.hasMany(models.Transaction, { foreignKey: 'accountId', as: 'transactions' });
    models.Transaction.belongsTo(models.Account, { foreignKey: 'accountId', as: 'account' });

    // Customer - Portfolio associations
    models.Customer.hasMany(models.Portfolio, { foreignKey: 'customerId', as: 'portfolios' });
    models.Portfolio.belongsTo(models.Customer, { foreignKey: 'customerId', as: 'customer' });

    // Portfolio - Holding associations
    models.Portfolio.hasMany(models.Holding, { foreignKey: 'portfolioId', as: 'holdings' });
    models.Holding.belongsTo(models.Portfolio, { foreignKey: 'portfolioId', as: 'portfolio' });

    // Customer - IPOApplication associations
    models.Customer.hasMany(models.IPOApplication, { foreignKey: 'customerId', as: 'ipoApplications' });
    models.IPOApplication.belongsTo(models.Customer, { foreignKey: 'customerId', as: 'customer' });

    return models;
}

// Clear all cached connections (useful for testing)
export function clearTenantConnections() {
    for (const [key, connection] of tenantConnections.entries()) {
        connection.close();
    }
    tenantConnections.clear();
}
