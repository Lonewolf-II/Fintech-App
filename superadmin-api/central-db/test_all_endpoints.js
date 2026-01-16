import { centralSequelize, Tenant, Subscription, License, Superadmin } from './index.js';

const testAllEndpoints = async () => {
    try {
        await centralSequelize.authenticate();
        console.log('✅ Connected to central database.\n');

        // Test 1: GET /api/tenants query
        console.log('--- Test 1: GET /api/tenants ---');
        const tenants = await Tenant.findAll({
            include: [
                { model: Subscription, as: 'subscriptions' },
                { model: License, as: 'licenses' }
            ],
            order: [['created_at', 'DESC']]
        });
        console.log('✅ Query successful!');
        console.log('Found', tenants.length, 'tenants\n');

        // Test 2: GET /api/auth/me query
        console.log('--- Test 2: GET /api/auth/me ---');
        const admin = await Superadmin.findByPk(1, {
            attributes: ['id', 'email', 'name', 'role', 'created_at', 'last_login_at']
        });
        console.log('✅ Query successful!');
        console.log('Admin:', admin?.email, '\n');

        // Test 3: Dashboard stats - tenant counts
        console.log('--- Test 3: Dashboard Stats ---');
        const [tenantCountsRaw] = await Tenant.sequelize.query(`
            SELECT status, COUNT(*) as count
            FROM "tenants"
            GROUP BY status
        `);
        console.log('✅ Tenant counts query successful!');
        console.log('Counts:', tenantCountsRaw, '\n');

        console.log('✅ ALL TESTS PASSED!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
};

testAllEndpoints();
