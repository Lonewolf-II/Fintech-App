import sequelize from '../config/database.js';
import User from './User.js';
import Customer from './Customer.js';
import Account from './Account.js';
import Transaction from './Transaction.js';
import Portfolio from './Portfolio.js';
import Holding from './Holding.js';
import IPOApplication from './IPOApplication.js';
import IPOListing from './IPOListing.js';
import CustomerCredential from './CustomerCredential.js';
import ModificationRequest from './ModificationRequest.js';
import ActivityLog from './ActivityLog.js';

// User - Customer associations
User.hasMany(Customer, { foreignKey: 'createdBy', as: 'createdCustomers' });
User.hasMany(Customer, { foreignKey: 'verifiedBy', as: 'verifiedCustomers' });
Customer.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Customer.belongsTo(User, { foreignKey: 'verifiedBy', as: 'verifier' });

// Customer - Account associations
Customer.hasMany(Account, { foreignKey: 'customerId', as: 'accounts' });
Account.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

// Account - Transaction associations
Account.hasMany(Transaction, { foreignKey: 'accountId', as: 'transactions' });
Transaction.belongsTo(Account, { foreignKey: 'accountId', as: 'account' });

// Customer - Portfolio associations
Customer.hasMany(Portfolio, { foreignKey: 'customerId', as: 'portfolios' });
Portfolio.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

// Portfolio - Holding associations
Portfolio.hasMany(Holding, { foreignKey: 'portfolioId', as: 'holdings' });
Holding.belongsTo(Portfolio, { foreignKey: 'portfolioId', as: 'portfolio' });

// Customer - IPOApplication associations
Customer.hasMany(IPOApplication, { foreignKey: 'customerId', as: 'ipoApplications' });
IPOApplication.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

// Customer - CustomerCredential associations
Customer.hasMany(CustomerCredential, { foreignKey: 'customerId', as: 'credentials' });
CustomerCredential.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

// ModificationRequest associations
User.hasMany(ModificationRequest, { foreignKey: 'requestedBy', as: 'requestedModifications' });
ModificationRequest.belongsTo(User, { foreignKey: 'requestedBy', as: 'requester' });
User.hasMany(ModificationRequest, { foreignKey: 'reviewedBy', as: 'reviewedModifications' });
ModificationRequest.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });

export {
    sequelize,
    User,
    Customer,
    Account,
    Transaction,
    Portfolio,
    Holding,
    IPOApplication,
    IPOListing,
    CustomerCredential,
    ModificationRequest,
    ActivityLog
};
