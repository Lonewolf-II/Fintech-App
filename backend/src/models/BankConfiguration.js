import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const BankConfiguration = sequelize.define('BankConfiguration', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    bankName: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false,
        field: 'bank_name'
    },
    chargesCasba: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'charges_casba'
    },
    casbaAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 5.00,
        field: 'casba_amount'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    }
}, {
    tableName: 'bank_configurations',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default BankConfiguration;
