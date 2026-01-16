-- Rollback Migration: 004_ipo_management_system
-- Description: Rollback IPO management system enhancements
-- Date: 2026-01-16

-- ============================================
-- 1. Drop new tables (in reverse order of creation)
-- ============================================

DROP TABLE IF EXISTS investor_account_assignments CASCADE;
DROP TABLE IF EXISTS special_accounts CASCADE;
DROP TABLE IF EXISTS fees CASCADE;

-- ============================================
-- 2. Remove new columns from existing tables
-- ============================================

-- Remove columns from holdings table
ALTER TABLE holdings
DROP COLUMN IF EXISTS last_closing_price,
DROP COLUMN IF EXISTS last_transaction_price,
DROP COLUMN IF EXISTS investment_id;

-- Remove columns from transactions table
ALTER TABLE transactions
DROP COLUMN IF EXISTS reference_type,
DROP COLUMN IF EXISTS reference_id,
DROP COLUMN IF EXISTS remarks;

-- Restore original transaction type constraint
ALTER TABLE transactions
DROP CONSTRAINT IF EXISTS transactions_transaction_type_check;

ALTER TABLE transactions
ADD CONSTRAINT transactions_transaction_type_check 
CHECK (transaction_type IN ('deposit', 'withdrawal', 'transfer'));

-- Remove columns from ipo_applications table
ALTER TABLE ipo_applications
DROP COLUMN IF EXISTS allotment_date,
DROP COLUMN IF EXISTS allotment_quantity,
DROP COLUMN IF EXISTS allotment_status,
DROP COLUMN IF EXISTS rejection_reason,
DROP COLUMN IF EXISTS verification_date,
DROP COLUMN IF EXISTS applied_by,
DROP COLUMN IF EXISTS ipo_listing_id;

-- Remove columns from ipo_listings table
ALTER TABLE ipo_listings
DROP COLUMN IF EXISTS allotment_time,
DROP COLUMN IF EXISTS allotment_date,
DROP COLUMN IF EXISTS close_time,
DROP COLUMN IF EXISTS open_time;

-- Remove columns from accounts table
ALTER TABLE accounts
DROP COLUMN IF EXISTS meroshare_id,
DROP COLUMN IF EXISTS demat_account_number,
DROP COLUMN IF EXISTS short_name;

-- Restore original account_number type (if needed)
-- ALTER TABLE accounts
-- ALTER COLUMN account_number TYPE VARCHAR(255);

-- Remove columns from investors table
ALTER TABLE investors
DROP COLUMN IF EXISTS special_account_number;

-- Remove columns from customers table
ALTER TABLE customers
DROP COLUMN IF EXISTS account_opening_date;

-- ============================================
-- Rollback complete
-- ============================================
