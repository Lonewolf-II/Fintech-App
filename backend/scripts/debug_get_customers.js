import { sequelize, Customer, Account } from '../src/models/index.js';

const reproduce = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected.');

        console.log('Fetching customers...');
        const customers = await Customer.findAll({
            include: [{
                model: Account,
                as: 'accounts'
            }],
            order: [['created_at', 'DESC']]
        });
        console.log(`Success! Found ${customers.length} customers.`);
        console.log(JSON.stringify(customers, null, 2));

    } catch (error) {
        console.error('ERROR OCCURRED:');
        console.error(error);
    } finally {
        await sequelize.close();
    }
};

reproduce();
