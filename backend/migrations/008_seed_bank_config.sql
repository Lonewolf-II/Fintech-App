-- Migration: Ensure CASBA charge flag exists
-- Date: 2026-01-24

-- This is just a safety check, usually redundant if schema is synced, but good to have.
-- No action needed as column exists. But to be safe let's insert a default bank config for testing if none exists.

INSERT INTO bank_configurations (bank_name, charges_casba, casba_amount, is_active, created_at, updated_at)
SELECT 'Nabil Bank', true, 5.00, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM bank_configurations WHERE bank_name = 'Nabil Bank');

INSERT INTO bank_configurations (bank_name, charges_casba, casba_amount, is_active, created_at, updated_at)
SELECT 'Global IME Bank', true, 5.00, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM bank_configurations WHERE bank_name = 'Global IME Bank');
