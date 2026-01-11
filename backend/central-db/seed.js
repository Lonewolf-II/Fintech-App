import { centralSequelize, Tenant, License, Superadmin } from './index.js';
import bcrypt from 'bcryptjs';

const seedCentralDb = async () => {
    try {
        await centralSequelize.authenticate();
        console.log('✅ Connected to central database.');

        await centralSequelize.sync();

        // Check if demo tenant exists
        const existingTenant = await Tenant.findOne({ where: { subdomain: 'demo' } });

        let tenant;
        if (existingTenant) {
            console.log('⚠️ Demo tenant already exists.');
            tenant = existingTenant;
        } else {
            console.log('🌱 Seeding demo tenant...');

            // Create tenant pointing to the local dev database
            tenant = await Tenant.create({
                tenantKey: 'demo-tenant-key',
                companyName: 'FinTech Demo Corp',
                subdomain: 'demo',
                databaseHost: 'localhost',
                databasePort: 5432,
                databaseName: 'fintech_db',
                databaseUser: 'fintech_user',
                databasePassword: 'fintech_password', // In a real app this should be encrypted
                status: 'active'
            });

            console.log('✅ Created demo tenant.');
        }

        // Create license if it doesn't exist
        const existingLicense = await License.findOne({ where: { tenantId: tenant.id } });

        if (!existingLicense) {
            await License.create({
                tenantId: tenant.id,
                licenseKey: 'DEMO-LICENSE-KEY-12345',
                featureFlags: {
                    portfolio: true,
                    ipo: true,
                    banking: true
                },
                expiresAt: null // No expiry for development
            });
            console.log('✅ Created license for demo tenant.');
        } else {
            console.log('⚠️ License already exists for demo tenant.');
        }

        // Create default superadmin
        const existingAdmin = await Superadmin.findOne({ where: { email: 'super' } });

        if (!existingAdmin) {
            const passwordHash = await bcrypt.hash('admin', 10);
            await Superadmin.create({
                email: 'super',
                passwordHash: passwordHash,
                name: 'Super Administrator',
                role: 'superadmin'
            });
            console.log('✅ Created superadmin user (email: super, password: admin)');
        } else {
            // Update password if it exists to ensure it matches 'admin'
            const passwordHash = await bcrypt.hash('admin', 10);
            await existingAdmin.update({ passwordHash });
            console.log('✅ Updated existing superadmin password to: admin');
        }

        console.log('\n🎉 Seed complete!');
        console.log('📝 Superadmin Login: super / admin');
        console.log('📝 Demo Tenant: subdomain "demo" or X-Tenant-Key: demo');
        console.log('📝 Tenant User Login: admin@fintech.com / admin123');
        process.exit(0);

    } catch (error) {
        console.error('❌ Central DB Seed failed:', error);
        process.exit(1);
    }
};

seedCentralDb();
