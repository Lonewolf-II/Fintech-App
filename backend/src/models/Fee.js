import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Fee = sequelize.define('Fee', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    feeId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        field: 'fee_id'
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
    accountId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'account_id',
        references: {
            model: 'accounts',
            key: 'id'
        }
    },
    feeType: {
        type: DataTypes.ENUM('annual_fee', 'demat_charge', 'meroshare_charge', 'renewal_fee'),
        allowNull: false,
        field: 'fee_type'
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'due_date'
    },
    paidDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'paid_date'
    },
    status: {
        type: DataTypes.ENUM('pending', 'paid', 'waived'),
        defaultValue: 'pending'
    },
    paidFromDistribution: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'paid_from_distribution'
    },
    distributionId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'distribution_id',
        references: {
            model: 'profit_distributions',
            key: 'id'
        }
    }
}, {
    tableName: 'fees',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default Fee;
