import sequelize from '../config/database.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const seedDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database.');

        // Sync models (safety check)
        await sequelize.sync();

        const count = await User.count();
        if (count > 0) {
            console.log('⚠️ Users already exist. Skipping seed.');
            process.exit(0);
        }

        console.log('🌱 Seeding users...');

        const passwordHash = await bcrypt.hash('admin123', 10);

        const users = [
            {
                userId: 'usr_admin_001',
                staffId: 100,
                email: 'admin@fintech.com',
                password: passwordHash,
                name: 'Admin User',
                role: 'admin',
                status: 'active'
            },
            {
                userId: 'usr_maker_001',
                staffId: 101,
                email: 'maker@fintech.com',
                password: passwordHash,
                name: 'Maker User',
                role: 'maker',
                status: 'active'
            },
            {
                userId: 'usr_checker_001',
                staffId: 102,
                email: 'checker@fintech.com',
                password: passwordHash,
                name: 'Checker User',
                role: 'checker',
                status: 'active'
            },
            {
                userId: 'usr_investor_001',
                staffId: 103,
                email: 'investor@fintech.com',
                password: passwordHash,
                name: 'Investor User',
                role: 'investor',
                status: 'active'
            }
        ];

        await User.bulkCreate(users);

        console.log('✅ Seed complete! Default password: admin123');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
};

seedDatabase();
