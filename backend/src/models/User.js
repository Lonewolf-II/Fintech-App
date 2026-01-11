import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcryptjs';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        field: 'user_id'
    },
    staffId: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false,
        field: 'staff_id'
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'password_hash'
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('admin', 'maker', 'checker', 'investor'),
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING
    },
    avatar: {
        type: DataTypes.STRING
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    }
}, {
    tableName: 'users',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Instance method to check password
User.prototype.checkPassword = async function (password) {
    return await bcrypt.compare(password, this.passwordHash);
};

// Static method to hash password
User.hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};

export default User;
