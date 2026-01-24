import { BankConfiguration } from '../models/index.js';

// Get all bank configurations
export const getAllBankConfigs = async (req, res) => {
    try {
        const configs = await BankConfiguration.findAll({
            order: [['bankName', 'ASC']]
        });
        res.json(configs);
    } catch (error) {
        console.error('Get bank configs error:', error);
        res.status(500).json({ error: 'Failed to fetch bank configurations' });
    }
};

// Create bank configuration
export const createBankConfig = async (req, res) => {
    try {
        const { bankName, chargesCasba, casbaAmount, isActive } = req.body;

        const config = await BankConfiguration.create({
            bankName,
            chargesCasba: chargesCasba || false,
            casbaAmount: casbaAmount || 5.00,
            isActive: isActive !== undefined ? isActive : true
        });

        res.status(201).json(config);
    } catch (error) {
        console.error('Create bank config error:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Bank configuration already exists' });
        }
        res.status(500).json({ error: 'Failed to create bank configuration' });
    }
};

// Update bank configuration
export const updateBankConfig = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const config = await BankConfiguration.findByPk(id);
        if (!config) {
            return res.status(404).json({ error: 'Bank configuration not found' });
        }

        await config.update(updates);
        res.json(config);
    } catch (error) {
        console.error('Update bank config error:', error);
        res.status(500).json({ error: 'Failed to update bank configuration' });
    }
};

// Delete bank configuration
export const deleteBankConfig = async (req, res) => {
    try {
        const { id } = req.params;

        const config = await BankConfiguration.findByPk(id);
        if (!config) {
            return res.status(404).json({ error: 'Bank configuration not found' });
        }

        await config.destroy();
        res.json({ message: 'Bank configuration deleted' });
    } catch (error) {
        console.error('Delete bank config error:', error);
        res.status(500).json({ error: 'Failed to delete bank configuration' });
    }
};
