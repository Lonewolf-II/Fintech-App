import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Investor = sequelize.define('Investor', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    investorId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        field: 'investor_id'
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    totalCapital: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
        field: 'total_capital'
    },
    investedAmount: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
        field: 'invested_amount'
    },
    availableCapital: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
        field: 'available_capital'
    },
    totalProfit: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
        field: 'total_profit'
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
    tableName: 'investors',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default Investor;
