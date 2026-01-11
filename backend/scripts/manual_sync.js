import { sequelize, Customer, Account, User, IPOApplication } from '../src/models/index.js';

const syncDB = async () => {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Connected.');

        console.log('Running manual migrations...');
        const queryInterface = sequelize.getQueryInterface();

        // Add columns to accounts table
        try {
            await sequelize.query('ALTER TABLE accounts ADD COLUMN IF NOT EXISTS blocked_amount DECIMAL(15, 2) DEFAULT 0.00;');
            console.log('Added blocked_amount to accounts.');
        } catch (e) {
            console.log('blocked_amount column might already exist or error:', e.message);
        }

        try {
            await sequelize.query('ALTER TABLE accounts ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false;');
            console.log('Added is_primary to accounts.');
        } catch (e) {
            console.log('is_primary column might already exist or error:', e.message);
        }

        // Create ipo_applications table
        // Since sync failed, we can try syncing JUST this model using force:true if it doesn't exist, OR use manual create table.
        // But referencing Customers might be an issue if we use raw SQL without details.
        // Let's try IPOApplication.sync() alone. It usually works if table doesn't exist.
        try {
            await IPOApplication.sync();
            console.log('IPOApplication table synced.');
        } catch (e) {
            console.error('Failed to sync IPOApplication:', e);
        }

        console.log('Schema update complete.');

        // Now Verify Data Creation
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
                fullName: 'Test Customer Manually Synced',
                email: `test_manual_${Date.now()}@example.com`,
                phone: '1234567890',
                accountType: 'individual',
                kycStatus: 'pending',
                createdBy: creator.id
            });
            console.log('Customer created:', customer.id);

            // Create Account
            console.log('Creating account...');
            await Account.create({
                accountNumber: `ACC-MANUAL-${Date.now()}`,
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
        console.error('Migration failed:', error);
    } finally {
        await sequelize.close();
    }
};

syncDB();
