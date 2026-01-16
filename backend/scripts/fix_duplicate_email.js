import { sequelize, Customer } from '../src/models/index.js';

const fixDuplicateEmail = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        const email = 'abhi.pwn000@gmail.com';
        const customer = await Customer.findOne({ where: { email } });

        if (customer) {
            console.log(`Found customer with email ${email}. Deleting...`);
            await customer.destroy();
            console.log('Customer deleted successfully.');
        } else {
            console.log(`No customer found with email ${email}.`);
        }

    } catch (error) {
        console.error('Error fixing duplicate email:', error);
    } finally {
        await sequelize.close();
    }
};

fixDuplicateEmail();
