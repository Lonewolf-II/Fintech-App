import sequelize from '../config/database.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const resetPasswords = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected.');

        const passwordHash = await bcrypt.hash('admin123', 10);

        await User.update({ passwordHash: passwordHash }, { where: {} });

        console.log('✅ All passwords reset to: admin123');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed:', error);
        process.exit(1);
    }
};

resetPasswords();
