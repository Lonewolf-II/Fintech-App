import { Sequelize } from 'sequelize';
import { exec } from 'child_process';
import { promisify } from 'util';
import crypto from 'crypto';

const execAsync = promisify(exec);

// Encrypt database password
function encryptPassword(password) {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(process.env.SUPERADMIN_JWT_SECRET, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

// Provision a new tenant database
export async function provisionTenantDatabase(tenantKey) {
    try {
        const dbName = `tenant_${tenantKey}_prod`;
        const dbUser = `user_${tenantKey}`;
        const dbPassword = crypto.randomBytes(16).toString('hex');

        // Create database
        const createDbCommand = `docker-compose exec -T tenant-db psql -U postgres -c "CREATE DATABASE ${dbName};"`;
        await execAsync(createDbCommand);

        // Create user
        const createUserCommand = `docker-compose exec -T tenant-db psql -U postgres -c "CREATE USER ${dbUser} WITH PASSWORD '${dbPassword}';"`;
        await execAsync(createUserCommand);

        // Grant privileges
        const grantCommand = `docker-compose exec -T tenant-db psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO ${dbUser};"`;
        await execAsync(grantCommand);

        // Run migrations (copy schema from main backend)
        const migrateCommand = `docker-compose exec -T tenant-db psql -U ${dbUser} -d ${dbName} < backend/migrations/schema.sql`;
        await execAsync(migrateCommand);

        console.log(`✅ Database provisioned for tenant: ${tenantKey}`);

        return {
            databaseHost: process.env.DB_HOST || 'tenant-db',
            databasePort: 5432,
            databaseName: dbName,
            databaseUser: dbUser,
            databasePassword: encryptPassword(dbPassword)
        };
    } catch (error) {
        console.error('Database provisioning failed:', error);
        throw new Error('Failed to provision tenant database');
    }
}

// Test tenant database connection
export async function testTenantConnection(dbConfig) {
    try {
        const sequelize = new Sequelize(
            dbConfig.databaseName,
            dbConfig.databaseUser,
            dbConfig.databasePassword,
            {
                host: dbConfig.databaseHost,
                port: dbConfig.databasePort,
                dialect: 'postgres',
                logging: false
            }
        );

        await sequelize.authenticate();
        await sequelize.close();
        return true;
    } catch (error) {
        console.error('Connection test failed:', error);
        return false;
    }
}
