import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ActivityLog = sequelize.define('ActivityLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false
    },
    entityType: {
        type: DataTypes.STRING,
        allowNull: true
    },
    entityId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    details: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'activity_logs',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

export default ActivityLog;
