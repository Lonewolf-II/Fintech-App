import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Holding = sequelize.define('Holding', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    holdingId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        field: 'holding_id'
    },
    portfolioId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'portfolio_id',
        references: {
            model: 'portfolios',
            key: 'id'
        }
    },
    investmentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'investment_id',
        references: {
            model: 'investments',
            key: 'id'
        }
    },
    stockSymbol: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'stock_symbol'
    },
    companyName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'company_name'
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    purchasePrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'purchase_price'
    },
    currentPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'current_price'
    },
    profitLossPercent: {
        type: DataTypes.DECIMAL(5, 2),
        field: 'profit_loss_percent'
    },
    totalProfit: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
        field: 'total_profit'
    },
    totalSoldQuantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'total_sold_quantity'
    },
    averageSalePrice: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        field: 'average_sale_price'
    },
    purchaseDate: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
        field: 'purchase_date'
    },
    lastTransactionPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'last_transaction_price'
    },
    lastClosingPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'last_closing_price'
    },
    valueAtClosing: {
        type: DataTypes.VIRTUAL,
        get() {
            return parseFloat(this.quantity || 0) * parseFloat(this.lastClosingPrice || 0);
        }
    },
    valueAtLTP: {
        type: DataTypes.VIRTUAL,
        get() {
            return parseFloat(this.quantity || 0) * parseFloat(this.lastTransactionPrice || 0);
        }
    }
}, {
    tableName: 'holdings',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default Holding;
