-- Central Management Database Schema
-- Run this on your PostgreSQL server to create the central management database

-- Create database (run as superuser)
-- CREATE DATABASE fintech_central;

-- Connect to fintech_central database before running below

-- Table: tenants (client companies)
CREATE TABLE tenants (
    id SERIAL PRIMARY KEY,
    tenant_key VARCHAR(100) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    database_host VARCHAR(255) NOT NULL,
    database_port INTEGER DEFAULT 5432,
    database_name VARCHAR(100) NOT NULL,
    database_user VARCHAR(100) NOT NULL,
    database_password TEXT NOT NULL, -- encrypted
    status VARCHAR(50) DEFAULT 'trial' CHECK (status IN ('active', 'suspended', 'trial', 'expired')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    suspended_at TIMESTAMP,
    notes TEXT
);

-- Table: subscriptions
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    plan_name VARCHAR(100) NOT NULL CHECK (plan_name IN ('starter', 'professional', 'enterprise', 'custom')),
    max_users INTEGER DEFAULT 10,
    max_customers INTEGER DEFAULT 100,
    max_transactions_per_month INTEGER DEFAULT 1000,
    price_per_month DECIMAL(10, 2) NOT NULL,
    billing_cycle VARCHAR(20) DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    auto_renew BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: licenses
CREATE TABLE licenses (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    license_key VARCHAR(255) UNIQUE NOT NULL,
    feature_flags JSONB DEFAULT '{}', -- {ipo: true, portfolio: false, bulkUpload: true}
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    revoked_at TIMESTAMP
);

-- Table: ip_whitelists
CREATE TABLE ip_whitelists (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    ip_address VARCHAR(50) NOT NULL, -- supports CIDR notation
    description VARCHAR(255),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: superadmins
CREATE TABLE superadmins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('owner', 'admin', 'support')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

-- Table: payment_submissions
CREATE TABLE payment_submissions (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    subscription_id INTEGER REFERENCES subscriptions(id) ON DELETE SET NULL,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) CHECK (payment_method IN ('qr_code', 'bank_transfer')),
    utr_number VARCHAR(100), -- for UPI payments
    payment_slip_url TEXT, -- file path for uploaded slip
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_by INTEGER, -- tenant user ID who submitted
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    notes TEXT
);

-- Table: payment_verifications
CREATE TABLE payment_verifications (
    id SERIAL PRIMARY KEY,
    payment_submission_id INTEGER REFERENCES payment_submissions(id) ON DELETE CASCADE,
    superadmin_id INTEGER REFERENCES superadmins(id) ON DELETE SET NULL,
    decision VARCHAR(50) CHECK (decision IN ('approved', 'rejected', 'info_requested')),
    admin_notes TEXT,
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    action_taken VARCHAR(100) -- e.g., 'renewed_subscription', 'extended_trial'
);

-- Table: audit_logs
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    superadmin_id INTEGER REFERENCES superadmins(id) ON DELETE SET NULL,
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- e.g., 'created_tenant', 'suspended_tenant'
    details JSONB, -- additional context
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_subscriptions_tenant ON subscriptions(tenant_id);
CREATE INDEX idx_licenses_tenant ON licenses(tenant_id);
CREATE INDEX idx_payments_status ON payment_submissions(status);
CREATE INDEX idx_payments_tenant ON payment_submissions(tenant_id);
CREATE INDEX idx_audit_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_superadmin ON audit_logs(superadmin_id);

-- Insert default superadmin (password: 'admin123' - CHANGE THIS!)
-- Password hash for 'admin123' using bcrypt
INSERT INTO superadmins (email, password_hash, name, role) VALUES
('admin@yourcompany.com', '$2a$10$N9qo8uLOickgx2ZMRZoZ5e/WjKHHMpvVXSfD/CFPLLBoNW6JYNmP2', 'Super Admin', 'owner');

COMMENT ON TABLE tenants IS 'Stores client company information and database credentials';
COMMENT ON TABLE subscriptions IS 'Manages subscription plans and limits for each tenant';
COMMENT ON TABLE licenses IS 'Stores license keys and feature flags per tenant';
COMMENT ON TABLE payment_submissions IS 'Tracks payment proofs submitted by clients';
COMMENT ON TABLE payment_verifications IS 'Records superadmin decisions on payment submissions';
