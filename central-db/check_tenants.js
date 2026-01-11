import { Tenant } from './index.js';

async function checkTenants() {
    try {
        const tenants = await Tenant.findAll();
        console.log('--- Tenants Table Content ---');
        tenants.forEach(t => {
            console.log(`ID: ${t.id}, subdomain: ${t.subdomain}, password: ${t.databasePassword}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkTenants();
