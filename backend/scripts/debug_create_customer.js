import { sequelize, Customer, Account, User } from '../src/models/index.js';

const debugCreate = async () => {
    const transaction = await sequelize.transaction();
    try {
        console.log('Authenticating...');
        await sequelize.authenticate();

        // Get a user ID for createdBy
        const user = await User.findOne();
        if (!user) throw new Error('No user found');
        const userId = user.id;

        console.log('Simulating Create Customer...');

        // Data mimicking the form payload
        const payload = {
            fullName: 'Debug User',
            email: `debug_user_${Date.now()}@test.com`,
            phone: '9841000000',
            address: 'Kathmandu',
            dateOfBirth: '', // Empty string as sent by frontend originally, now handled in controller.
            accountType: 'individual'
        };

        // Logic from controller
        const dateOfBirth = payload.dateOfBirth || null;
        const accountType = payload.accountType ? payload.accountType.toLowerCase() : 'individual';
        const customerId = `202601${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

        console.log('Customer payload:', { ...payload, dateOfBirth, customerId });

        const customer = await Customer.create({
            customerId,
            fullName: payload.fullName,
            email: payload.email,
            phone: payload.phone,
            address: payload.address,
            dateOfBirth: dateOfBirth,
            accountType: accountType,
            kycStatus: 'pending',
            createdBy: userId
        }, { transaction });

        console.log('Customer created. ID:', customer.id);

        const bankAccountType = accountType === 'corporate' ? 'current' : 'savings';
        const accountNumber = `ACC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        console.log('Account payload:', { accountNumber, accountType: bankAccountType });

        await Account.create({
            accountNumber,
            customerId: customer.id,
            accountType: bankAccountType,
            balance: 0.00,
            isPrimary: true,
            status: 'active'
        }, { transaction });

        console.log('Account created.');
        await transaction.commit();
        console.log('Transaction committed. Success.');

    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('FAILURE:');
        console.error('Message:', error.message);
        if (error.errors) {
            error.errors.forEach(e => {
                console.error(`- Field: ${e.path}, Msg: ${e.message}, Value: ${e.value}, Type: ${e.type}`);
            });
        } else {
            console.error(error);
        }
    } finally {
        await sequelize.close();
    }
};

debugCreate();
