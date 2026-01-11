import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const PaymentVerification = sequelize.define('PaymentVerification', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        paymentSubmissionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'payment_submissions',
                key: 'id'
            },
            field: 'payment_submission_id'
        },
        superadminId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'superadmins',
                key: 'id'
            },
            field: 'superadmin_id'
        },
        decision: {
            type: DataTypes.ENUM('approved', 'rejected', 'info_requested'),
            allowNull: false
        },
        adminNotes: {
            type: DataTypes.TEXT,
            field: 'admin_notes'
        },
        verifiedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'verified_at'
        },
        actionTaken: {
            type: DataTypes.STRING(100),
            field: 'action_taken'
            // e.g., 'renewed_subscription', 'extended_trial'
        }
    }, {
        tableName: 'payment_verifications',
        timestamps: false
    });

    return PaymentVerification;
};
