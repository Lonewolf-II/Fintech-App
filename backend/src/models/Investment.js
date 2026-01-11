import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Investment = sequelize.define('Investment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    investmentId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        field: 'investment_id'
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
    ipoApplicationId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'ipo_application_id',
        references: {
            model: 'ipo_applications',
            key: 'id'
        }
    },
    // Investment Details
    principalAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        field: 'principal_amount'
    },
    sharesAllocated: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'shares_allocated'
    },
    costPerShare: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'cost_per_share'
    },
    totalCost: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        field: 'total_cost'
    },
    // Current Status
    sharesHeld: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'shares_held'
    },
    currentMarketPrice: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        field: 'current_market_price'
    },
    currentValue: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
        field: 'current_value'
    },
    // Profit Tracking
    totalSoldAmount: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
        field: 'total_sold_amount'
    },
    investorProfit: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
        field: 'investor_profit'
    },
    customerProfit: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
        field: 'customer_profit'
    },
    adminFee: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
        field: 'admin_fee'
    },
    status: {
        type: DataTypes.ENUM('active', 'partially_sold', 'fully_realized'),
        defaultValue: 'active'
    },
    investedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'invested_at'
    }
}, {
    tableName: 'investments',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default Investment;
