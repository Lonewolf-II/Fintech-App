import { centralSequelize, Superadmin } from './index.js';
import bcrypt from 'bcryptjs';

const setup = async () => {
    try {
        await centralSequelize.authenticate();
        console.log('Connected to central database.');
        
        const passwordHash = await bcrypt.hash('admin123', 10);
        const admin = await Superadmin.findOne({ where: { email: 'admin@yourcompany.com' } });
        
        if (admin) {
            await admin.update({ passwordHash });
            console.log(' Password reset for: admin@yourcompany.com');
            console.log(' New password: admin123');
        } else {
            await Superadmin.create({
                email: 'admin@yourcompany.com',
                passwordHash,
                name: 'Super Admin',
                role: 'owner'
            });
            console.log(' Created superadmin: admin@yourcompany.com / admin123');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};
setup();
