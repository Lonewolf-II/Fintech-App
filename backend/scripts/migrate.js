import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../src/config/database.js'; // Ensure this exports default or named correctly

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigrations = async () => {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Connected successfully.');

        const migrationsDir = path.join(__dirname, '../migrations');
        const files = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort();

        console.log(`Found ${files.length} migration files.`);

        for (const file of files) {
            console.log(`Running migration: ${file}`);
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf8');

            try {
                await sequelize.query(sql);
                console.log(`✓ ${file} executed successfully.`);
            } catch (err) {
                console.error(`✗ Failed to execute ${file}:`, err.message);
            }
        }

        console.log('All migrations processed.');
    } catch (error) {
        console.error('Migration process failed:', error);
        process.exit(1);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
};

runMigrations();
