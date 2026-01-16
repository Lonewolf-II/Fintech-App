import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const InvestorAccountAssignment = sequelize.define('InvestorAccountAssignment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    investorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'investor_id',
        references: {
            model: 'investors',
            key: 'id'
        }
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
    customerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'customer_id',
        references: {
            model: 'customers',
            key: 'id'
        }
    },
    assignedDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'assigned_date'
    },
    assignedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'assigned_by',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    }
}, {
    tableName: 'investor_account_assignments',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default InvestorAccountAssignment;
