import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from '../src/models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Rollback database migrations
 * Usage: node migrations/rollbackMigration.js <migration_number>
 * Example: node migrations/rollbackMigration.js 004
 */

const rollbackMigration = async (migrationNumber) => {
    try {
        const rollbackFile = `${migrationNumber}_*_rollback.sql`;
        const files = fs.readdirSync(__dirname)
            .filter(f => f.includes(migrationNumber) && f.includes('rollback'));

        if (files.length === 0) {
            console.error(`❌ No rollback file found for migration: ${migrationNumber}`);
            process.exit(1);
        }

        const rollbackPath = path.join(__dirname, files[0]);
        console.log(`\n🔄 Rolling back migration: ${files[0]}`);

        const sql = fs.readFileSync(rollbackPath, 'utf8');

        // Split by semicolon and filter out empty statements
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        console.log(`   Found ${statements.length} SQL statements`);

        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement) {
                try {
                    await sequelize.query(statement);
                    console.log(`   ✓ Statement ${i + 1}/${statements.length} executed`);
                } catch (error) {
                    // Log but continue for IF EXISTS statements
                    if (error.message.includes('does not exist')) {
                        console.log(`   ⚠ Statement ${i + 1}/${statements.length} skipped (does not exist)`);
                    } else {
                        throw error;
                    }
                }
            }
        }

        console.log(`✅ Rollback completed: ${files[0]}\n`);

    } catch (error) {
        console.error(`❌ Rollback failed:`, error.message);
        process.exit(1);
    }
};

const main = async () => {
    try {
        console.log('🔄 Database Migration Rollback\n');
        console.log('Connecting to database...');

        await sequelize.authenticate();
        console.log('✅ Database connected\n');

        const migrationNumber = process.argv[2];

        if (!migrationNumber) {
            console.error('❌ Please specify migration number to rollback');
            console.error('Usage: node rollbackMigration.js <migration_number>');
            console.error('Example: node rollbackMigration.js 004');
            process.exit(1);
        }

        await rollbackMigration(migrationNumber);

        console.log('🎉 Rollback completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Rollback error:', error);
        process.exit(1);
    }
};

main();
