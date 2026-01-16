import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const PaymentSubmission = sequelize.define('PaymentSubmission', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        tenantId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tenants',
                key: 'id'
            },
            field: 'tenant_id'
        },
        subscriptionId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'subscriptions',
                key: 'id'
            },
            field: 'subscription_id'
        },
        invoiceNumber: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            field: 'invoice_number'
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        paymentMethod: {
            type: DataTypes.ENUM('qr_code', 'bank_transfer'),
            field: 'payment_method'
        },
        utrNumber: {
            type: DataTypes.STRING(100),
            field: 'utr_number'
        },
        paymentSlipUrl: {
            type: DataTypes.TEXT,
            field: 'payment_slip_url'
        },
        submittedBy: {
            type: DataTypes.INTEGER,
            field: 'submitted_by'
            // Reference to tenant's user ID
        },
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected'),
            defaultValue: 'pending'
        },
        notes: {
            type: DataTypes.TEXT
        },
        dueDate: {
            type: DataTypes.DATE,
            field: 'due_date'
        },
        submittedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'submitted_at'
        }
    }, {
        tableName: 'payment_submissions',
        timestamps: false
    });

    return PaymentSubmission;
};
