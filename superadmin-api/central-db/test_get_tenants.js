import { centralSequelize, Tenant, Subscription, License } from './index.js';

const testGetTenants = async () => {
    try {
        await centralSequelize.authenticate();
        console.log('✅ Connected to central database.');

        console.log('\n--- Testing GET /api/tenants query ---');

        const tenants = await Tenant.findAll({
            include: [
                { model: Subscription, as: 'subscriptions' },
                { model: License, as: 'licenses' }
            ],
            order: [['createdAt', 'DESC']]
        });

        console.log('✅ Query successful!');
        console.log('Found', tenants.length, 'tenants');
        tenants.forEach(t => {
            console.log(' -', t.companyName, `(${t.subdomain})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
};

testGetTenants();
