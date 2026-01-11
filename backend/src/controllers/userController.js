import { User } from '../models/index.js';

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['passwordHash'] },
            order: [['createdAt', 'DESC']]
        });

        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['passwordHash'] }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};

export const createUser = async (req, res) => {
    try {
        const { userId, staffId, email, password, name, role, phone, status } = req.body;

        // Check if user exists
        const existing = await User.findOne({
            where: { email }
        });

        if (existing) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const passwordHash = await User.hashPassword(password || 'default123');

        const user = await User.create({
            userId,
            staffId,
            email,
            passwordHash,
            name,
            role,
            phone,
            status: status || 'active'
        });

        const { passwordHash: _, ...userData } = user.toJSON();
        res.status(201).json(userData);
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
};

export const updateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { password, ...updateData } = req.body;

        if (password) {
            updateData.passwordHash = await User.hashPassword(password);
        }

        await user.update(updateData);

        const { passwordHash: _, ...userData } = user.toJSON();
        res.json(userData);
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await user.destroy();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

export const resetUserPassword = async (req, res) => {
    try {
        const { password } = req.body;
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const passwordHash = await User.hashPassword(password);
        await user.update({ passwordHash });

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
};
