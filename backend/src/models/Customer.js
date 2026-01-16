import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Customer = sequelize.define('Customer', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    customerId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        field: 'customer_id'
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'full_name'
    },
    email: {
        type: DataTypes.STRING,
        // unique: true, // Removed per requirement
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    address: {
        type: DataTypes.TEXT
    },
    dateOfBirth: {
        type: DataTypes.DATEONLY,
        field: 'date_of_birth'
    },
    kycStatus: {
        type: DataTypes.ENUM('pending', 'verified', 'rejected'),
        defaultValue: 'pending',
        field: 'kyc_status'
    },
    accountType: {
        type: DataTypes.ENUM('individual', 'corporate'),
        field: 'account_type'
    },
    // Family Details
    fatherName: { type: DataTypes.STRING, field: 'father_name' },
    grandfatherName: { type: DataTypes.STRING, field: 'grandfather_name' },
    motherName: { type: DataTypes.STRING, field: 'mother_name' },
    spouseName: { type: DataTypes.STRING, field: 'spouse_name' },

    // Demat Details
    boid: { type: DataTypes.STRING },
    dematOpenDate: { type: DataTypes.DATEONLY, field: 'demat_open_date' },
    dematExpiryDate: { type: DataTypes.DATEONLY, field: 'demat_expiry_date' },
    createdBy: {
        type: DataTypes.INTEGER,
        field: 'created_by',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    verifiedBy: {
        type: DataTypes.INTEGER,
        field: 'verified_by',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    accountOpeningDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'account_opening_date'
    }
}, {
    tableName: 'customers',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default Customer;
