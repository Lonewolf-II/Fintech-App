import { Customer, Account, sequelize } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Check for minor accounts where customer has turned 18 and freeze them
 * This should be run as a daily scheduled job
 */
export const freezeMaturedMinorAccounts = async () => {
    try {
        const today = new Date();
        const eighteenYearsAgo = new Date(
            today.getFullYear() - 18,
            today.getMonth(),
            today.getDate()
        );

        // Find all customers with minor accounts who are now 18+
        const customersToUpdate = await Customer.findAll({
            where: {
                dateOfBirth: {
                    [Op.lte]: eighteenYearsAgo
                }
            },
            include: [{
                model: Account,
                as: 'accounts',
                where: {
                    accountCategory: 'minor',
                    status: 'active'
                },
                required: true
            }]
        });

        const results = {
            checked: customersToUpdate.length,
            frozen: 0,
            errors: []
        };

        for (const customer of customersToUpdate) {
            try {
                // Freeze all minor accounts for this customer
                await Account.update(
                    {
                        status: 'frozen',
                        // Could add a note field: freezeReason: 'Minor account matured - KYC update required'
                    },
                    {
                        where: {
                            customerId: customer.id,
                            accountCategory: 'minor',
                            status: 'active'
                        }
                    }
                );

                results.frozen += customer.accounts.length;

                console.log(`🔒 Frozen ${customer.accounts.length} minor account(s) for customer ${customer.customerId} (${customer.fullName}) - turned 18`);
            } catch (error) {
                console.error(`Error freezing accounts for customer ${customer.customerId}:`, error);
                results.errors.push({
                    customerId: customer.customerId,
                    error: error.message
                });
            }
        }

        console.log(`\n📊 Minor Account Freeze Summary:`);
        console.log(`   Customers checked: ${results.checked}`);
        console.log(`   Accounts frozen: ${results.frozen}`);
        console.log(`   Errors: ${results.errors.length}`);

        return results;
    } catch (error) {
        console.error('Error in freezeMaturedMinorAccounts:', error);
        throw error;
    }
};

/**
 * Upgrade a minor account to major after KYC verification
 * This should be called by makers when updating KYC for matured minors
 */
export const upgradeMinorToMajor = async (accountId, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const account = await Account.findByPk(accountId, {
            include: [{
                model: Customer,
                as: 'customer'
            }],
            transaction
        });

        if (!account) {
            throw new Error('Account not found');
        }

        if (account.accountCategory !== 'minor') {
            throw new Error('Account is not a minor account');
        }

        // Verify customer is now 18+
        const customer = account.customer;
        if (!customer.dateOfBirth) {
            throw new Error('Customer date of birth not found');
        }

        const today = new Date();
        const birthDate = new Date(customer.dateOfBirth);
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        let actualAge = age;
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            actualAge = age - 1;
        }

        if (actualAge < 18) {
            throw new Error('Customer is still under 18 years old');
        }

        // Upgrade account to major and unfreeze
        await account.update({
            accountCategory: 'major',
            status: 'active'
        }, { transaction });

        await transaction.commit();

        console.log(`✅ Upgraded account ${account.accountNumber} from minor to major for customer ${customer.customerId}`);

        return account;
    } catch (error) {
        await transaction.rollback();
        console.error('Error upgrading minor account:', error);
        throw error;
    }
};
