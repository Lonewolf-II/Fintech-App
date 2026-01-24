import { sequelize } from '../src/models/index.js';

async function migrate() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Connected. Altering table...');

        await sequelize.query('ALTER TABLE ipo_listings ALTER COLUMN close_date DROP NOT NULL;');

        console.log('Successfully made close_date optional.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
