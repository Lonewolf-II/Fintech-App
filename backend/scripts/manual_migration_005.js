import { sequelize } from '../src/models/index.js';

const runMigration = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        console.log('Running migration: Add account_id to ipo_applications');

        await sequelize.query(`
            ALTER TABLE ipo_applications 
            ADD COLUMN IF NOT EXISTS account_id INTEGER REFERENCES accounts(id);
        `);

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

runMigration();
