import sequelize from '../backend/src/config/database.js';
import { SpecialAccount } from '../backend/src/models/index.js';

const seedChargesAccounts = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');

        const accounts = [
            {
                accountNumber: '1115240001',
                accountName: 'CASBA Charge Collection',
                shortName: 'CASBA Charges',
                accountType: 'office',
                status: 'active'
            },
            {
                accountNumber: '1115240002',
                accountName: 'Meroshare Charge Collection',
                shortName: 'Meroshare Fee',
                accountType: 'office',
                status: 'active'
            },
            {
                accountNumber: '1115240003',
                accountName: 'Demat Renewal Charge Collection',
                shortName: 'Demat Renewal',
                accountType: 'office',
                status: 'active'
            },
            {
                accountNumber: '1115240004',
                accountName: 'Yearly Subscription Charge Collection',
                shortName: 'Subscription Fee',
                accountType: 'office',
                status: 'active'
            }
        ];

        for (const acc of accounts) {
            const [account, created] = await SpecialAccount.findOrCreate({
                where: { accountNumber: acc.accountNumber },
                defaults: acc
            });

            if (created) {
                console.log(`Created account: ${acc.accountName} (${acc.accountNumber})`);
            } else {
                console.log(`Account already exists: ${acc.accountName} (${acc.accountNumber})`);
            }
        }

        console.log('Seeding completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

seedChargesAccounts();
