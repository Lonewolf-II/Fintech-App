# Database Models Documentation

This document provides detailed information about all database models/tables in the FinTech application.

## Table of Contents

1. [Core Tables](#core-tables)
   - [Users](#users)
   - [Customers](#customers)
   - [Accounts](#accounts)
   - [Transactions](#transactions)
   - [Portfolios](#portfolios)
   - [Holdings](#holdings)

2. [Feature Tables](#feature-tables)
   - [Customer Credentials](#customer-credentials)
   - [IPO Listings](#ipo-listings)
   - [IPO Applications](#ipo-applications)
   - [Modification Requests](#modification-requests)
   - [Activity Logs](#activity-logs)

3. [Investor Module Tables](#investor-module-tables)
   - [Investors](#investors)
   - [Investor Categories](#investor-categories)
   - [Investments](#investments)
   - [Profit Distributions](#profit-distributions)
   - [Category Account Assignments](#category-account-assignments)

---

## Core Tables

### Users

System users with different roles (admin, maker, checker, investor).

**Table Name:** `users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing ID |
| user_id | VARCHAR(255) | UNIQUE, NOT NULL | Unique user identifier |
| staff_id | INTEGER | UNIQUE, NOT NULL | Staff identification number |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| name | VARCHAR(255) | NOT NULL | Full name |
| role | VARCHAR(50) | NOT NULL, CHECK | Role: admin, maker, checker, investor |
| phone | VARCHAR(50) | | Contact phone number |
| avatar | VARCHAR(500) | | Avatar image URL |
| status | VARCHAR(20) | DEFAULT 'active', CHECK | Status: active, inactive |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- `idx_users_email` on `email`
- `idx_users_staff_id` on `staff_id`

**Sequelize Model:** `backend/src/models/User.js`

---

### Customers

Customer information for both individual and corporate accounts.

**Table Name:** `customers`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing ID |
| customer_id | VARCHAR(255) | UNIQUE, NOT NULL | Unique customer identifier |
| full_name | VARCHAR(255) | NOT NULL | Customer full name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Customer email |
| phone | VARCHAR(50) | NOT NULL | Contact phone |
| address | TEXT | | Physical address |
| date_of_birth | DATE | | Date of birth |
| kyc_status | VARCHAR(50) | DEFAULT 'pending', CHECK | KYC status: pending, verified, rejected |
| account_type | VARCHAR(50) | CHECK | Type: individual, corporate |
| created_by | INTEGER | FOREIGN KEY → users(id) | User who created the customer |
| verified_by | INTEGER | FOREIGN KEY → users(id) | User who verified KYC |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- `idx_customers_email` on `email`

**Sequelize Model:** `backend/src/models/Customer.js`

---

### Accounts

Bank accounts associated with customers.

**Table Name:** `accounts`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing ID |
| account_number | VARCHAR(50) | UNIQUE, NOT NULL | Unique account number |
| customer_id | INTEGER | FOREIGN KEY → customers(id), CASCADE | Associated customer |
| account_type | VARCHAR(50) | NOT NULL, CHECK | Type: savings, current, fixed_deposit |
| balance | DECIMAL(15, 2) | DEFAULT 0.00 | Current balance |
| currency | VARCHAR(10) | DEFAULT 'NPR' | Currency code |
| status | VARCHAR(20) | DEFAULT 'active', CHECK | Status: active, frozen, closed |
| opening_date | DATE | DEFAULT CURRENT_DATE | Account opening date |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- `idx_accounts_customer_id` on `customer_id`

**Sequelize Model:** `backend/src/models/Account.js`

---

### Transactions

Financial transactions for accounts.

**Table Name:** `transactions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing ID |
| transaction_id | VARCHAR(255) | UNIQUE, NOT NULL | Unique transaction identifier |
| account_id | INTEGER | FOREIGN KEY → accounts(id), CASCADE | Associated account |
| transaction_type | VARCHAR(50) | NOT NULL, CHECK | Type: deposit, withdrawal, transfer |
| amount | DECIMAL(15, 2) | NOT NULL | Transaction amount |
| balance_after | DECIMAL(15, 2) | NOT NULL | Balance after transaction |
| description | TEXT | | Transaction description |
| created_by | INTEGER | FOREIGN KEY → users(id) | User who created the transaction |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Transaction timestamp |

**Indexes:**
- `idx_transactions_account_id` on `account_id`

**Sequelize Model:** `backend/src/models/Transaction.js`

---

### Portfolios

Investment portfolios for customers.

**Table Name:** `portfolios`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing ID |
| portfolio_id | VARCHAR(255) | UNIQUE, NOT NULL | Unique portfolio identifier |
| customer_id | INTEGER | FOREIGN KEY → customers(id), CASCADE | Associated customer |
| total_value | DECIMAL(15, 2) | DEFAULT 0.00 | Current total value |
| total_investment | DECIMAL(15, 2) | DEFAULT 0.00 | Total invested amount |
| profit_loss | DECIMAL(15, 2) | DEFAULT 0.00 | Profit or loss amount |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- `idx_portfolios_customer_id` on `customer_id`

**Sequelize Model:** `backend/src/models/Portfolio.js`

---

### Holdings

Stock holdings within portfolios.

**Table Name:** `holdings`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing ID |
| holding_id | VARCHAR(255) | UNIQUE, NOT NULL | Unique holding identifier |
| portfolio_id | INTEGER | FOREIGN KEY → portfolios(id), CASCADE | Associated portfolio |
| stock_symbol | VARCHAR(20) | NOT NULL | Stock ticker symbol |
| company_name | VARCHAR(255) | NOT NULL | Company name |
| quantity | INTEGER | NOT NULL | Number of shares |
| purchase_price | DECIMAL(10, 2) | NOT NULL | Price per share at purchase |
| current_price | DECIMAL(10, 2) | NOT NULL | Current price per share |
| total_value | DECIMAL(15, 2) | GENERATED COLUMN | Calculated: quantity × current_price |
| profit_loss_percent | DECIMAL(5, 2) | | Profit/loss percentage |
| purchase_date | DATE | DEFAULT CURRENT_DATE | Purchase date |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- `idx_holdings_portfolio_id` on `portfolio_id`

**Sequelize Model:** `backend/src/models/Holding.js`

---

## Feature Tables

### Customer Credentials

Platform credentials for customers (Mobile Banking, Meroshare, TMS).

**Table Name:** `customer_credentials`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing ID |
| customer_id | INTEGER | FOREIGN KEY → customers(id), CASCADE | Associated customer |
| platform | VARCHAR(50) | NOT NULL, CHECK | Platform: mobile_banking, meroshare, tms |
| login_id | VARCHAR(255) | NOT NULL | Platform login ID |
| password | VARCHAR(255) | NOT NULL | Platform password (encrypted) |
| status | VARCHAR(20) | DEFAULT 'active', CHECK | Status: active, inactive, locked |
| updated_by | INTEGER | FOREIGN KEY → users(id) | User who last updated |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- `idx_customer_credentials_customer_id` on `customer_id`

**Sequelize Model:** `backend/src/models/CustomerCredential.js`

---

### IPO Listings

Available IPO listings.

**Table Name:** `ipo_listings`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing ID |
| company_name | VARCHAR(255) | NOT NULL | Company name |
| price_per_share | DECIMAL(10, 2) | NOT NULL | Price per share |
| total_shares | INTEGER | | Total shares available |
| open_date | DATE | NOT NULL | IPO opening date |
| close_date | DATE | NOT NULL | IPO closing date |
| status | VARCHAR(50) | DEFAULT 'upcoming', CHECK | Status: upcoming, open, closed, allotted |
| description | TEXT | | IPO description |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Sequelize Model:** `backend/src/models/IPOListing.js`

---

### IPO Applications

Customer IPO applications.

**Table Name:** `ipo_applications`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing ID |
| customer_id | INTEGER | FOREIGN KEY → customers(id), CASCADE | Associated customer |
| company_name | VARCHAR(255) | NOT NULL | IPO company name |
| quantity | INTEGER | NOT NULL | Number of shares applied |
| price_per_share | DECIMAL(10, 2) | NOT NULL | Price per share |
| total_amount | DECIMAL(15, 2) | NOT NULL | Total application amount |
| status | VARCHAR(50) | DEFAULT 'pending', CHECK | Status: pending, verified, allotted, rejected |
| applied_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Application timestamp |
| verified_by | INTEGER | FOREIGN KEY → users(id) | User who verified |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- `idx_ipo_applications_customer_id` on `customer_id`

**Sequelize Model:** `backend/src/models/IPOApplication.js`

---

### Modification Requests

Maker-Checker workflow requests for data modifications.

**Table Name:** `modification_requests`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing ID |
| target_model | VARCHAR(50) | NOT NULL | Target model/table name |
| target_id | INTEGER | NOT NULL | Target record ID |
| requested_changes | JSON | NOT NULL | Requested changes (JSON) |
| change_type | VARCHAR(20) | DEFAULT 'update', CHECK | Type: create, update, delete |
| status | VARCHAR(20) | DEFAULT 'pending', CHECK | Status: pending, approved, rejected |
| requested_by | INTEGER | FOREIGN KEY → users(id) | User who requested |
| reviewed_by | INTEGER | FOREIGN KEY → users(id) | User who reviewed |
| review_notes | TEXT | | Review notes |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- `idx_modification_requests_status` on `status`

**Sequelize Model:** `backend/src/models/ModificationRequest.js`

---

### Activity Logs

System activity logs for audit trail.

**Table Name:** `activity_logs`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique log ID |
| user_id | UUID | NOT NULL | User who performed the action |
| action | VARCHAR(255) | NOT NULL | Action performed |
| entity_type | VARCHAR(50) | | Entity type affected |
| entity_id | VARCHAR(255) | | Entity ID affected |
| details | JSONB | | Additional details (JSON) |
| ip_address | VARCHAR(45) | | IP address of user |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | Log timestamp |

**Indexes:**
- `idx_activity_logs_user_id` on `user_id`
- `idx_activity_logs_created_at` on `created_at`

**Sequelize Model:** `backend/src/models/ActivityLog.js`

---

## Investor Module Tables

### Investors

Investor information for investment management.

**Table Name:** `investors`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing ID |
| investor_id | VARCHAR(255) | UNIQUE, NOT NULL | Unique investor identifier |
| full_name | VARCHAR(255) | NOT NULL | Investor full name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Investor email |
| phone | VARCHAR(50) | NOT NULL | Contact phone |
| address | TEXT | | Physical address |
| pan_number | VARCHAR(50) | | PAN number |
| bank_account | VARCHAR(50) | | Bank account number |
| bank_name | VARCHAR(255) | | Bank name |
| status | VARCHAR(20) | DEFAULT 'active', CHECK | Status: active, inactive |
| created_by | INTEGER | FOREIGN KEY → users(id) | User who created |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- `idx_investors_email` on `email`
- `idx_investors_investor_id` on `investor_id`

**Sequelize Model:** `backend/src/models/Investor.js`

---

### Investor Categories

Investment categories for organizing investments.

**Table Name:** `investor_categories`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing ID |
| category_id | VARCHAR(255) | UNIQUE, NOT NULL | Unique category identifier |
| category_name | VARCHAR(255) | NOT NULL | Category name |
| description | TEXT | | Category description |
| status | VARCHAR(20) | DEFAULT 'active', CHECK | Status: active, inactive |
| created_by | INTEGER | FOREIGN KEY → users(id) | User who created |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- `idx_investor_categories_category_id` on `category_id`

**Sequelize Model:** `backend/src/models/InvestorCategory.js`

---

### Investments

Investment records linking investors to categories.

**Table Name:** `investments`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing ID |
| investment_id | VARCHAR(255) | UNIQUE, NOT NULL | Unique investment identifier |
| investor_id | INTEGER | FOREIGN KEY → investors(id), CASCADE | Associated investor |
| category_id | INTEGER | FOREIGN KEY → investor_categories(id) | Investment category |
| amount | DECIMAL(15, 2) | NOT NULL | Investment amount |
| investment_date | DATE | NOT NULL | Investment date |
| maturity_date | DATE | | Maturity date |
| interest_rate | DECIMAL(5, 2) | | Interest rate percentage |
| status | VARCHAR(50) | DEFAULT 'active', CHECK | Status: active, matured, withdrawn |
| notes | TEXT | | Additional notes |
| created_by | INTEGER | FOREIGN KEY → users(id) | User who created |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- `idx_investments_investor_id` on `investor_id`
- `idx_investments_category_id` on `category_id`

**Sequelize Model:** `backend/src/models/Investment.js`

---

### Profit Distributions

Profit distribution records for investments.

**Table Name:** `profit_distributions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing ID |
| distribution_id | VARCHAR(255) | UNIQUE, NOT NULL | Unique distribution identifier |
| investment_id | INTEGER | FOREIGN KEY → investments(id), CASCADE | Associated investment |
| amount | DECIMAL(15, 2) | NOT NULL | Distribution amount |
| distribution_date | DATE | NOT NULL | Distribution date |
| distribution_type | VARCHAR(50) | DEFAULT 'interest', CHECK | Type: interest, dividend, bonus |
| payment_status | VARCHAR(50) | DEFAULT 'pending', CHECK | Status: pending, paid, cancelled |
| payment_date | DATE | | Payment date |
| notes | TEXT | | Additional notes |
| created_by | INTEGER | FOREIGN KEY → users(id) | User who created |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- `idx_profit_distributions_investment_id` on `investment_id`

**Sequelize Model:** `backend/src/models/ProfitDistribution.js`

---

### Category Account Assignments

Mapping between investment categories and bank accounts.

**Table Name:** `category_account_assignments`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing ID |
| category_id | INTEGER | FOREIGN KEY → investor_categories(id), CASCADE | Investment category |
| account_id | INTEGER | FOREIGN KEY → accounts(id), CASCADE | Bank account |
| assigned_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Assignment timestamp |
| assigned_by | INTEGER | FOREIGN KEY → users(id) | User who assigned |

**Unique Constraint:** `(category_id, account_id)`

**Indexes:**
- `idx_category_account_assignments_category_id` on `category_id`
- `idx_category_account_assignments_account_id` on `account_id`

**Sequelize Model:** `backend/src/models/CategoryAccountAssignment.js`

---

## Entity Relationships

### Core Relationships

```
users (1) ─────< (N) customers (created_by)
users (1) ─────< (N) customers (verified_by)
customers (1) ─< (N) accounts
accounts (1) ──< (N) transactions
customers (1) ─< (N) portfolios
portfolios (1) < (N) holdings
```

### Feature Relationships

```
customers (1) ─< (N) customer_credentials
customers (1) ─< (N) ipo_applications
users (1) ─────< (N) ipo_applications (verified_by)
users (1) ─────< (N) modification_requests (requested_by)
users (1) ─────< (N) modification_requests (reviewed_by)
```

### Investor Module Relationships

```
users (1) ──────────< (N) investors (created_by)
users (1) ──────────< (N) investor_categories (created_by)
investors (1) ──────< (N) investments
investor_categories (1) < (N) investments
investments (1) ────< (N) profit_distributions
investor_categories (N) >──< (N) accounts (via category_account_assignments)
```

---

## Data Types Reference

- **SERIAL**: Auto-incrementing integer
- **VARCHAR(n)**: Variable-length string with max length n
- **TEXT**: Variable-length string (unlimited)
- **INTEGER**: 4-byte integer
- **DECIMAL(p, s)**: Decimal number with precision p and scale s
- **DATE**: Date (year, month, day)
- **TIMESTAMP**: Date and time
- **TIMESTAMP WITH TIME ZONE**: Date and time with timezone
- **JSON/JSONB**: JSON data (JSONB is binary, more efficient)
- **UUID**: Universally Unique Identifier

---

## Naming Conventions

- **Table Names**: Plural, lowercase with underscores (e.g., `users`, `ipo_applications`)
- **Column Names**: Lowercase with underscores (e.g., `customer_id`, `created_at`)
- **Primary Keys**: `id` (auto-incrementing)
- **Foreign Keys**: `<table>_id` (e.g., `customer_id`, `user_id`)
- **Unique Identifiers**: `<entity>_id` (e.g., `user_id`, `customer_id`)
- **Timestamps**: `created_at`, `updated_at`
- **Status Fields**: `status`, `kyc_status`, `payment_status`

---

## Best Practices

1. **Always use transactions** for operations that modify multiple tables
2. **Use indexes** on frequently queried columns (foreign keys, email, etc.)
3. **Validate data** at both application and database level
4. **Use CHECK constraints** for enum-like values
5. **Use CASCADE** carefully - understand the implications
6. **Keep audit trails** using activity logs
7. **Use prepared statements** to prevent SQL injection
8. **Regular backups** are essential
9. **Monitor query performance** and optimize as needed
10. **Document schema changes** in migration files

---

## Migration Strategy

1. **Never modify existing migrations** - create new ones
2. **Test migrations** on development database first
3. **Keep migrations small** and focused
4. **Include rollback scripts** when possible
5. **Document breaking changes** clearly
6. **Version control** all migration files
7. **Run migrations** in order (001, 002, 003, etc.)

---

*Last Updated: 2026-01-12*
