import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Subscription = sequelize.define('Subscription', {
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
        planName: {
            type: DataTypes.ENUM('starter', 'professional', 'enterprise', 'custom', 'silver', 'gold', 'platinum', 'test'),
            allowNull: false,
            field: 'plan_name'
        },
        maxUsers: {
            type: DataTypes.INTEGER,
            defaultValue: 10,
            field: 'max_users'
        },
        maxCustomers: {
            type: DataTypes.INTEGER,
            defaultValue: 100,
            field: 'max_customers'
        },
        maxTransactionsPerMonth: {
            type: DataTypes.INTEGER,
            defaultValue: 1000,
            field: 'max_transactions_per_month'
        },
        pricePerMonth: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            field: 'price_per_month'
        },
        billingCycle: {
            type: DataTypes.ENUM('monthly', 'yearly', 'quarterly', 'semiannually'),
            defaultValue: 'monthly',
            field: 'billing_cycle'
        },
        startDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            field: 'start_date'
        },
        endDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            field: 'end_date'
        },
        autoRenew: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'auto_renew'
        }
    }, {
        tableName: 'subscriptions',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    return Subscription;
};
