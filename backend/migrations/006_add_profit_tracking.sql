-- Migration: Add profit tracking to holdings and transactions
-- Description: Support profit calculation and tracking for share sales
-- Date: 2026-01-24

-- Add profit tracking columns to holdings
ALTER TABLE holdings
ADD COLUMN IF NOT EXISTS total_profit DECIMAL(15, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_sold_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_sale_price DECIMAL(10, 2) DEFAULT 0.00;

-- Add sale tracking columns to transactions
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS profit_amount DECIMAL(15, 2),
ADD COLUMN IF NOT EXISTS sale_quantity INTEGER,
ADD COLUMN IF NOT EXISTS sale_price DECIMAL(10, 2);

-- Add comment
COMMENT ON COLUMN holdings.total_profit IS 'Total realized profit/loss from sales of this holding';
COMMENT ON COLUMN transactions.profit_amount IS 'Realized profit/loss for this specific sale transaction';
