import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const IPWhitelist = sequelize.define('IPWhitelist', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        tenantId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tenants',
                key: 'id'
            },
            field: 'tenant_id'
        },
        ipAddress: {
            type: DataTypes.STRING(50),
            allowNull: false,
            field: 'ip_address'
            // Supports CIDR notation (e.g., '192.168.1.0/24')
        },
        description: {
            type: DataTypes.STRING(255)
        },
        addedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'added_at'
        }
    }, {
        tableName: 'ip_whitelists',
        timestamps: false
    });

    return IPWhitelist;
};
