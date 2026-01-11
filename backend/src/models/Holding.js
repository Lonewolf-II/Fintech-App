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
    purchaseDate: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
        field: 'purchase_date'
    }
}, {
    tableName: 'holdings',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default Holding;
