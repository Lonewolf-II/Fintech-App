import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../src/config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const run = async () => {
    try {
        console.log('Connecting...');
        await sequelize.authenticate();
        console.log('Connected.');

        const sqlPath = path.join(__dirname, '../migrations/002_add_missing_tables.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running migration from:', sqlPath);
        await sequelize.query(sql);
        console.log('Migration executed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await sequelize.close();
    }
};

run();
