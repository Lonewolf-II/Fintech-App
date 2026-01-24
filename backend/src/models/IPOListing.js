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
    scripName: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'scrip_name'
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
        allowNull: true,
        field: 'close_date'
    },
    openTime: {
        type: DataTypes.TIME,
        allowNull: true,
        field: 'open_time'
    },
    closeTime: {
        type: DataTypes.TIME,
        allowNull: true,
        field: 'close_time'
    },
    allotmentDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'allotment_date'
    },
    allotmentTime: {
        type: DataTypes.TIME,
        allowNull: true,
        field: 'allotment_time'
    },
    resultPublishDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'result_publish_date'
    },
    resultPublishTime: {
        type: DataTypes.TIME,
        allowNull: true,
        field: 'result_publish_time'
    },
    autoClose: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'auto_close'
    },
    status: {
        type: DataTypes.ENUM('upcoming', 'open', 'closed', 'result_published', 'allotted'),
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
