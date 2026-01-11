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

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_staff_id ON users(staff_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_accounts_customer_id ON accounts(customer_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_portfolios_customer_id ON portfolios(customer_id);
CREATE INDEX idx_holdings_portfolio_id ON holdings(portfolio_id);

-- Insert default admin user (password: admin123)
INSERT INTO users (user_id, staff_id, email, password_hash, name, role, phone, status)
VALUES (
    'usr_001_admin',
    100,
    'admin@fintech.com',
    '$2a$10$rZ8qH9YqYqYqYqYqYqYqYu7KxZ8qH9YqYqYqYqYqYqYqYqYqYqYqYq', -- bcrypt hash of 'admin123'
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
