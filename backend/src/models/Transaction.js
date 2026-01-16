import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    transactionId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        field: 'transaction_id'
    },
    accountId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'account_id',
        references: {
            model: 'accounts',
            key: 'id'
        }
    },
    transactionType: {
        type: DataTypes.ENUM('deposit', 'withdrawal', 'transfer', 'ipo_hold', 'ipo_release', 'ipo_allotment', 'share_sale', 'profit_distribution', 'fee_deduction', 'principal_return'),
        allowNull: false,
        field: 'transaction_type'
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    balanceAfter: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        field: 'balance_after'
    },
    description: {
        type: DataTypes.TEXT
    },
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    referenceId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'reference_id'
    },
    referenceType: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'reference_type'
    },
    createdBy: {
        type: DataTypes.INTEGER,
        field: 'created_by',
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'transactions',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

export default Transaction;
