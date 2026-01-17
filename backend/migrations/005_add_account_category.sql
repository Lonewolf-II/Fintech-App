-- Migration: Add account_category field to accounts table
-- Description: Support major/minor account classification based on customer age
-- Date: 2026-01-17

-- Add account_category column
ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS account_category VARCHAR(10) DEFAULT 'major' CHECK (account_category IN ('major', 'minor'));

-- Add index for filtering by category
CREATE INDEX IF NOT EXISTS idx_accounts_category ON accounts(account_category);

-- Add comment
COMMENT ON COLUMN accounts.account_category IS 'Account classification: major (18+) or minor (<18). Minor accounts are frozen when customer turns 18 until KYC is updated.';
