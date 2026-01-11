import { sequelize, Customer } from '../src/models/index.js';

const verify = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected.');
        const id = 22;
        console.log(`Fetching customer ${id} with full associations...`);

        const customer = await Customer.findByPk(id, {
            include: [
                { association: 'creator', attributes: ['name'] },
                { association: 'verifier', attributes: ['name'] },
                { association: 'accounts' },
                { association: 'ipoApplications' },
                { association: 'credentials' }
            ]
        });

        if (customer) {
            console.log('Success! Customer fetched.');
            console.log('Credentials count:', customer.credentials ? customer.credentials.length : 0);
            console.log('IPO Apps count:', customer.ipoApplications ? customer.ipoApplications.length : 0);
        } else {
            console.log('Customer not found (unexpected).');
        }

    } catch (error) {
        console.error('FAILED TO FETCH:', error);
    } finally {
        await sequelize.close();
    }
};

verify();
