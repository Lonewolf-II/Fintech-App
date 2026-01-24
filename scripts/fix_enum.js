import sequelize from '../backend/src/config/database.js';

const fixEnum = async () => {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Database connected.');

        console.log('Fixing ENUM "enum_ipo_listings_status"...');

        // Add "result_published"
        try {
            await sequelize.query(`ALTER TYPE "enum_ipo_listings_status" ADD VALUE 'result_published';`);
            console.log('Added "result_published" to ENUM.');
        } catch (err) {
            console.log('Error adding "result_published" (might already exist):', err.message);
        }

        // Add "allotted"
        try {
            await sequelize.query(`ALTER TYPE "enum_ipo_listings_status" ADD VALUE 'allotted';`);
            console.log('Added "allotted" to ENUM.');
        } catch (err) {
            console.log('Error adding "allotted" (might already exist):', err.message);
        }

        console.log('Fix complete.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

fixEnum();
