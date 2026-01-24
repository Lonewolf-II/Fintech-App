
import sequelize from '../src/config/database.js';

async function ensureNullable() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database...');

        const queryInterface = sequelize.getQueryInterface();
        const table = 'ipo_listings';

        const columnsToFix = [
            'close_date',
            'close_time',
            'allotment_date',
            'allotment_time',
            'result_publish_date',
            'result_publish_time',
            'open_time',
            'scrip_name',
            'total_shares'
        ];

        for (const col of columnsToFix) {
            try {
                // Use raw query for max compatibility with Postgres
                await sequelize.query(`ALTER TABLE ${table} ALTER COLUMN ${col} DROP NOT NULL`);
                console.log(`Ensured ${col} is nullable.`);
            } catch (error) {
                console.log(`Error altering ${col}: ${error.message}`);
            }
        }

        console.log('Constraint updates completed.');
        process.exit(0);
    } catch (error) {
        console.error('Script failed:', error);
        process.exit(1);
    }
}

ensureNullable();
