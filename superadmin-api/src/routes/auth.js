import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Superadmin } from '../../central-db/index.js';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        // Find superadmin
        const superadmin = await Superadmin.findOne({ where: { email } });
        if (!superadmin) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, superadmin.passwordHash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        await superadmin.update({ lastLoginAt: new Date() });

        // Generate JWT
        const token = jwt.sign(
            {
                id: superadmin.id,
                email: superadmin.email,
                role: superadmin.role
            },
            process.env.SUPERADMIN_JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            superadmin: {
                id: superadmin.id,
                email: superadmin.email,
                name: superadmin.name,
                role: superadmin.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get current superadmin info
router.get('/me', authenticateSuperadmin, async (req, res) => {
    try {
        const superadmin = await Superadmin.findByPk(req.superadmin.id, {
            attributes: ['id', 'email', 'name', 'role', 'createdAt', 'lastLoginAt']
        });
        res.json(superadmin);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Middleware to authenticate superadmin
export function authenticateSuperadmin(req, res, next) {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.SUPERADMIN_JWT_SECRET);
        req.superadmin = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
}

export default router;
