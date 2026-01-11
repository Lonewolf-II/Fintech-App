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

-- Create indexes for better performance
CREATE INDEX idx_investors_email ON investors(email);
CREATE INDEX idx_investors_investor_id ON investors(investor_id);
CREATE INDEX idx_investor_categories_category_id ON investor_categories(category_id);
CREATE INDEX idx_investments_investor_id ON investments(investor_id);
CREATE INDEX idx_investments_category_id ON investments(category_id);
CREATE INDEX idx_profit_distributions_investment_id ON profit_distributions(investment_id);
CREATE INDEX idx_category_account_assignments_category_id ON category_account_assignments(category_id);
CREATE INDEX idx_category_account_assignments_account_id ON category_account_assignments(account_id);
