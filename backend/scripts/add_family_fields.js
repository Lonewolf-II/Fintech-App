
import { sequelize } from '../src/models/index.js';

const addColumns = async () => {
    try {
        const queryInterface = sequelize.getQueryInterface();
        const tableName = 'customers';

        console.log('Adding missing columns to customers table...');

        const columns = [
            { name: 'father_name', type: 'VARCHAR(255)' },
            { name: 'grandfather_name', type: 'VARCHAR(255)' },
            { name: 'mother_name', type: 'VARCHAR(255)' },
            { name: 'spouse_name', type: 'VARCHAR(255)' },
            { name: 'boid', type: 'VARCHAR(255)' },
            { name: 'demat_open_date', type: 'DATE' },
            { name: 'demat_expiry_date', type: 'DATE' },
            { name: 'account_opening_date', type: 'DATE' }
        ];

        for (const col of columns) {
            try {
                await sequelize.query(`ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS ${col.name} ${col.type};`);
                console.log(`Added column: ${col.name}`);
            } catch (error) {
                console.error(`Error adding column ${col.name}:`, error.message);
            }
        }

        console.log('Schema update complete.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await sequelize.close();
    }
};

addColumns();
