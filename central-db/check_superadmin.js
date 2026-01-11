
import { centralSequelize, Superadmin } from './index.js';

const checkSuperadmin = async () => {
    try {
        await centralSequelize.authenticate();
        console.log('✅ Connected to central database.');

        const admins = await Superadmin.findAll();
        console.log('Current Superadmins:', admins.map(a => ({ id: a.id, email: a.email, role: a.role })));

        process.exit(0);
    } catch (error) {
        console.error('❌ Check failed:', error);
        process.exit(1);
    }
};

checkSuperadmin();
