import { centralSequelize, Superadmin } from './index.js';
import bcrypt from 'bcryptjs';

async function initializeCentralDatabase() {
    try {
        console.log('🔗 Connecting to central management database...');

        // Test connection
        await centralSequelize.authenticate();
        console.log('✅ Connection established successfully.');

        // Sync all models (creates tables if they don't exist)
        console.log('📊 Syncing database models...');
        await centralSequelize.sync({ alter: true }); // Use alter in development
        console.log('✅ All models synced successfully.');

        // Create default superadmin if not exists
        console.log('👤 Checking for superadmin...');
        const existingAdmin = await Superadmin.findOne({ where: { email: 'admin@yourcompany.com' } });

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await Superadmin.create({
                email: 'admin@yourcompany.com',
                passwordHash: hashedPassword,
                name: 'Super Admin',
                role: 'owner'
            });
            console.log('✅ Default superadmin created.');
            console.log('   Email: admin@yourcompany.com');
            console.log('   Password: admin123');
            console.log('   ⚠️  IMPORTANT: Change this password immediately in production!');
        } else {
            console.log('✅ Superadmin already exists.');
        }

        console.log('\n🎉 Central database initialization complete!');
        console.log('\nNext steps:');
        console.log('1. Update .env with CENTRAL_DB_* variables');
        console.log('2. Change default superadmin password');
        console.log('3. Start the superadmin API server');

        process.exit(0);
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    }
}

initializeCentralDatabase();
