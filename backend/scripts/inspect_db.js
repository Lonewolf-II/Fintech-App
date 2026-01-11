import sequelize from '../src/config/database.js';

const inspect = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected.');

        const tables = ['users'];

        for (const table of tables) {
            console.log(`\n--- Columns in ${table} ---`);
            const [results] = await sequelize.query(`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_name = '${table}';
            `);
            console.log(JSON.stringify(results, null, 2));
        }

    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
};

inspect();
