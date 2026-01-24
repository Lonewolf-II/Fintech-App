
import sequelize from '../src/config/database.js';

async function diagnose() {
    try {
        await sequelize.authenticate();

        const [results] = await sequelize.query(`
            SELECT column_name, data_type, is_nullable, column_default 
            FROM information_schema.columns 
            WHERE table_name = 'ipo_listings';
        `);

        console.log(JSON.stringify(results, null, 2));

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

diagnose();
