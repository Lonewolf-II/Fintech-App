-- Migration: Add held_balance to accounts table
-- This replaces blocked_amount with a clearer naming convention

-- Add held_balance column
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS held_balance DECIMAL(15,2) DEFAULT 0.00;

-- Migrate existing blocked_amount values to held_balance
UPDATE accounts SET held_balance = COALESCE(blocked_amount, 0) WHERE blocked_amount > 0;

-- Note: We keep blocked_amount for now to avoid breaking existing code
-- It will be removed in a future migration after full transition
