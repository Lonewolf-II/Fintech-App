-- =====================================================
-- Sample Data for Development/Testing
-- =====================================================
-- This file contains sample data for development and testing
-- DO NOT run this in production!
-- =====================================================

-- Insert sample customers
INSERT INTO customers (customer_id, full_name, email, phone, address, date_of_birth, kyc_status, account_type, created_by)
VALUES 
    ('cust_001', 'Ram Sharma', 'ram.sharma@example.com', '+977-9841111111', 'Kathmandu, Nepal', '1990-05-15', 'verified', 'individual', 1),
    ('cust_002', 'Sita Thapa', 'sita.thapa@example.com', '+977-9841111112', 'Pokhara, Nepal', '1985-08-20', 'verified', 'individual', 1),
    ('cust_003', 'Hari Prasad', 'hari.prasad@example.com', '+977-9841111113', 'Lalitpur, Nepal', '1992-03-10', 'pending', 'individual', 1),
    ('cust_004', 'ABC Company Pvt. Ltd.', 'info@abccompany.com', '+977-9841111114', 'Bhaktapur, Nepal', NULL, 'verified', 'corporate', 1)
ON CONFLICT (email) DO NOTHING;

-- Insert sample accounts
INSERT INTO accounts (account_number, customer_id, account_type, balance, currency, status)
VALUES 
    ('ACC-2024-001', 1, 'savings', 150000.00, 'NPR', 'active'),
    ('ACC-2024-002', 1, 'current', 50000.00, 'NPR', 'active'),
    ('ACC-2024-003', 2, 'savings', 250000.00, 'NPR', 'active'),
    ('ACC-2024-004', 3, 'savings', 75000.00, 'NPR', 'active'),
    ('ACC-2024-005', 4, 'current', 500000.00, 'NPR', 'active')
ON CONFLICT (account_number) DO NOTHING;

-- Insert sample portfolios
INSERT INTO portfolios (portfolio_id, customer_id, total_value, total_investment, profit_loss)
VALUES 
    ('port_001', 1, 125000.00, 100000.00, 25000.00),
    ('port_002', 2, 180000.00, 150000.00, 30000.00),
    ('port_003', 3, 45000.00, 50000.00, -5000.00)
ON CONFLICT (portfolio_id) DO NOTHING;

-- Insert sample holdings
INSERT INTO holdings (holding_id, portfolio_id, stock_symbol, company_name, quantity, purchase_price, current_price, profit_loss_percent, purchase_date)
VALUES 
    ('hold_001', 1, 'NABIL', 'Nabil Bank Limited', 50, 800.00, 1000.00, 25.00, '2024-01-15'),
    ('hold_002', 1, 'NTC', 'Nepal Telecom', 100, 600.00, 650.00, 8.33, '2024-02-20'),
    ('hold_003', 2, 'NICA', 'NIC Asia Bank', 75, 900.00, 950.00, 5.56, '2024-03-10'),
    ('hold_004', 2, 'HIDCL', 'Hydroelectricity Investment', 200, 250.00, 280.00, 12.00, '2024-04-05'),
    ('hold_005', 3, 'UPPER', 'Upper Tamakoshi Hydro', 30, 500.00, 450.00, -10.00, '2024-05-12')
ON CONFLICT (holding_id) DO NOTHING;

-- Insert sample IPO listings
INSERT INTO ipo_listings (company_name, price_per_share, total_shares, open_date, close_date, status, description)
VALUES 
    ('Sunrise Bank Limited', 100.00, 5000000, '2024-06-01', '2024-06-15', 'closed', 'IPO for Sunrise Bank expansion'),
    ('Nepal Infrastructure Bank', 150.00, 3000000, '2024-07-01', '2024-07-15', 'open', 'Infrastructure development bank IPO'),
    ('Green Energy Hydro', 200.00, 2000000, '2024-08-01', '2024-08-15', 'upcoming', 'Renewable energy company IPO')
ON CONFLICT DO NOTHING;

-- Insert sample IPO applications
INSERT INTO ipo_applications (customer_id, company_name, quantity, price_per_share, total_amount, status, verified_by)
VALUES 
    (1, 'Sunrise Bank Limited', 100, 100.00, 10000.00, 'verified', 2),
    (2, 'Sunrise Bank Limited', 150, 100.00, 15000.00, 'allotted', 2),
    (3, 'Nepal Infrastructure Bank', 200, 150.00, 30000.00, 'pending', NULL)
ON CONFLICT DO NOTHING;

-- Insert sample investor categories
INSERT INTO investor_categories (category_id, category_name, description, status, created_by)
VALUES 
    ('cat_001', 'Fixed Deposit', 'Fixed deposit investment category', 'active', 1),
    ('cat_002', 'Mutual Fund', 'Mutual fund investment category', 'active', 1),
    ('cat_003', 'Bonds', 'Government and corporate bonds', 'active', 1)
ON CONFLICT (category_id) DO NOTHING;

-- Insert sample investors
INSERT INTO investors (investor_id, full_name, email, phone, address, pan_number, bank_account, bank_name, status, created_by)
VALUES 
    ('inv_001', 'Krishna Bahadur', 'krishna.b@example.com', '+977-9851111111', 'Kathmandu', '123456789', 'ACC-INV-001', 'Nabil Bank', 'active', 1),
    ('inv_002', 'Maya Devi', 'maya.devi@example.com', '+977-9851111112', 'Pokhara', '987654321', 'ACC-INV-002', 'NIC Asia Bank', 'active', 1),
    ('inv_003', 'Rajesh Kumar', 'rajesh.k@example.com', '+977-9851111113', 'Lalitpur', '456789123', 'ACC-INV-003', 'Himalayan Bank', 'active', 1)
ON CONFLICT (email) DO NOTHING;

-- Insert sample investments
INSERT INTO investments (investment_id, investor_id, category_id, amount, investment_date, maturity_date, interest_rate, status, created_by)
VALUES 
    ('invest_001', 1, 1, 500000.00, '2024-01-01', '2025-01-01', 8.50, 'active', 1),
    ('invest_002', 2, 2, 300000.00, '2024-02-15', '2025-02-15', 7.25, 'active', 1),
    ('invest_003', 3, 3, 750000.00, '2024-03-20', '2026-03-20', 9.00, 'active', 1)
ON CONFLICT (investment_id) DO NOTHING;

-- Insert sample profit distributions
INSERT INTO profit_distributions (distribution_id, investment_id, amount, distribution_date, distribution_type, payment_status, payment_date, created_by)
VALUES 
    ('dist_001', 1, 21250.00, '2024-06-30', 'interest', 'paid', '2024-07-01', 1),
    ('dist_002', 2, 10875.00, '2024-08-15', 'dividend', 'paid', '2024-08-16', 1),
    ('dist_003', 3, 33750.00, '2024-09-20', 'interest', 'pending', NULL, 1)
ON CONFLICT (distribution_id) DO NOTHING;

-- Completion message
DO $$
BEGIN
    RAISE NOTICE '✅ Sample data seeded successfully!';
    RAISE NOTICE '📊 Created:';
    RAISE NOTICE '   - 4 Customers';
    RAISE NOTICE '   - 5 Accounts';
    RAISE NOTICE '   - 3 Portfolios';
    RAISE NOTICE '   - 5 Holdings';
    RAISE NOTICE '   - 3 IPO Listings';
    RAISE NOTICE '   - 3 IPO Applications';
    RAISE NOTICE '   - 3 Investor Categories';
    RAISE NOTICE '   - 3 Investors';
    RAISE NOTICE '   - 3 Investments';
    RAISE NOTICE '   - 3 Profit Distributions';
    RAISE NOTICE '⚠️  This is sample data for development/testing only!';
END $$;
