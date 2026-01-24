import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Account = sequelize.define('Account', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    accountNumber: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false,
        field: 'account_number'
    },
    accountName: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'account_name'
    },
    shortName: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'short_name'
    },
    bankName: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'bank_name'
    },
    branch: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'branch'
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
    accountType: {
        type: DataTypes.ENUM('savings', 'current', 'fixed_deposit'),
        allowNull: false,
        field: 'account_type'
    },
    accountCategory: {
        type: DataTypes.ENUM('major', 'minor'),
        allowNull: true,
        defaultValue: 'major',
        field: 'account_category'
    },
    balance: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00
    },
    currency: {
        type: DataTypes.STRING,
        defaultValue: 'NPR'
    },
    status: {
        type: DataTypes.ENUM('active', 'frozen', 'closed'),
        defaultValue: 'active'
    },
    blockedAmount: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
        field: 'blocked_amount'
    },
    heldBalance: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
        field: 'held_balance'
    },
    isPrimary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_primary'
    },
    openingDate: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
        field: 'opening_date'
    },
    dematAccountNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'demat_account_number'
    },
    meroshareId: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'meroshare_id'
    },
    availableBalance: {
        type: DataTypes.VIRTUAL,
        get() {
            const balance = parseFloat(this.balance || 0);
            const held = parseFloat(this.heldBalance || 0);
            return balance - held;
        }
    }
}, {
    tableName: 'accounts',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default Account;
