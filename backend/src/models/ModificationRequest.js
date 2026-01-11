import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ModificationRequest = sequelize.define('ModificationRequest', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    targetModel: {
        type: DataTypes.STRING, // 'Customer', 'Account'
        allowNull: false,
        field: 'target_model'
    },
    targetId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'target_id'
    },
    requestedChanges: {
        type: DataTypes.JSON, // Stores the before/after or just new values
        allowNull: false,
        field: 'requested_changes'
    },
    changeType: {
        type: DataTypes.ENUM('create', 'update', 'delete'),
        defaultValue: 'update',
        field: 'change_type'
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
    },
    requestedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'requested_by',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    reviewedBy: {
        type: DataTypes.INTEGER,
        field: 'reviewed_by',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    reviewNotes: {
        type: DataTypes.TEXT,
        field: 'review_notes'
    }
}, {
    tableName: 'modification_requests',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default ModificationRequest;
