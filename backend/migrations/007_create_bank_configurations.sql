-- Migration: Create bank_configurations table for CASBA charge management

CREATE TABLE IF NOT EXISTS bank_configurations (
    id SERIAL PRIMARY KEY,
    bank_name VARCHAR(100) UNIQUE NOT NULL,
    charges_casba BOOLEAN DEFAULT false,
    casba_amount DECIMAL(10,2) DEFAULT 5.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert common Nepali banks with CASBA configuration
INSERT INTO bank_configurations (bank_name, charges_casba, is_active) VALUES
('Nabil Bank', true, true),
('Nepal Investment Bank', true, true),
('Standard Chartered Bank', false, true),
('Himalayan Bank', true, true),
('Nepal SBI Bank', false, true),
('Nepal Bangladesh Bank', true, true),
('Everest Bank', true, true),
('Kumari Bank', false, true),
('NIC Asia Bank', true, true),
('Machhapuchchhre Bank', true, true),
('Laxmi Bank', true, true),
('Siddhartha Bank', true, true),
('Global IME Bank', true, true),
('Citizens Bank International', true, true),
('Prime Commercial Bank', true, true),
('Sunrise Bank', true, true),
('Century Commercial Bank', false, true),
('Sanima Bank', true, true),
('Mega Bank', true, true),
('NMB Bank', true, true)
ON CONFLICT (bank_name) DO NOTHING;
