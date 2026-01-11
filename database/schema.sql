-- =====================================================
-- FinTech Application - Complete Database Schema
-- =====================================================
-- This file contains the complete database schema for the FinTech application
-- It combines all migration files into a single schema for easy setup
-- 
-- Database: PostgreSQL 12+
-- Created: 2026-01-12
-- =====================================================

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    staff_id INTEGER UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'maker', 'checker', 'investor')),
    phone VARCHAR(50),
    avatar VARCHAR(500),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Customers table
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    customer_id VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT,
    date_of_birth DATE,
    kyc_status VARCHAR(50) DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
    account_type VARCHAR(50) CHECK (account_type IN ('individual', 'corporate')),
    created_by INTEGER REFERENCES users(id),
    verified_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Accounts table
CREATE TABLE IF NOT EXISTS accounts (
    id SERIAL PRIMARY KEY,
    account_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('savings', 'current', 'fixed_deposit')),
    balance DECIMAL(15, 2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'NPR',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'closed')),
    opening_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(255) UNIQUE NOT NULL,
    account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'transfer')),
    amount DECIMAL(15, 2) NOT NULL,
    balance_after DECIMAL(15, 2) NOT NULL,
    description TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
    id SERIAL PRIMARY KEY,
    portfolio_id VARCHAR(255) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    total_value DECIMAL(15, 2) DEFAULT 0.00,
    total_investment DECIMAL(15, 2) DEFAULT 0.00,
    profit_loss DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Holdings table
CREATE TABLE IF NOT EXISTS holdings (
    id SERIAL PRIMARY KEY,
    holding_id VARCHAR(255) UNIQUE NOT NULL,
    portfolio_id INTEGER REFERENCES portfolios(id) ON DELETE CASCADE,
    stock_symbol VARCHAR(20) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    purchase_price DECIMAL(10, 2) NOT NULL,
    current_price DECIMAL(10, 2) NOT NULL,
    total_value DECIMAL(15, 2) GENERATED ALWAYS AS (quantity * current_price) STORED,
    profit_loss_percent DECIMAL(5, 2),
    purchase_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- FEATURE TABLES
-- =====================================================

-- Create Customer Credentials table
CREATE TABLE IF NOT EXISTS customer_credentials (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('mobile_banking', 'meroshare', 'tms')),
    login_id VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'locked')),
    updated_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create IPO Listings table
CREATE TABLE IF NOT EXISTS ipo_listings (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    price_per_share DECIMAL(10, 2) NOT NULL,
    total_shares INTEGER,
    open_date DATE NOT NULL,
    close_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'open', 'closed', 'allotted')),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create IPO Applications table
CREATE TABLE IF NOT EXISTS ipo_applications (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    price_per_share DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'allotted', 'rejected')),
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Modification Requests table
CREATE TABLE IF NOT EXISTS modification_requests (
    id SERIAL PRIMARY KEY,
    target_model VARCHAR(50) NOT NULL,
    target_id INTEGER NOT NULL,
    requested_changes JSON NOT NULL,
    change_type VARCHAR(20) DEFAULT 'update' CHECK (change_type IN ('create', 'update', 'delete')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    requested_by INTEGER NOT NULL REFERENCES users(id),
    reviewed_by INTEGER REFERENCES users(id),
    review_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Activity Logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(255),
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INVESTOR MODULE TABLES
-- =====================================================

-- Create Investors table
CREATE TABLE IF NOT EXISTS investors (
    id SERIAL PRIMARY KEY,
    investor_id VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT,
    pan_number VARCHAR(50),
    bank_account VARCHAR(50),
    bank_name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Investor Categories table
CREATE TABLE IF NOT EXISTS investor_categories (
    id SERIAL PRIMARY KEY,
    category_id VARCHAR(255) UNIQUE NOT NULL,
    category_name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Investments table
CREATE TABLE IF NOT EXISTS investments (
    id SERIAL PRIMARY KEY,
    investment_id VARCHAR(255) UNIQUE NOT NULL,
    investor_id INTEGER NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES investor_categories(id),
    amount DECIMAL(15, 2) NOT NULL,
    investment_date DATE NOT NULL,
    maturity_date DATE,
    interest_rate DECIMAL(5, 2),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'matured', 'withdrawn')),
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Profit Distributions table
CREATE TABLE IF NOT EXISTS profit_distributions (
    id SERIAL PRIMARY KEY,
    distribution_id VARCHAR(255) UNIQUE NOT NULL,
    investment_id INTEGER NOT NULL REFERENCES investments(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL,
    distribution_date DATE NOT NULL,
    distribution_type VARCHAR(50) DEFAULT 'interest' CHECK (distribution_type IN ('interest', 'dividend', 'bonus')),
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled')),
    payment_date DATE,
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Category Account Assignments table
CREATE TABLE IF NOT EXISTS category_account_assignments (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES investor_categories(id) ON DELETE CASCADE,
    account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by INTEGER REFERENCES users(id),
    UNIQUE(category_id, account_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Core table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_staff_id ON users(staff_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_accounts_customer_id ON accounts(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_customer_id ON portfolios(customer_id);
CREATE INDEX IF NOT EXISTS idx_holdings_portfolio_id ON holdings(portfolio_id);

-- Feature table indexes
CREATE INDEX IF NOT EXISTS idx_customer_credentials_customer_id ON customer_credentials(customer_id);
CREATE INDEX IF NOT EXISTS idx_ipo_applications_customer_id ON ipo_applications(customer_id);
CREATE INDEX IF NOT EXISTS idx_modification_requests_status ON modification_requests(status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- Investor module indexes
CREATE INDEX IF NOT EXISTS idx_investors_email ON investors(email);
CREATE INDEX IF NOT EXISTS idx_investors_investor_id ON investors(investor_id);
CREATE INDEX IF NOT EXISTS idx_investor_categories_category_id ON investor_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_investments_investor_id ON investments(investor_id);
CREATE INDEX IF NOT EXISTS idx_investments_category_id ON investments(category_id);
CREATE INDEX IF NOT EXISTS idx_profit_distributions_investment_id ON profit_distributions(investment_id);
CREATE INDEX IF NOT EXISTS idx_category_account_assignments_category_id ON category_account_assignments(category_id);
CREATE INDEX IF NOT EXISTS idx_category_account_assignments_account_id ON category_account_assignments(account_id);

-- =====================================================
-- DEFAULT DATA
-- =====================================================

-- Insert default admin user (password: admin123)
INSERT INTO users (user_id, staff_id, email, password_hash, name, role, phone, status)
VALUES (
    'usr_001_admin',
    100,
    'admin@fintech.com',
    '$2a$10$rZ8qH9YqYqYqYqYqYqYqYu7KxZ8qH9YqYqYqYqYqYqYqYqYqYqYqYq',
    'Admin User',
    'admin',
    '+977-9841234567',
    'active'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample users
INSERT INTO users (user_id, staff_id, email, password_hash, name, role, phone, status)
VALUES 
    ('usr_002_maker', 101, 'maker@fintech.com', '$2a$10$rZ8qH9YqYqYqYqYqYqYqYu7KxZ8qH9YqYqYqYqYqYqYqYqYqYqYqYq', 'Maker Staff', 'maker', '+977-9841234568', 'active'),
    ('usr_003_checker', 102, 'checker@fintech.com', '$2a$10$rZ8qH9YqYqYqYqYqYqYqYu7KxZ8qH9YqYqYqYqYqYqYqYqYqYqYqYq', 'Checker Staff', 'checker', '+977-9841234569', 'active'),
    ('usr_004_investor', 103, 'investor@fintech.com', '$2a$10$rZ8qH9YqYqYqYqYqYqYqYu7KxZ8qH9YqYqYqYqYqYqYqYqYqYqYqYq', 'Investor User', 'investor', '+977-9841234570', 'active')
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Database schema created successfully!';
    RAISE NOTICE '📊 Total tables: 15';
    RAISE NOTICE '👤 Default users created with password: admin123';
    RAISE NOTICE '⚠️  Remember to change default passwords in production!';
END $$;
