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
import Investor from './Investor.js';
import InvestorCategory from './InvestorCategory.js';
import CategoryAccountAssignment from './CategoryAccountAssignment.js';
import Investment from './Investment.js';
import ProfitDistribution from './ProfitDistribution.js';

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

// Investor associations
User.hasMany(Investor, { foreignKey: 'createdBy', as: 'createdInvestors' });
Investor.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// InvestorCategory associations
Investor.hasMany(InvestorCategory, { foreignKey: 'investorId', as: 'categories' });
InvestorCategory.belongsTo(Investor, { foreignKey: 'investorId', as: 'investor' });

// CategoryAccountAssignment associations
InvestorCategory.hasMany(CategoryAccountAssignment, { foreignKey: 'categoryId', as: 'assignments' });
CategoryAccountAssignment.belongsTo(InvestorCategory, { foreignKey: 'categoryId', as: 'category' });
Customer.hasMany(CategoryAccountAssignment, { foreignKey: 'customerId', as: 'categoryAssignments' });
CategoryAccountAssignment.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Account.hasMany(CategoryAccountAssignment, { foreignKey: 'accountId', as: 'categoryAssignments' });
CategoryAccountAssignment.belongsTo(Account, { foreignKey: 'accountId', as: 'account' });
User.hasMany(CategoryAccountAssignment, { foreignKey: 'assignedBy', as: 'assignedCategories' });
CategoryAccountAssignment.belongsTo(User, { foreignKey: 'assignedBy', as: 'assigner' });

// Investment associations
Investor.hasMany(Investment, { foreignKey: 'investorId', as: 'investments' });
Investment.belongsTo(Investor, { foreignKey: 'investorId', as: 'investor' });
Customer.hasMany(Investment, { foreignKey: 'customerId', as: 'investments' });
Investment.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Account.hasMany(Investment, { foreignKey: 'accountId', as: 'investments' });
Investment.belongsTo(Account, { foreignKey: 'accountId', as: 'account' });
IPOApplication.hasMany(Investment, { foreignKey: 'ipoApplicationId', as: 'investments' });
Investment.belongsTo(IPOApplication, { foreignKey: 'ipoApplicationId', as: 'ipoApplication' });

// ProfitDistribution associations
Investment.hasMany(ProfitDistribution, { foreignKey: 'investmentId', as: 'distributions' });
ProfitDistribution.belongsTo(Investment, { foreignKey: 'investmentId', as: 'investment' });
User.hasMany(ProfitDistribution, { foreignKey: 'createdBy', as: 'createdDistributions' });
ProfitDistribution.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

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
    ActivityLog,
    Investor,
    InvestorCategory,
    CategoryAccountAssignment,
    Investment,
    ProfitDistribution
};
