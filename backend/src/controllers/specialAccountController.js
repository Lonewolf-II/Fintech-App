import { SpecialAccount } from '../models/index.js';

// Get all Charge Collection Accounts (Office Accounts)
export const getChargeAccounts = async (req, res) => {
    try {
        const accounts = await SpecialAccount.findAll({
            where: { accountType: 'office' },
            order: [['accountNumber', 'ASC']]
        });
        res.json(accounts);
    } catch (error) {
        console.error('Get charge accounts error:', error);
        res.status(500).json({ error: 'Failed to fetch charge accounts' });
    }
};
