import { AuditLog } from '../../central-db/index.js';

export async function createAuditLog({ superadminId, tenantId, action, details, ipAddress }) {
    try {
        await AuditLog.create({
            superadminId,
            tenantId,
            action,
            details,
            ipAddress
        });
    } catch (error) {
        console.error('Audit log creation failed:', error);
        // Don't throw - audit log failure shouldn't break the main operation
    }
}
