import { centralSequelize, Superadmin } from './index.js';
import bcrypt from 'bcryptjs';

const resetPassword = async () => {
    try {
        await centralSequelize.authenticate();
        console.log('✅ Connected to central database.');

        const admin = await Superadmin.findOne({ where: { email: 'admin@yourcompany.com' } });

        if (admin) {
            const newPasswordHash = await bcrypt.hash('admin123', 10);
            await admin.update({ passwordHash: newPasswordHash });
            console.log('✅ Password reset successfully!');
            console.log('Email: admin@yourcompany.com');
            console.log('Password: admin123');
        } else {
            console.log('❌ Admin not found');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

resetPassword();
