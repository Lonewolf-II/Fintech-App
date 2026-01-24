-- Migration: Enhance IPO listings with scrip name and result publishing

-- Add scrip_name column (stock symbol)
ALTER TABLE ipo_listings ADD COLUMN IF NOT EXISTS scrip_name VARCHAR(20);

-- Add result publishing fields
ALTER TABLE ipo_listings ADD COLUMN IF NOT EXISTS result_publish_date DATE;
ALTER TABLE ipo_listings ADD COLUMN IF NOT EXISTS result_publish_time TIME;

-- Add auto_close flag for automatic status transitions
ALTER TABLE ipo_listings ADD COLUMN IF NOT EXISTS auto_close BOOLEAN DEFAULT true;

-- For existing IPOs without scrip names, generate from company name
UPDATE ipo_listings 
SET scrip_name = UPPER(SUBSTRING(company_name, 1, 3)) || 'IPO'
WHERE scrip_name IS NULL OR scrip_name = '';

-- Set auto_close to true for existing IPOs
UPDATE ipo_listings SET auto_close = true WHERE auto_close IS NULL;
