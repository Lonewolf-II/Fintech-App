
import { sequelize, Account } from '../models/index.js';

const resetBlockedFunds = async () => {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Database connected.');

        // Find accounts with blocked funds
        const accounts = await Account.findAll({
            where: {
                blockedAmount: {
                    [sequelize.Sequelize.Op.gt]: 0
                }
            }
        });

        console.log(`Found ${accounts.length} accounts with blocked funds.`);

        if (accounts.length > 0) {
            console.log('Details of blocked funds (BEFORE RESET):');
            accounts.forEach(acc => {
                console.log(`- Account ${acc.accountNumber} (ID: ${acc.id}, Primary: ${acc.isPrimary}): Blocked Amount = ${acc.blockedAmount}`);
            });

            // Reset
            console.log('Resetting blocked amounts to 0...');
            await Account.update({ blockedAmount: 0 }, {
                where: {
                    blockedAmount: {
                        [sequelize.Sequelize.Op.gt]: 0
                    }
                }
            });
            console.log('Reset complete.');
        } else {
            console.log('No accounts with blocked funds found. The issue might be frontend display?');
        }

    } catch (error) {
        console.error('Error resetting blocked funds:', error);
    } finally {
        await sequelize.close();
        process.exit();
    }
};

resetBlockedFunds();
