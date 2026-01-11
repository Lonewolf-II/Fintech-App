import sequelize from '../src/config/database.js';

const migrate = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected.');

        const queryInterface = sequelize.getQueryInterface();

        const columns = [
            { name: 'account_name', type: 'VARCHAR(255)' },
            { name: 'bank_name', type: 'VARCHAR(255)' },
            { name: 'branch', type: 'VARCHAR(255)' }
        ];

        for (const col of columns) {
            try {
                await sequelize.query(`ALTER TABLE accounts ADD COLUMN IF NOT EXISTS ${col.name} ${col.type};`);
                console.log(`Added ${col.name}.`);
            } catch (e) {
                console.warn(`Failed to add ${col.name}:`, e.message);
            }
        }

    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
};

migrate();
