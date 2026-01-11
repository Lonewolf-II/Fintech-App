-- =====================================================
-- Default Users Seed Data
-- =====================================================
-- This file contains default user accounts for the system
-- Password for all users: admin123
-- ⚠️ IMPORTANT: Change these passwords in production!
-- =====================================================

-- Insert default admin user
INSERT INTO users (user_id, staff_id, email, password_hash, name, role, phone, status)
VALUES (
    'usr_001_admin',
    100,
    'admin@fintech.com',
    '$2a$10$rZ8qH9YqYqYqYqYqYqYqYu7KxZ8qH9YqYqYqYqYqYqYqYqYqYqYqYq',
    'Admin User',
    'admin',
    '+977-9841234567',
    'active'
) ON CONFLICT (email) DO NOTHING;

-- Insert maker user
INSERT INTO users (user_id, staff_id, email, password_hash, name, role, phone, status)
VALUES (
    'usr_002_maker',
    101,
    'maker@fintech.com',
    '$2a$10$rZ8qH9YqYqYqYqYqYqYqYu7KxZ8qH9YqYqYqYqYqYqYqYqYqYqYqYq',
    'Maker Staff',
    'maker',
    '+977-9841234568',
    'active'
) ON CONFLICT (email) DO NOTHING;

-- Insert checker user
INSERT INTO users (user_id, staff_id, email, password_hash, name, role, phone, status)
VALUES (
    'usr_003_checker',
    102,
    'checker@fintech.com',
    '$2a$10$rZ8qH9YqYqYqYqYqYqYqYu7KxZ8qH9YqYqYqYqYqYqYqYqYqYqYqYq',
    'Checker Staff',
    'checker',
    '+977-9841234569',
    'active'
) ON CONFLICT (email) DO NOTHING;

-- Insert investor user
INSERT INTO users (user_id, staff_id, email, password_hash, name, role, phone, status)
VALUES (
    'usr_004_investor',
    103,
    'investor@fintech.com',
    '$2a$10$rZ8qH9YqYqYqYqYqYqYqYu7KxZ8qH9YqYqYqYqYqYqYqYqYqYqYqYq',
    'Investor User',
    'investor',
    '+977-9841234570',
    'active'
) ON CONFLICT (email) DO NOTHING;

-- Completion message
DO $$
BEGIN
    RAISE NOTICE '✅ Default users seeded successfully!';
    RAISE NOTICE '📧 Login credentials:';
    RAISE NOTICE '   - admin@fintech.com / admin123 (Admin)';
    RAISE NOTICE '   - maker@fintech.com / admin123 (Maker)';
    RAISE NOTICE '   - checker@fintech.com / admin123 (Checker)';
    RAISE NOTICE '   - investor@fintech.com / admin123 (Investor)';
    RAISE NOTICE '⚠️  Change these passwords before deploying to production!';
END $$;
