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
import Fee from './Fee.js';
import SpecialAccount from './SpecialAccount.js';
import InvestorAccountAssignment from './InvestorAccountAssignment.js';
import BankConfiguration from './BankConfiguration.js';

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

// Fee associations
Customer.hasMany(Fee, { foreignKey: 'customerId', as: 'fees' });
Fee.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Account.hasMany(Fee, { foreignKey: 'accountId', as: 'fees' });
Fee.belongsTo(Account, { foreignKey: 'accountId', as: 'account' });
ProfitDistribution.hasMany(Fee, { foreignKey: 'distributionId', as: 'fees' });
Fee.belongsTo(ProfitDistribution, { foreignKey: 'distributionId', as: 'distribution' });

// SpecialAccount associations
Investor.hasOne(SpecialAccount, { foreignKey: 'investorId', as: 'specialAccount' });
SpecialAccount.belongsTo(Investor, { foreignKey: 'investorId', as: 'investor' });
User.hasMany(SpecialAccount, { foreignKey: 'createdBy', as: 'createdSpecialAccounts' });
SpecialAccount.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// InvestorAccountAssignment associations
Investor.hasMany(InvestorAccountAssignment, { foreignKey: 'investorId', as: 'accountAssignments' });
InvestorAccountAssignment.belongsTo(Investor, { foreignKey: 'investorId', as: 'investor' });
Account.hasMany(InvestorAccountAssignment, { foreignKey: 'accountId', as: 'investorAssignments' });
InvestorAccountAssignment.belongsTo(Account, { foreignKey: 'accountId', as: 'account' });
Customer.hasMany(InvestorAccountAssignment, { foreignKey: 'customerId', as: 'investorAssignments' });
InvestorAccountAssignment.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
User.hasMany(InvestorAccountAssignment, { foreignKey: 'assignedBy', as: 'assignedInvestorAccounts' });
InvestorAccountAssignment.belongsTo(User, { foreignKey: 'assignedBy', as: 'assigner' });

// IPOListing - IPOApplication associations
IPOListing.hasMany(IPOApplication, { foreignKey: 'ipoListingId', as: 'applications' });
IPOApplication.belongsTo(IPOListing, { foreignKey: 'ipoListingId', as: 'listing' });

// User - IPOApplication associations
User.hasMany(IPOApplication, { foreignKey: 'appliedBy', as: 'appliedApplications' });
IPOApplication.belongsTo(User, { foreignKey: 'appliedBy', as: 'applier' });
User.hasMany(IPOApplication, { foreignKey: 'verifiedBy', as: 'verifiedApplications' });
IPOApplication.belongsTo(User, { foreignKey: 'verifiedBy', as: 'verifier' });

// Investment - Holding associations
Investment.hasMany(Holding, { foreignKey: 'investmentId', as: 'holdings' });
Holding.belongsTo(Investment, { foreignKey: 'investmentId', as: 'investment' });

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
    ProfitDistribution,
    Fee,
    SpecialAccount,
    InvestorAccountAssignment,
    BankConfiguration
};
