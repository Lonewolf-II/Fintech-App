
import { centralSequelize, Superadmin } from './index.js';
import bcrypt from 'bcryptjs';

const fixSuperadmin = async () => {
    try {
        await centralSequelize.authenticate();
        console.log('✅ Connected to central database.');

        // Find ANY superadmin or specifically admin@yourcompany.com
        const existingAdmin = await Superadmin.findOne();
        const passwordHash = await bcrypt.hash('admin', 10);

        if (existingAdmin) {
            console.log(`Found existing admin: ${existingAdmin.email}. Updating...`);
            await existingAdmin.update({
                email: 'super',
                passwordHash: passwordHash,
                role: 'superadmin'
            });
            console.log('✅ Updated existing admin to super / admin');
        } else {
            console.log('No admin found. Creating new one...');
            await Superadmin.create({
                email: 'super',
                passwordHash: passwordHash,
                name: 'Super Administrator',
                role: 'superadmin'
            });
            console.log('✅ Created new admin: super / admin');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Fix failed:', error);
        process.exit(1);
    }
};

fixSuperadmin();
