import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const InvestorCategory = sequelize.define('InvestorCategory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    categoryName: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        field: 'category_name'
    },
    investorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'investor_id',
        references: {
            model: 'investors',
            key: 'id'
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    }
}, {
    tableName: 'investor_categories',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default InvestorCategory;
