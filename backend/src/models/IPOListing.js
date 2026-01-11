import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const IPOListing = sequelize.define('IPOListing', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    companyName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'company_name'
    },
    pricePerShare: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'price_per_share'
    },
    totalShares: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'total_shares'
    },
    openDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'open_date'
    },
    closeDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'close_date'
    },
    status: {
        type: DataTypes.ENUM('upcoming', 'open', 'closed', 'allotted'),
        defaultValue: 'upcoming',
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'ipo_listings',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default IPOListing;
