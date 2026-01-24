import { sequelize } from '../src/models/index.js';

async function clearIPOData() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Connected.');

        console.log('Clearing IPO Applications...');
        await sequelize.query('TRUNCATE TABLE ipo_applications RESTART IDENTITY CASCADE;');

        console.log('Clearing IPO Listings...');
        // We need to disable foreign key checks or cascade, generic SQL often implies CASCADE with truncate for Postgres
        // Sequelize model destroy might be safer if constraints are tricky, but truncate is cleaner for ID reset.
        await sequelize.query('TRUNCATE TABLE ipo_listings RESTART IDENTITY CASCADE;');

        console.log('All IPO data cleared successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Failed to clear data:', error);
        process.exit(1);
    }
}

clearIPOData();
