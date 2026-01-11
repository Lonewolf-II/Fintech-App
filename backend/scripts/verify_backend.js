import { sequelize, Customer, Account, User } from '../src/models/index.js';

const verify = async () => {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Connected.');

        console.log('Syncing database...');
        // Sync relevant models in order
        // await Customer.sync({ alter: true });
        await Account.sync({ alter: true });
        await IPOApplication.sync({ alter: true });
        console.log('Synced.');

        // Find a user to be creator
        const user = await User.findOne();
        if (!user) {
            console.log('No users found. Creating dummy user...');
            await User.create({
                username: 'admin',
                password: 'password',
                role: 'admin',
                name: 'System Admin',
                email: 'admin@example.com'
            });
        }
        const creator = await User.findOne();

        // Try creating a customer
        console.log('Creating customer...');
        const customerId = `202601${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

        try {
            const customer = await Customer.create({
                customerId: customerId,
                fullName: 'Test Customer',
                email: `test${Date.now()}@example.com`,
                phone: '1234567890',
                accountType: 'individual',
                kycStatus: 'pending',
                createdBy: creator.id
            });
            console.log('Customer created:', customer.id);

            // Create Account
            console.log('Creating account...');
            await Account.create({
                accountNumber: `ACC-${Date.now()}`,
                customerId: customer.id,
                accountType: 'savings',
                balance: 1000.00,
                isPrimary: true,
                status: 'active',
                blockedAmount: 0.00
            });
            console.log('Account created.');

        } catch (err) {
            console.error('Creation failed:', err);
            if (err.errors) {
                err.errors.forEach(e => console.error(`- ${e.message}`));
            }
        }

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        await sequelize.close();
    }
};

verify();
