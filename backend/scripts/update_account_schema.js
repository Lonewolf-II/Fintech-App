
import { sequelize } from '../src/models/index.js';

const updateSchema = async () => {
    try {
        const queryInterface = sequelize.getQueryInterface();
        const tableName = 'accounts';

        console.log('Updating accounts table schema...');

        // Update account_number length
        try {
            await sequelize.query(`ALTER TABLE ${tableName} ALTER COLUMN account_number TYPE VARCHAR(50);`);
            console.log('Updated account_number to VARCHAR(50)');
        } catch (error) {
            console.error('Error updating account_number:', error.message);
        }

        // Update short_name length
        try {
            await sequelize.query(`ALTER TABLE ${tableName} ALTER COLUMN short_name TYPE VARCHAR(50);`);
            console.log('Updated short_name to VARCHAR(50)');
        } catch (error) {
            console.error('Error updating short_name:', error.message);
        }

        console.log('Schema update complete.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await sequelize.close();
    }
};

updateSchema();
