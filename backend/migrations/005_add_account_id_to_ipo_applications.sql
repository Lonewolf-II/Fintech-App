-- Add account_id to ipo_applications
ALTER TABLE ipo_applications
ADD COLUMN account_id INTEGER REFERENCES accounts(id);

-- Optional: You might want to backfill this for existing records if possible, 
-- or they will default to null and fallback logic will be needed.
