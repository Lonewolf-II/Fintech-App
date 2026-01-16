import { Sequelize } from 'sequelize';
import crypto from 'crypto';

// Decrypt database password
function decryptPassword(encryptedPassword) {
    try {
        const algorithm = 'aes-256-cbc';
        const key = crypto.scryptSync(process.env.SUPERADMIN_JWT_SECRET, 'salt', 32);
        const [ivHex, encrypted] = encryptedPassword.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error('Password decryption failed:', error);
        throw new Error('Failed to decrypt database password');
    }
}

// Get tenant database connection
function getTenantConnection(tenant) {
    const password = tenant.databasePassword.includes(':')
        ? decryptPassword(tenant.databasePassword)
        : tenant.databasePassword;

    return new Sequelize(
        tenant.databaseName,
        tenant.databaseUser,
        password,
        {
            host: tenant.databaseHost,
            port: tenant.databasePort || 5432,
            dialect: 'postgres',
            logging: false,
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            }
        }
    );
}

// Get database statistics
export async function getTenantDatabaseStats(tenant) {
    let sequelize;
    try {
        sequelize = getTenantConnection(tenant);
        await sequelize.authenticate();

        // Get database size
        const [sizeResult] = await sequelize.query(`
            SELECT pg_size_pretty(pg_database_size(current_database())) as size,
                   pg_database_size(current_database()) as size_bytes
        `);

        // Get table count
        const [tableCountResult] = await sequelize.query(`
            SELECT COUNT(*) as count
            FROM information_schema.tables
            WHERE table_schema = 'public'
        `);

        // Get total row count across all tables
        const [rowCountResult] = await sequelize.query(`
            SELECT SUM(n_live_tup) as total_rows
            FROM pg_stat_user_tables
        `);

        // Get active connections
        const [connectionResult] = await sequelize.query(`
            SELECT COUNT(*) as active_connections
            FROM pg_stat_activity
            WHERE datname = current_database()
        `);

        // Get table details
        const [tablesResult] = await sequelize.query(`
            SELECT 
                schemaname,
                tablename,
                n_live_tup as row_count,
                pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
            FROM pg_stat_user_tables
            ORDER BY n_live_tup DESC
            LIMIT 10
        `);

        return {
            databaseSize: sizeResult[0].size,
            databaseSizeBytes: parseInt(sizeResult[0].size_bytes),
            tableCount: parseInt(tableCountResult[0].count),
            totalRows: parseInt(rowCountResult[0].total_rows || 0),
            activeConnections: parseInt(connectionResult[0].active_connections),
            topTables: tablesResult,
            lastChecked: new Date()
        };
    } catch (error) {
        console.error('Failed to get database stats:', error);
        throw new Error('Failed to retrieve database statistics');
    } finally {
        if (sequelize) {
            await sequelize.close();
        }
    }
}

// Check database health
export async function checkTenantDatabaseHealth(tenant) {
    let sequelize;
    try {
        sequelize = getTenantConnection(tenant);

        const startTime = Date.now();
        await sequelize.authenticate();
        const responseTime = Date.now() - startTime;

        // Check if database is accepting connections
        const [result] = await sequelize.query('SELECT 1 as health_check');

        await sequelize.close();

        return {
            status: 'healthy',
            responseTime,
            message: 'Database is accessible and responding',
            timestamp: new Date()
        };
    } catch (error) {
        console.error('Database health check failed:', error);
        return {
            status: 'unhealthy',
            responseTime: null,
            message: error.message,
            timestamp: new Date()
        };
    } finally {
        if (sequelize) {
            try {
                await sequelize.close();
            } catch (e) {
                // Ignore close errors
            }
        }
    }
}

// Get database performance metrics
export async function getTenantDatabasePerformance(tenant) {
    let sequelize;
    try {
        sequelize = getTenantConnection(tenant);
        await sequelize.authenticate();

        // Get cache hit ratio
        const [cacheHitResult] = await sequelize.query(`
            SELECT 
                sum(heap_blks_read) as heap_read,
                sum(heap_blks_hit) as heap_hit,
                CASE 
                    WHEN sum(heap_blks_hit) + sum(heap_blks_read) = 0 THEN 0
                    ELSE (sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read))) * 100
                END as cache_hit_ratio
            FROM pg_statio_user_tables
        `);

        // Get slow queries (if pg_stat_statements is enabled)
        let slowQueries = [];
        try {
            const [slowQueriesResult] = await sequelize.query(`
                SELECT 
                    query,
                    calls,
                    total_time,
                    mean_time
                FROM pg_stat_statements
                ORDER BY mean_time DESC
                LIMIT 5
            `);
            slowQueries = slowQueriesResult;
        } catch (e) {
            // pg_stat_statements might not be enabled
        }

        // Get transaction stats
        const [transactionResult] = await sequelize.query(`
            SELECT 
                xact_commit as commits,
                xact_rollback as rollbacks,
                CASE 
                    WHEN xact_commit + xact_rollback = 0 THEN 0
                    ELSE (xact_commit::float / (xact_commit + xact_rollback)) * 100
                END as commit_ratio
            FROM pg_stat_database
            WHERE datname = current_database()
        `);

        return {
            cacheHitRatio: parseFloat(cacheHitResult[0].cache_hit_ratio || 0).toFixed(2),
            slowQueries,
            transactions: transactionResult[0],
            timestamp: new Date()
        };
    } catch (error) {
        console.error('Failed to get performance metrics:', error);
        throw new Error('Failed to retrieve performance metrics');
    } finally {
        if (sequelize) {
            await sequelize.close();
        }
    }
}

// Execute custom query on tenant database (for admin purposes)
export async function executeTenantQuery(tenant, query, params = []) {
    let sequelize;
    try {
        sequelize = getTenantConnection(tenant);
        await sequelize.authenticate();

        const [results] = await sequelize.query(query, {
            replacements: params,
            type: Sequelize.QueryTypes.SELECT
        });

        return results;
    } catch (error) {
        console.error('Query execution failed:', error);
        throw new Error('Failed to execute query');
    } finally {
        if (sequelize) {
            await sequelize.close();
        }
    }
}
