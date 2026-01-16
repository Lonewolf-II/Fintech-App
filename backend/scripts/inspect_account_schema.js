
import { sequelize } from '../src/models/index.js';

const inspectSchema = async () => {
    try {
        const [results] = await sequelize.query(`
            SELECT column_name, data_type, character_maximum_length 
            FROM information_schema.columns 
            WHERE table_name = 'accounts' AND column_name IN ('account_number', 'short_name');
        `);

        console.log('Column Schema Information:');
        console.table(results);

    } catch (error) {
        console.error('Inspection failed:', error);
    } finally {
        await sequelize.close();
    }
};

inspectSchema();
