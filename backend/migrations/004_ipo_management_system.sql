-- Migration: 004_ipo_management_system_enhancements
-- Description: Add fields and tables for comprehensive IPO management system
-- Date: 2026-01-16

-- ============================================
-- 1. Update existing tables with new fields
-- ============================================

-- Add new fields to customers table
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS account_opening_date DATE;

-- Add new fields to investors table
ALTER TABLE investors
ADD COLUMN IF NOT EXISTS special_account_number VARCHAR(13) UNIQUE;

-- Add new fields to accounts table
ALTER TABLE accounts
ALTER COLUMN account_number TYPE VARCHAR(13);

ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS short_name VARCHAR(20),
ADD COLUMN IF NOT EXISTS demat_account_number VARCHAR(255),
ADD COLUMN IF NOT EXISTS meroshare_id VARCHAR(255);

-- Add new fields to ipo_listings table
ALTER TABLE ipo_listings
ADD COLUMN IF NOT EXISTS open_time TIME,
ADD COLUMN IF NOT EXISTS close_time TIME,
ADD COLUMN IF NOT EXISTS allotment_date DATE,
ADD COLUMN IF NOT EXISTS allotment_time TIME;

-- Add new fields to ipo_applications table
ALTER TABLE ipo_applications
ADD COLUMN IF NOT EXISTS ipo_listing_id INTEGER REFERENCES ipo_listings(id),
ADD COLUMN IF NOT EXISTS applied_by INTEGER REFERENCES users(id),
ADD COLUMN IF NOT EXISTS verification_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS allotment_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS allotment_quantity INTEGER,
ADD COLUMN IF NOT EXISTS allotment_date TIMESTAMP;

-- Update transactions table with new transaction types
ALTER TABLE transactions
DROP CONSTRAINT IF EXISTS transactions_transaction_type_check;

ALTER TABLE transactions
ADD CONSTRAINT transactions_transaction_type_check 
CHECK (transaction_type IN ('deposit', 'withdrawal', 'transfer', 'ipo_hold', 'ipo_release', 'ipo_allotment', 'share_sale', 'profit_distribution', 'fee_deduction', 'principal_return'));

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS remarks TEXT,
ADD COLUMN IF NOT EXISTS reference_id INTEGER,
ADD COLUMN IF NOT EXISTS reference_type VARCHAR(50);

-- Add new fields to holdings table
ALTER TABLE holdings
ADD COLUMN IF NOT EXISTS investment_id INTEGER REFERENCES investments(id),
ADD COLUMN IF NOT EXISTS last_transaction_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS last_closing_price DECIMAL(10, 2);

-- ============================================
-- 2. Create new tables
-- ============================================

-- Create fees table
CREATE TABLE IF NOT EXISTS fees (
    id SERIAL PRIMARY KEY,
    fee_id VARCHAR(50) UNIQUE NOT NULL,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    account_id INTEGER REFERENCES accounts(id) ON DELETE SET NULL,
    fee_type VARCHAR(50) NOT NULL CHECK (fee_type IN ('annual_fee', 'demat_charge', 'meroshare_charge', 'renewal_fee')),
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE,
    paid_date DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'waived')),
    paid_from_distribution BOOLEAN DEFAULT FALSE,
    distribution_id INTEGER REFERENCES profit_distributions(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create special_accounts table
CREATE TABLE IF NOT EXISTS special_accounts (
    id SERIAL PRIMARY KEY,
    account_number VARCHAR(13) UNIQUE NOT NULL,
    account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('office', 'investor')),
    account_name VARCHAR(255) NOT NULL,
    short_name VARCHAR(20) NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 0.00,
    investor_id INTEGER REFERENCES investors(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create investor_account_assignments table
CREATE TABLE IF NOT EXISTS investor_account_assignments (
    id SERIAL PRIMARY KEY,
    investor_id INTEGER NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
    account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by INTEGER REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(investor_id, account_id)
);

-- ============================================
-- 3. Create indexes for performance
-- ============================================

-- Indexes for fees table
CREATE INDEX IF NOT EXISTS idx_fees_customer_id ON fees(customer_id);
CREATE INDEX IF NOT EXISTS idx_fees_status ON fees(status);
CREATE INDEX IF NOT EXISTS idx_fees_fee_type ON fees(fee_type);
CREATE INDEX IF NOT EXISTS idx_fees_due_date ON fees(due_date);

-- Indexes for special_accounts table
CREATE INDEX IF NOT EXISTS idx_special_accounts_account_type ON special_accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_special_accounts_investor_id ON special_accounts(investor_id);
CREATE INDEX IF NOT EXISTS idx_special_accounts_status ON special_accounts(status);

-- Indexes for investor_account_assignments table
CREATE INDEX IF NOT EXISTS idx_investor_assignments_investor_id ON investor_account_assignments(investor_id);
CREATE INDEX IF NOT EXISTS idx_investor_assignments_account_id ON investor_account_assignments(account_id);
CREATE INDEX IF NOT EXISTS idx_investor_assignments_customer_id ON investor_account_assignments(customer_id);
CREATE INDEX IF NOT EXISTS idx_investor_assignments_status ON investor_account_assignments(status);

-- Indexes for enhanced IPO tables
CREATE INDEX IF NOT EXISTS idx_ipo_applications_listing_id ON ipo_applications(ipo_listing_id);
CREATE INDEX IF NOT EXISTS idx_ipo_applications_allotment_status ON ipo_applications(allotment_status);
CREATE INDEX IF NOT EXISTS idx_ipo_applications_applied_by ON ipo_applications(applied_by);

-- Indexes for transactions
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON transactions(reference_type, reference_id);

-- Indexes for holdings
CREATE INDEX IF NOT EXISTS idx_holdings_investment_id ON holdings(investment_id);

-- ============================================
-- 4. Insert office account (if not exists)
-- ============================================

INSERT INTO special_accounts (
    account_number,
    account_type,
    account_name,
    short_name,
    balance,
    investor_id,
    status,
    created_by
)
SELECT 
    '5001000000001',
    'office',
    'Office Fee Collection Account',
    'OFFICE-FEE',
    0.00,
    NULL,
    'active',
    1
WHERE NOT EXISTS (
    SELECT 1 FROM special_accounts WHERE account_type = 'office'
);

-- ============================================
-- 5. Add comments for documentation
-- ============================================

COMMENT ON TABLE fees IS 'Tracks customer fees including annual, demat, meroshare, and renewal charges';
COMMENT ON TABLE special_accounts IS 'Special accounts for office fee collection and investor profit distribution';
COMMENT ON TABLE investor_account_assignments IS 'Links investors to customer accounts they manage';

COMMENT ON COLUMN accounts.short_name IS 'Short identifier for account (e.g., RAM-001)';
COMMENT ON COLUMN accounts.demat_account_number IS 'Customer demat account number';
COMMENT ON COLUMN accounts.meroshare_id IS 'Customer Meroshare ID';

COMMENT ON COLUMN ipo_applications.allotment_status IS 'Status of IPO allotment: pending, allotted, or not_allotted';
COMMENT ON COLUMN ipo_applications.allotment_quantity IS 'Number of shares allotted (may be less than applied quantity)';

COMMENT ON COLUMN transactions.reference_type IS 'Type of related entity (e.g., IPOApplication, ProfitDistribution)';
COMMENT ON COLUMN transactions.reference_id IS 'ID of related entity';

COMMENT ON COLUMN holdings.last_transaction_price IS 'Last transaction price (LTP)';
COMMENT ON COLUMN holdings.last_closing_price IS 'Last closing price (LCP)';

-- ============================================
-- Migration complete
-- ============================================
