import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SpecialAccount = sequelize.define('SpecialAccount', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    accountNumber: {
        type: DataTypes.STRING(13),
        unique: true,
        allowNull: false,
        field: 'account_number'
    },
    accountType: {
        type: DataTypes.ENUM('office', 'investor'),
        allowNull: false,
        field: 'account_type'
    },
    accountName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'account_name'
    },
    shortName: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: 'short_name'
    },
    balance: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00
    },
    investorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'investor_id',
        references: {
            model: 'investors',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'created_by',
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'special_accounts',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default SpecialAccount;
