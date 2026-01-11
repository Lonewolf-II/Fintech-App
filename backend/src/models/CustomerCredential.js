import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CustomerCredential = sequelize.define('CustomerCredential', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    customerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'customer_id',
        references: {
            model: 'customers',
            key: 'id'
        }
    },
    platform: {
        type: DataTypes.ENUM('mobile_banking', 'meroshare', 'tms'),
        allowNull: false
    },
    loginId: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'login_id'
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'locked'),
        defaultValue: 'active'
    },
    updatedBy: {
        type: DataTypes.INTEGER,
        field: 'updated_by',
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'customer_credentials',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default CustomerCredential;
