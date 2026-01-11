-- Create Customer Credentials table
CREATE TABLE IF NOT EXISTS customer_credentials (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('mobile_banking', 'meroshare', 'tms')),
    login_id VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'locked')),
    updated_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create IPO Listings table
CREATE TABLE IF NOT EXISTS ipo_listings (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    price_per_share DECIMAL(10, 2) NOT NULL,
    total_shares INTEGER,
    open_date DATE NOT NULL,
    close_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'open', 'closed', 'allotted')),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create IPO Applications table
CREATE TABLE IF NOT EXISTS ipo_applications (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    price_per_share DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'allotted', 'rejected')),
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Modification Requests table
CREATE TABLE IF NOT EXISTS modification_requests (
    id SERIAL PRIMARY KEY,
    target_model VARCHAR(50) NOT NULL,
    target_id INTEGER NOT NULL,
    requested_changes JSON NOT NULL,
    change_type VARCHAR(20) DEFAULT 'update' CHECK (change_type IN ('create', 'update', 'delete')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    requested_by INTEGER NOT NULL REFERENCES users(id),
    reviewed_by INTEGER REFERENCES users(id),
    review_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_customer_credentials_customer_id ON customer_credentials(customer_id);
CREATE INDEX idx_ipo_applications_customer_id ON ipo_applications(customer_id);
CREATE INDEX idx_modification_requests_status ON modification_requests(status);
