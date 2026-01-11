import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const IPOApplication = sequelize.define('IPOApplication', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
    companyName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'company_name'
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    pricePerShare: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'price_per_share'
    },
    totalAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        field: 'total_amount'
    },
    status: {
        type: DataTypes.ENUM('pending', 'verified', 'allotted', 'rejected'),
        defaultValue: 'pending'
    },
    appliedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'applied_at'
    },
    verifiedBy: {
        type: DataTypes.INTEGER,
        field: 'verified_by',
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'ipo_applications',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default IPOApplication;
