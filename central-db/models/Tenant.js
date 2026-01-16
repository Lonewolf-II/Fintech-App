import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Tenant = sequelize.define('Tenant', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        tenantKey: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            field: 'tenant_key'
        },
        companyName: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'company_name'
        },
        subdomain: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        databaseHost: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'database_host'
        },
        databasePort: {
            type: DataTypes.INTEGER,
            defaultValue: 5432,
            field: 'database_port'
        },
        databaseName: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: 'database_name'
        },
        databaseUser: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: 'database_user'
        },
        databasePassword: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: 'database_password'
            // Note: Will be encrypted before storage
        },
        status: {
            type: DataTypes.ENUM('active', 'suspended', 'trial', 'expired', 'inactive'),
            defaultValue: 'trial'
        },
        suspendedAt: {
            type: DataTypes.DATE,
            field: 'suspended_at'
        },
        notes: {
            type: DataTypes.TEXT
        }
    }, {
        tableName: 'tenants',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    return Tenant;
};
