import { ActivityLog } from '../models/index.js';

/**
 * Logs a user activity to the database.
 * @param {string} userId - ID of the user performing the action
 * @param {string} action - Description of the action (e.g., 'LOGIN', 'APPROVE_KYC')
 * @param {string} entityType - Type of entity affected (e.g., 'Customer', 'Account')
 * @param {string} entityId - ID of the entity affected
 * @param {object} details - Additional details about the action
 * @param {object} req - Express request object (optional, to capture IP)
 */
export const logActivity = async (userId, action, entityType, entityId, details = {}, req = null) => {
    try {
        const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : null;

        await ActivityLog.create({
            userId,
            action,
            entityType,
            entityId,
            details,
            ipAddress
        });
    } catch (error) {
        console.error('Failed to log activity:', error);
        // Don't throw error to avoid disrupting the main flow
    }
};
