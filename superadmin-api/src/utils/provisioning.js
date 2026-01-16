import { Sequelize } from 'sequelize';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Encrypt database password
function encryptPassword(password) {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(process.env.SUPERADMIN_JWT_SECRET || 'default-secret-key', 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

// Provision a new tenant database using direct PostgreSQL connection
export async function provisionTenantDatabase(tenantKey) {
    try {
        const dbName = `tenant_${tenantKey}`;
        const dbUser = `user_${tenantKey}`;
        const dbPassword = crypto.randomBytes(16).toString('hex');

        console.log(`🔧 Starting database provisioning for tenant: ${tenantKey}`);

        // Connect to PostgreSQL as superuser to create database
        const adminSequelize = new Sequelize('postgres',
            process.env.DB_USER || 'postgres',
            process.env.DB_PASSWORD || 'postgres',
            {
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || 5432,
                dialect: 'postgres',
                logging: false
            }
        );

        await adminSequelize.authenticate();
        console.log('✅ Connected to PostgreSQL as admin');

        // Create database
        try {
            await adminSequelize.query(`CREATE DATABASE ${dbName};`);
            console.log(`✅ Created database: ${dbName}`);
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log(`⚠️ Database ${dbName} already exists, continuing...`);
            } else {
                throw error;
            }
        }

        // Create user and grant privileges
        try {
            await adminSequelize.query(`CREATE USER ${dbUser} WITH PASSWORD '${dbPassword}';`);
            console.log(`✅ Created user: ${dbUser}`);
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log(`⚠️ User ${dbUser} already exists, continuing...`);
            } else {
                throw error;
            }
        }

        await adminSequelize.query(`GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO ${dbUser};`);
        console.log(`✅ Granted privileges to user: ${dbUser}`);

        await adminSequelize.close();

        // Connect to the new database to set up schema
        const tenantSequelize = new Sequelize(dbName, dbUser, dbPassword, {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            dialect: 'postgres',
            logging: false
        });

        await tenantSequelize.authenticate();
        console.log(`✅ Connected to tenant database: ${dbName}`);

        // Grant schema privileges
        await tenantSequelize.query(`GRANT ALL ON SCHEMA public TO ${dbUser};`);
        await tenantSequelize.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${dbUser};`);
        await tenantSequelize.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${dbUser};`);

        // Read and execute schema file
        const schemaPath = path.join(__dirname, '../../../database/schema.sql');

        if (fs.existsSync(schemaPath)) {
            const schema = fs.readFileSync(schemaPath, 'utf8');

            // Split by semicolon and execute each statement
            const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);

            for (const statement of statements) {
                try {
                    await tenantSequelize.query(statement + ';');
                } catch (error) {
                    // Ignore errors for statements that might already exist
                    if (!error.message.includes('already exists')) {
                        console.warn(`⚠️ Warning executing statement: ${error.message}`);
                    }
                }
            }

            console.log(`✅ Schema applied to database: ${dbName}`);
        } else {
            console.warn(`⚠️ Schema file not found at ${schemaPath}, skipping schema creation`);
        }

        await tenantSequelize.close();

        console.log(`✅ Database fully provisioned for tenant: ${tenantKey}`);

        return {
            databaseHost: process.env.DB_HOST || 'localhost',
            databasePort: parseInt(process.env.DB_PORT || '5432'),
            databaseName: dbName,
            databaseUser: dbUser,
            databasePassword: encryptPassword(dbPassword)
        };
    } catch (error) {
        console.error('❌ Database provisioning failed:', error);
        throw new Error(`Failed to provision tenant database: ${error.message}`);
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
