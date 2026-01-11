import { Sequelize } from 'sequelize';
import crypto from 'crypto';

// Cache for tenant database connections
const tenantConnections = new Map();

// Decrypt database password
function decryptPassword(encryptedPassword) {
    try {
        // For development: if password doesn't contain ':', treat as plain text
        if (!encryptedPassword.includes(':')) {
            console.warn('⚠️ Using plain text database password (development only)');
            return encryptedPassword;
        }

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
    // Import the model index which has all models and associations already set up
    const models = (await import('../models/index.js')).default;

    // Return the models - they're already properly initialized
    // The models use the default sequelize instance, but Sequelize models
    // can work across different connections when explicitly passed
    return models;
}

// Clear all cached connections (useful for testing)
export function clearTenantConnections() {
    for (const [key, connection] of tenantConnections.entries()) {
        connection.close();
    }
    tenantConnections.clear();
}
