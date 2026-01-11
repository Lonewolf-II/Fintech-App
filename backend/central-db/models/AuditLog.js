import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const AuditLog = sequelize.define('AuditLog', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        superadminId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'superadmins',
                key: 'id'
            },
            field: 'superadmin_id'
        },
        tenantId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'tenants',
                key: 'id'
            },
            field: 'tenant_id'
        },
        action: {
            type: DataTypes.STRING(100),
            allowNull: false
            // e.g., 'created_tenant', 'suspended_tenant', 'updated_license'
        },
        details: {
            type: DataTypes.JSONB
            // Additional context for the action
        },
        ipAddress: {
            type: DataTypes.STRING(50),
            field: 'ip_address'
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'created_at'
        }
    }, {
        tableName: 'audit_logs',
        timestamps: false
    });

    return AuditLog;
};
