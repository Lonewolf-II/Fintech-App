import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from '../src/models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Parse SQL file into statements
 * Handles multi-line statements and DO $$ blocks
 */
const parseSQLStatements = (sql) => {
    const statements = [];
    let currentStatement = '';
    let inDollarBlock = false;
    let parenDepth = 0;

    const lines = sql.split('\n');

    for (const line of lines) {
        const trimmedLine = line.trim();

        // Skip empty lines and comment-only lines when not building a statement
        if (!currentStatement && (trimmedLine === '' || trimmedLine.startsWith('--'))) {
            continue;
        }

        // Track parentheses depth
        for (const char of line) {
            if (char === '(') parenDepth++;
            if (char === ')') parenDepth--;
        }

        // Check for DO $$ block start/end
        if (trimmedLine.includes('$$')) {
            inDollarBlock = !inDollarBlock;
        }

        currentStatement += line + '\n';

        // End statement if:
        // 1. Line ends with semicolon
        // 2. We're not in a DO block
        // 3. All parentheses are closed
        if (trimmedLine.endsWith(';') && !inDollarBlock && parenDepth === 0) {
            const stmt = currentStatement.trim();
            // Remove comments and check if there's actual SQL
            const sqlOnly = stmt.split('\n')
                .filter(l => !l.trim().startsWith('--'))
                .join('\n')
                .trim();

            if (sqlOnly) {
                statements.push(stmt);
            }
            currentStatement = '';
        }
    }

    // Add any remaining statement
    const remaining = currentStatement.trim();
    if (remaining) {
        const sqlOnly = remaining.split('\n')
            .filter(l => !l.trim().startsWith('--'))
            .join('\n')
            .trim();
        if (sqlOnly) {
            statements.push(remaining);
        }
    }

    return statements;
};

/**
 * Run database migrations
 */
const runMigration = async (migrationFile) => {
    try {
        console.log(`\n📦 Running migration: ${migrationFile}`);

        const migrationPath = path.join(__dirname, migrationFile);
        const sql = fs.readFileSync(migrationPath, 'utf8');

        // Parse SQL statements
        const statements = parseSQLStatements(sql);

        console.log(`   Found ${statements.length} SQL statements`);

        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement) {
                try {
                    await sequelize.query(statement);
                    // Show first 60 chars of statement for context
                    const preview = statement.replace(/\s+/g, ' ').substring(0, 60);
                    console.log(`   ✓ Statement ${i + 1}/${statements.length}: ${preview}...`);
                } catch (error) {
                    // Skip if already exists
                    if (error.message.includes('already exists') ||
                        error.message.includes('duplicate key') ||
                        error.message.includes('already has a constraint')) {
                        const preview = statement.replace(/\s+/g, ' ').substring(0, 60);
                        console.log(`   ⚠ Statement ${i + 1}/${statements.length}: ${preview}... (skipped - already exists)`);
                    } else {
                        console.error(`   ✗ Statement ${i + 1}/${statements.length} failed:`);
                        console.error(`     Error: ${error.message}`);
                        const preview = statement.replace(/\s+/g, ' ').substring(0, 200);
                        console.error(`     Statement: ${preview}...`);
                        throw error;
                    }
                }
            }
        }

        console.log(`✅ Migration completed: ${migrationFile}\n`);
        return true;
    } catch (error) {
        console.error(`❌ Migration failed: ${migrationFile}`);
        console.error(`   Error: ${error.message}`);
        return false;
    }
};

const main = async () => {
    try {
        console.log('🚀 Database Migration Runner\n');
        console.log('Connecting to database...');

        await sequelize.authenticate();
        console.log('✅ Database connected\n');

        const migrationArg = process.argv[2];

        if (migrationArg) {
            const files = fs.readdirSync(__dirname)
                .filter(f => f.endsWith('.sql') && !f.includes('rollback'))
                .filter(f => f.includes(migrationArg));

            if (files.length === 0) {
                console.error(`❌ No migration found matching: ${migrationArg}`);
                process.exit(1);
            }

            for (const file of files) {
                const success = await runMigration(file);
                if (!success) {
                    process.exit(1);
                }
            }
        } else {
            const files = fs.readdirSync(__dirname)
                .filter(f => f.endsWith('.sql') && !f.includes('rollback'))
                .sort();

            console.log(`Found ${files.length} migration files:\n`);
            files.forEach(f => console.log(`   - ${f}`));
            console.log('');

            for (const file of files) {
                const success = await runMigration(file);
                if (!success) {
                    console.error('\n❌ Migration process stopped due to error');
                    process.exit(1);
                }
            }
        }

        console.log('🎉 All migrations completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Migration runner error:', error);
        process.exit(1);
    }
};

main();
