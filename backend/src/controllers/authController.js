import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email or staff ID
        const staffId = parseInt(email);
        const user = await User.findOne({
            where: !isNaN(staffId)
                ? { staffId }
                : { email }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isValid = await user.checkPassword(password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if user is active
        if (user.status !== 'active') {
            return res.status(403).json({ error: 'Account is inactive' });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                userId: user.userId,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // Return user data and token
        res.json({
            token,
            user: {
                id: user.id,
                userId: user.userId,
                staffId: user.staffId,
                email: user.email,
                name: user.name,
                role: user.role,
                phone: user.phone,
                avatar: user.avatar,
                status: user.status
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

export const register = async (req, res) => {
    try {
        const { userId, staffId, email, password, name, role, phone } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const passwordHash = await User.hashPassword(password);

        // Create user
        const user = await User.create({
            userId,
            staffId,
            email,
            passwordHash,
            name,
            role,
            phone,
            status: 'active'
        });

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: user.id,
                userId: user.userId,
                staffId: user.staffId,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
};
