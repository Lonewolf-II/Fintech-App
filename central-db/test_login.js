import { centralSequelize, Superadmin } from './index.js';
import bcrypt from 'bcryptjs';

const testLogin = async () => {
    try {
        await centralSequelize.authenticate();
        console.log('✅ Connected to central database.');

        const admin = await Superadmin.findOne({ where: { email: 'admin@yourcompany.com' } });

        if (!admin) {
            console.log('❌ Admin not found');
            process.exit(1);
        }

        console.log('✅ Found admin:', admin.email);
        console.log('Stored hash:', admin.passwordHash);

        // Test the password
        const testPassword = 'admin123';
        const isValid = await bcrypt.compare(testPassword, admin.passwordHash);

        console.log('\nPassword test:');
        console.log('Testing password:', testPassword);
        console.log('Result:', isValid ? '✅ VALID' : '❌ INVALID');

        if (!isValid) {
            console.log('\n🔧 Resetting password...');
            const newHash = await bcrypt.hash(testPassword, 10);
            await admin.update({ passwordHash: newHash });
            console.log('✅ Password reset complete');

            // Test again
            const isValidNow = await bcrypt.compare(testPassword, newHash);
            console.log('New test result:', isValidNow ? '✅ VALID' : '❌ INVALID');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

testLogin();
