import { SpecialAccount } from '../models/index.js';

/**
 * Seed the office special account
 * This should be run once during initial system setup
 */
async function seedOfficeAccount() {
    try {
        // Check if office account already exists
        const existingOfficeAccount = await SpecialAccount.findOne({
            where: { accountType: 'office' }
        });

        if (existingOfficeAccount) {
            console.log('✓ Office account already exists:', existingOfficeAccount.accountNumber);
            return existingOfficeAccount;
        }

        // Create office account
        const officeAccount = await SpecialAccount.create({
            accountNumber: '5001000000001',
            accountType: 'office',
            accountName: 'Office Fee Collection Account',
            shortName: 'OFFICE-FEE',
            balance: 0.00,
            investorId: null,
            status: 'active',
            createdBy: 1 // System admin
        });

        console.log('✓ Office account created successfully:', officeAccount.accountNumber);
        return officeAccount;
    } catch (error) {
        console.error('✗ Error creating office account:', error.message);
        throw error;
    }
}

export default seedOfficeAccount;
