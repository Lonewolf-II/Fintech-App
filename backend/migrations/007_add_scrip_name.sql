-- Migration: Add scrip_name to ipo_listings
-- Description: Ensure scrip_name column exists
-- Date: 2026-01-24

ALTER TABLE ipo_listings
ADD COLUMN IF NOT EXISTS scrip_name VARCHAR(20);

-- Add comment
COMMENT ON COLUMN ipo_listings.scrip_name IS 'Stock symbol/ticker for the IPO listing';
