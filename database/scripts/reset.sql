-- =====================================================
-- Database Reset Script
-- =====================================================
-- ⚠️  WARNING: This script will DELETE ALL DATA!
-- Use this script to reset the database to a clean state
-- =====================================================

-- Drop all tables in reverse order of dependencies
DROP TABLE IF EXISTS category_account_assignments CASCADE;
DROP TABLE IF EXISTS profit_distributions CASCADE;
DROP TABLE IF EXISTS investments CASCADE;
DROP TABLE IF EXISTS investor_categories CASCADE;
DROP TABLE IF EXISTS investors CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS modification_requests CASCADE;
DROP TABLE IF EXISTS ipo_applications CASCADE;
DROP TABLE IF EXISTS ipo_listings CASCADE;
DROP TABLE IF EXISTS customer_credentials CASCADE;
DROP TABLE IF EXISTS holdings CASCADE;
DROP TABLE IF EXISTS portfolios CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop indexes (if they exist independently)
DROP INDEX IF EXISTS idx_category_account_assignments_account_id;
DROP INDEX IF EXISTS idx_category_account_assignments_category_id;
DROP INDEX IF EXISTS idx_profit_distributions_investment_id;
DROP INDEX IF EXISTS idx_investments_category_id;
DROP INDEX IF EXISTS idx_investments_investor_id;
DROP INDEX IF EXISTS idx_investor_categories_category_id;
DROP INDEX IF EXISTS idx_investors_investor_id;
DROP INDEX IF EXISTS idx_investors_email;
DROP INDEX IF EXISTS idx_activity_logs_created_at;
DROP INDEX IF EXISTS idx_activity_logs_user_id;
DROP INDEX IF EXISTS idx_modification_requests_status;
DROP INDEX IF EXISTS idx_ipo_applications_customer_id;
DROP INDEX IF EXISTS idx_customer_credentials_customer_id;
DROP INDEX IF EXISTS idx_holdings_portfolio_id;
DROP INDEX IF EXISTS idx_portfolios_customer_id;
DROP INDEX IF EXISTS idx_transactions_account_id;
DROP INDEX IF EXISTS idx_accounts_customer_id;
DROP INDEX IF EXISTS idx_customers_email;
DROP INDEX IF EXISTS idx_users_staff_id;
DROP INDEX IF EXISTS idx_users_email;

-- Completion message
DO $$
BEGIN
    RAISE NOTICE '✅ Database reset complete!';
    RAISE NOTICE '📊 All tables and indexes have been dropped';
    RAISE NOTICE '🔄 Run the schema.sql file to recreate the database structure';
    RAISE NOTICE '';
    RAISE NOTICE 'To recreate the database, run:';
    RAISE NOTICE '  psql -U fintech_user -d fintech_db -f database/schema.sql';
END $$;
