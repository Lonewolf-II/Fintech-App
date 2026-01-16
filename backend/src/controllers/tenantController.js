import { Tenant, Subscription, License, PaymentSubmission, centralSequelize } from '../../central-db/index.js';
import { getTenantDatabase, initializeTenantModels } from '../config/tenantDatabase.js';
import { sendWelcomeEmail } from '../utils/email.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const encryptPassword = (password) => {
    // For development, we return plain text if not configured otherwise, 
    // or you can implement actual encryption here if needed for DB passwords
    // conforming to what getTenantDatabase expects.
    // The existing code expects 'ivHex:encrypted' or plaintext if no colon.
    // We will just use plaintext for simplicity in this task unless strict security requested.
    return password;
};

export const createTenant = async (req, res) => {
    const t = await centralSequelize.transaction();

    try {
        const {
            companyName,
            subdomain,
            planName, // 'silver', 'gold', 'platinum', 'test'
            billingCycle, // 'quarterly', 'semiannually', 'yearly', 'monthly'
            price,
            adminEmail, // Admin user email
            contactEmail // Where to send credentials
        } = req.body;

        // 1. Check if subdomain exists
        const existingTenant = await Tenant.findOne({ where: { subdomain } });
        if (existingTenant) {
            await t.rollback();
            return res.status(400).json({ error: 'Subdomain already taken' });
        }

        // 2. Calculate Subscription Details
        let days = 30; // Default monthly
        if (planName === 'test') days = 30;
        else if (billingCycle === 'quarterly') days = 90;
        else if (billingCycle === 'semiannually') days = 180;
        else if (billingCycle === 'yearly') days = 365;

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + days);

        // 3. Create Tenant in Central DB
        // We'll use a standard local DB config for all tenants for now 
        // in this dev environment (using different DB names)
        const dbName = `tenant_${subdomain}_db`;
        const dbUser = process.env.DB_USER || 'fintech_user';
        const dbPass = process.env.DB_PASSWORD || 'fintech_password';
        const dbHost = process.env.DB_HOST || 'localhost';
        const dbPort = process.env.DB_PORT || 5432;

        const tenant = await Tenant.create({
            companyName,
            subdomain,
            databaseHost: dbHost,
            databasePort: dbPort,
            databaseName: dbName,
            databaseUser: dbUser,
            databasePassword: encryptPassword(dbPass),
            status: planName === 'test' ? 'trial' : 'active'
        }, { transaction: t });

        // 4. Create Subscription
        const subscription = await Subscription.create({
            tenantId: tenant.id,
            planName,
            status: 'active',
            startDate,
            endDate,
            amount: price,
            billingCycle: planName === 'test' ? 'monthly' : billingCycle
        }, { transaction: t });

        // 5. Create License
        await License.create({
            tenantId: tenant.id,
            licenseKey: crypto.randomBytes(16).toString('hex'),
            status: 'active',
            issuedAt: new Date(),
            expiresAt: endDate,
            maxUsers: planName === 'test' ? 5 : 100, // Limit test users
            featureFlags: {
                portfolio: true,
                ipo: true,
                trading: true
            }
        }, { transaction: t });

        // 6. Create Payment Submission (Invoice) if price > 0 or test plan
        if (price > 0 || planName === 'test') {
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 7); // Due in 7 days

            await PaymentSubmission.create({
                tenantId: tenant.id,
                subscriptionId: subscription.id,
                invoiceNumber: `INV-${subdomain.toUpperCase()}-${Date.now()}`,
                amount: price,
                status: planName === 'test' ? 'approved' : 'pending',
                paymentMethod: 'qr_code',
                dueDate: dueDate,
                submittedAt: new Date()
            }, { transaction: t });
        }

        await t.commit();

        // ---------------------------------------------------------
        // Post-Transaction: Provision DB, Create Admin, Send Email
        // ---------------------------------------------------------

        console.log(`Started provisioning database for ${companyName}...`);

        try {
            // 7. Provision Tenant Database (Create DB if not exists)
            // Helper to create DB if not exists (using default connection)
            const { Client } = await import('pg');
            const pgClient = new Client({
                user: dbUser,
                password: dbPass,
                host: dbHost,
                port: dbPort,
                database: process.env.CENTRAL_DB_NAME || 'postgres' // Connect to central DB or postgres to create new DB
            });
            await pgClient.connect();

            // Check if DB exists
            const resDb = await pgClient.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
            if (resDb.rowCount === 0) {
                await pgClient.query(`CREATE DATABASE "${dbName}"`);
                console.log(`Created database ${dbName}`);
            }
            await pgClient.end();

            // 8. Connect to New Tenant DB
            const tenantDb = await getTenantDatabase(tenant);

            // 9. Sync Schema and Create Admin User
            // Use Helper
            const TenantUser = await getTenantUserModel(tenantDb);

            // Create Admin User
            const tempPassword = crypto.randomBytes(4).toString('hex'); // Simple 8 char password
            const passwordHash = await bcrypt.hash(tempPassword, 10);

            await TenantUser.create({
                userId: 'ADMIN001',
                staffId: 1,
                email: adminEmail,
                name: 'System Admin',
                role: 'admin',
                passwordHash,
                status: 'active'
            });

            // 10. Send Email
            try {
                const loginUrl = `http://${subdomain}.localhost:5173/login`; // Assuming frontend structure
                await sendWelcomeEmail(contactEmail, {
                    companyName,
                    adminEmail,
                    password: tempPassword,
                    loginUrl
                });
            } catch (emailErr) {
                console.error('EMAILING_ERROR:', emailErr);
                // Throwing here will be caught by Provisioning catch block
                throw new Error(`User created but Email failed: ${emailErr.message}`);
            }

            res.status(201).json({
                message: 'Tenant created successfully',
                tenant,
                adminCredentials: {
                    email: adminEmail,
                    password: tempPassword // Return in response for testing convenience too
                }
            });

        } catch (provisionError) {
            console.error('PROVISIONING_ERROR DETAILS:', provisionError);
            console.error('PROVISIONING_ERROR STACK:', provisionError.stack);

            // Return 201 because Tenant IS created, but warn about provisioning
            // Ideally we would trigger a background retry job here.
            res.status(201).json({
                message: 'Tenant created, but auto-provisioning failed. Please check logs or configure database manually.',
                warning: provisionError.message,
                tenant
            });
        }

    } catch (error) {
        console.error('Tenant creation failed:', error);
        if (!t.finished) await t.rollback();
        res.status(500).json({ error: error.message || 'Failed to create tenant' });
    }
};

export const getAllTenants = async (req, res) => {
    try {
        const tenants = await Tenant.findAll({
            include: ['licenses', 'subscriptions'],
            order: [['createdAt', 'DESC']]
        });
        res.json(tenants);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tenants' });
    }
};

export const deleteTenant = async (req, res) => {
    const t = await centralSequelize.transaction();
    try {
        const { id } = req.params;
        const tenant = await Tenant.findByPk(id);

        if (!tenant) {
            await t.rollback();
            return res.status(404).json({ error: 'Tenant not found' });
        }

        const { databaseName, databaseHost, databasePort, databaseUser, databasePassword } = tenant;

        // 1. Delete associated records in Central DB
        await Subscription.destroy({ where: { tenantId: id }, transaction: t });
        await License.destroy({ where: { tenantId: id }, transaction: t });
        await PaymentSubmission.destroy({ where: { tenantId: id }, transaction: t });

        // 2. Delete Tenant record
        await tenant.destroy({ transaction: t });

        await t.commit();

        // 3. Drop Tenant Database (Best effort)
        try {
            console.log(`Dropping database ${databaseName}...`);
            const { Client } = await import('pg');
            // Connect to maintenance DB
            const pgClient = new Client({
                user: process.env.DB_USER || 'fintech_user', // Use env vars as defined in createTenant
                password: process.env.DB_PASSWORD || 'fintech_password',
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || 5432,
                database: process.env.CENTRAL_DB_NAME || 'postgres'
            });
            await pgClient.connect();

            // Terminate existing connections first
            await pgClient.query(`
                SELECT pg_terminate_backend(pg_stat_activity.pid)
                FROM pg_stat_activity
                WHERE pg_stat_activity.datname = $1
                AND pid <> pg_backend_pid()
            `, [databaseName]);

            // Drop database
            await pgClient.query(`DROP DATABASE IF EXISTS "${databaseName}"`);
            await pgClient.end();
            console.log(`Dropped database ${databaseName}`);
        } catch (dbError) {
            console.error('Failed to drop tenant database:', dbError);
            // Don't fail the request since the tenant is removed from the app
        }

        res.json({ message: 'Tenant deleted successfully' });

    } catch (error) {
        console.error('Failed to delete tenant:', error);
        if (!t.finished) await t.rollback();
        res.status(500).json({ error: 'Failed to delete tenant' });
    }
};

// --- User Management Helpers & Controllers ---

const getTenantUserModel = async (tenantDb) => {
    const { DataTypes } = await import('sequelize');
    const TenantUser = tenantDb.define('User', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        userId: { type: DataTypes.STRING, unique: true, field: 'user_id' },
        staffId: { type: DataTypes.INTEGER, unique: true, field: 'staff_id' },
        email: { type: DataTypes.STRING, unique: true },
        passwordHash: { type: DataTypes.STRING, field: 'password_hash' },
        name: { type: DataTypes.STRING },
        role: { type: DataTypes.ENUM('admin', 'maker', 'checker', 'investor') },
        status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' }
    }, { tableName: 'users', underscored: true });

    // Ensure table exists (safe sync)
    await TenantUser.sync();
    return TenantUser;
};

export const getTenantUsers = async (req, res) => {
    try {
        const { id } = req.params;
        const tenant = await Tenant.findByPk(id);
        if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

        const tenantDb = await getTenantDatabase(tenant);
        const TenantUser = await getTenantUserModel(tenantDb);

        const users = await TenantUser.findAll({
            attributes: { exclude: ['passwordHash'] },
            order: [['createdAt', 'DESC']]
        });

        res.json(users);
    } catch (error) {
        console.error('Failed to fetch tenant users:', error);
        res.status(500).json({ error: 'Failed to fetch tenant users' });
    }
};

export const createTenantUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, name, role, staffId } = req.body;

        const tenant = await Tenant.findByPk(id);
        if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

        const tenantDb = await getTenantDatabase(tenant);
        const TenantUser = await getTenantUserModel(tenantDb);

        // Check existing
        const existing = await TenantUser.findOne({ where: { email } });
        if (existing) return res.status(400).json({ error: 'User with this email already exists in tenant' });

        const tempPassword = crypto.randomBytes(4).toString('hex');
        const passwordHash = await bcrypt.hash(tempPassword, 10);
        const userId = `USR-${Date.now()}`; // Simple ID generation

        const newUser = await TenantUser.create({
            userId,
            staffId: staffId || Math.floor(Math.random() * 10000), // Fallback if not provided
            email,
            name,
            role: role || 'maker',
            passwordHash,
            status: 'active'
        });

        // Send Email
        // Construct login URL
        const loginUrl = `http://${tenant.subdomain}.localhost:5173/login`;

        // Use generic email sender or reuse welcome email structure?
        // Let's send a specific "You have been added" email
        const subject = `Invitation to ${tenant.companyName}`;
        const text = `Hello ${name},\n\nYou have been added to ${tenant.companyName} as a ${role}.\n\nCredentials:\nURL: ${loginUrl}\nEmail: ${email}\nPassword: ${tempPassword}\n\nPlease change your password on first login.`;

        // Re-import sendEmail to avoid top-level cyclic dependency issues if any, though utils is safe.
        // We imported sendWelcomeEmail, let's import sendEmail too or just use sendWelcomeEmail logic.
        const { sendEmail } = await import('../utils/email.js');
        await sendEmail({ to: email, subject, text });

        res.status(201).json({
            message: 'User created successfully',
            user: { ...newUser.toJSON(), passwordHash: undefined },
            tempPassword // Return for dev convenience (remove in strict prod)
        });

    } catch (error) {
        console.error('Failed to create tenant user:', error);
        res.status(500).json({ error: error.message || 'Failed to create tenant user' });
    }
};

export const deleteTenantUser = async (req, res) => {
    try {
        const { id, userId } = req.params; // userId here is the database ID (PK)

        const tenant = await Tenant.findByPk(id);
        if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

        const tenantDb = await getTenantDatabase(tenant);
        const TenantUser = await getTenantUserModel(tenantDb);

        const deleted = await TenantUser.destroy({ where: { id: userId } });

        if (!deleted) return res.status(404).json({ error: 'User not found' });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Failed to delete tenant user:', error);
        res.status(500).json({ error: 'Failed to delete tenant user' });
    }
};
