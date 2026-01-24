
import sequelize from '../src/config/database.js';

async function addResultFields() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database...');

        const queryInterface = sequelize.getQueryInterface();
        const table = 'ipo_listings';

        // Add result_publish_date
        try {
            await queryInterface.addColumn(table, 'result_publish_date', {
                type: 'DATE', // Using DATE to match DATEONLY in model (postgres treats DATE as date only usually, or we can use DATE)
                // Actually Sequelize DATEONLY maps to Postgres DATE. 
                // Let's use raw query to be safe and specific if needed, or use addColumn with string type 'DATE'
                type: sequelize.Sequelize.DATEONLY,
                allowNull: true
            });
            console.log('Added result_publish_date column');
        } catch (error) {
            console.log('result_publish_date might already exist:', error.message);
        }

        // Add result_publish_time
        try {
            await queryInterface.addColumn(table, 'result_publish_time', {
                type: sequelize.Sequelize.TIME,
                allowNull: true
            });
            console.log('Added result_publish_time column');
        } catch (error) {
            console.log('result_publish_time might already exist:', error.message);
        }

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

addResultFields();
