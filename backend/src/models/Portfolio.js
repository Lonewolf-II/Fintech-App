import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Portfolio = sequelize.define('Portfolio', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    portfolioId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        field: 'portfolio_id'
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
    totalValue: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
        field: 'total_value'
    },
    totalInvestment: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
        field: 'total_investment'
    },
    profitLoss: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
        field: 'profit_loss'
    }
}, {
    tableName: 'portfolios',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default Portfolio;
