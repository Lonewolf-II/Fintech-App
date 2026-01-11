import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const License = sequelize.define('License', {
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
        licenseKey: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            field: 'license_key'
        },
        featureFlags: {
            type: DataTypes.JSONB,
            defaultValue: {},
            field: 'feature_flags'
            // Example: {ipo: true, portfolio: false, bulkUpload: true}
        },
        issuedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'issued_at'
        },
        expiresAt: {
            type: DataTypes.DATE,
            field: 'expires_at'
        },
        revokedAt: {
            type: DataTypes.DATE,
            field: 'revoked_at'
        }
    }, {
        tableName: 'licenses',
        timestamps: false
    });

    return License;
};
