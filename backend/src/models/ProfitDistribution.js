import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ProfitDistribution = sequelize.define('ProfitDistribution', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    distributionId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        field: 'distribution_id'
    },
    investmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'investment_id',
        references: {
            model: 'investments',
            key: 'id'
        }
    },
    // Sale Details
    sharesSold: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'shares_sold'
    },
    salePricePerShare: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'sale_price_per_share'
    },
    totalSaleAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        field: 'total_sale_amount'
    },
    // Distribution
    principalReturned: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        field: 'principal_returned'
    },
    totalProfit: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        field: 'total_profit'
    },
    investorShare: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        field: 'investor_share'
    },
    customerShare: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        field: 'customer_share'
    },
    adminFee: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        field: 'admin_fee'
    },
    distributedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'distributed_at'
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
    tableName: 'profit_distributions',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default ProfitDistribution;
