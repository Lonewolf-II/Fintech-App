import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Superadmin = sequelize.define('Superadmin', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        passwordHash: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'password_hash'
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM('owner', 'admin', 'support'),
            defaultValue: 'admin'
        },
        lastLoginAt: {
            type: DataTypes.DATE,
            field: 'last_login_at'
        }
    }, {
        tableName: 'superadmins',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    return Superadmin;
};
