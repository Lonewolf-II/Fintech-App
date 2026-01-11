import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CategoryAccountAssignment = sequelize.define('CategoryAccountAssignment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'category_id',
        references: {
            model: 'investor_categories',
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
    accountId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'account_id',
        references: {
            model: 'accounts',
            key: 'id'
        }
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
    assignedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'assigned_at'
    }
}, {
    tableName: 'category_account_assignments',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default CategoryAccountAssignment;
