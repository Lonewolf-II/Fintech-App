# Database Structure Diagram

This document provides visual representations of the database structure.

## Entity Relationship Diagram

```mermaid
erDiagram
    users ||--o{ customers : "creates/verifies"
    users ||--o{ transactions : "creates"
    users ||--o{ modification_requests : "requests/reviews"
    users ||--o{ investors : "creates"
    users ||--o{ investor_categories : "creates"
    users ||--o{ investments : "creates"
    users ||--o{ profit_distributions : "creates"
    users ||--o{ ipo_applications : "verifies"
    users ||--o{ customer_credentials : "updates"
    
    customers ||--o{ accounts : "owns"
    customers ||--o{ portfolios : "owns"
    customers ||--o{ customer_credentials : "has"
    customers ||--o{ ipo_applications : "applies"
    
    accounts ||--o{ transactions : "has"
    accounts ||--o{ category_account_assignments : "assigned_to"
    
    portfolios ||--o{ holdings : "contains"
    
    investors ||--o{ investments : "makes"
    investor_categories ||--o{ investments : "categorizes"
    investor_categories ||--o{ category_account_assignments : "assigned_to"
    
    investments ||--o{ profit_distributions : "generates"
    
    users {
        int id PK
        string user_id UK
        int staff_id UK
        string email UK
        string password_hash
        string name
        string role
        string phone
        string avatar
        string status
        timestamp created_at
        timestamp updated_at
    }
    
    customers {
        int id PK
        string customer_id UK
        string full_name
        string email UK
        string phone
        text address
        date date_of_birth
        string kyc_status
        string account_type
        int created_by FK
        int verified_by FK
        timestamp created_at
        timestamp updated_at
    }
    
    accounts {
        int id PK
        string account_number UK
        int customer_id FK
        string account_type
        decimal balance
        string currency
        string status
        date opening_date
        timestamp created_at
        timestamp updated_at
    }
    
    transactions {
        int id PK
        string transaction_id UK
        int account_id FK
        string transaction_type
        decimal amount
        decimal balance_after
        text description
        int created_by FK
        timestamp created_at
    }
    
    portfolios {
        int id PK
        string portfolio_id UK
        int customer_id FK
        decimal total_value
        decimal total_investment
        decimal profit_loss
        timestamp created_at
        timestamp updated_at
    }
    
    holdings {
        int id PK
        string holding_id UK
        int portfolio_id FK
        string stock_symbol
        string company_name
        int quantity
        decimal purchase_price
        decimal current_price
        decimal total_value
        decimal profit_loss_percent
        date purchase_date
        timestamp created_at
        timestamp updated_at
    }
    
    customer_credentials {
        int id PK
        int customer_id FK
        string platform
        string login_id
        string password
        string status
        int updated_by FK
        timestamp created_at
        timestamp updated_at
    }
    
    ipo_listings {
        int id PK
        string company_name
        decimal price_per_share
        int total_shares
        date open_date
        date close_date
        string status
        text description
        timestamp created_at
        timestamp updated_at
    }
    
    ipo_applications {
        int id PK
        int customer_id FK
        string company_name
        int quantity
        decimal price_per_share
        decimal total_amount
        string status
        timestamp applied_at
        int verified_by FK
        timestamp created_at
        timestamp updated_at
    }
    
    modification_requests {
        int id PK
        string target_model
        int target_id
        json requested_changes
        string change_type
        string status
        int requested_by FK
        int reviewed_by FK
        text review_notes
        timestamp created_at
        timestamp updated_at
    }
    
    activity_logs {
        uuid id PK
        uuid user_id
        string action
        string entity_type
        string entity_id
        jsonb details
        string ip_address
        timestamp created_at
    }
    
    investors {
        int id PK
        string investor_id UK
        string full_name
        string email UK
        string phone
        text address
        string pan_number
        string bank_account
        string bank_name
        string status
        int created_by FK
        timestamp created_at
        timestamp updated_at
    }
    
    investor_categories {
        int id PK
        string category_id UK
        string category_name
        text description
        string status
        int created_by FK
        timestamp created_at
        timestamp updated_at
    }
    
    investments {
        int id PK
        string investment_id UK
        int investor_id FK
        int category_id FK
        decimal amount
        date investment_date
        date maturity_date
        decimal interest_rate
        string status
        text notes
        int created_by FK
        timestamp created_at
        timestamp updated_at
    }
    
    profit_distributions {
        int id PK
        string distribution_id UK
        int investment_id FK
        decimal amount
        date distribution_date
        string distribution_type
        string payment_status
        date payment_date
        text notes
        int created_by FK
        timestamp created_at
        timestamp updated_at
    }
    
    category_account_assignments {
        int id PK
        int category_id FK
        int account_id FK
        timestamp assigned_at
        int assigned_by FK
    }
```

## Table Groups

### Core Banking Module
```mermaid
graph TD
    A[users] --> B[customers]
    B --> C[accounts]
    C --> D[transactions]
    B --> E[portfolios]
    E --> F[holdings]
```

### IPO Management Module
```mermaid
graph TD
    A[ipo_listings] -.available.-> B[customers]
    B --> C[ipo_applications]
    D[users] -.verifies.-> C
```

### Investor Management Module
```mermaid
graph TD
    A[investors] --> B[investments]
    C[investor_categories] --> B
    B --> D[profit_distributions]
    C --> E[category_account_assignments]
    F[accounts] --> E
```

### Workflow & Audit Module
```mermaid
graph TD
    A[users] --> B[modification_requests]
    A --> C[activity_logs]
    B -.affects.-> D[any_table]
```

### Customer Services Module
```mermaid
graph TD
    A[customers] --> B[customer_credentials]
    C[users] -.updates.-> B
    B -.platforms.-> D[Mobile Banking]
    B -.platforms.-> E[Meroshare]
    B -.platforms.-> F[TMS]
```

## Database Schema Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FinTech Database                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Core Banking │  │ IPO Module   │  │ Investor Mgmt│     │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤     │
│  │ • users      │  │ • ipo_       │  │ • investors  │     │
│  │ • customers  │  │   listings   │  │ • investor_  │     │
│  │ • accounts   │  │ • ipo_       │  │   categories │     │
│  │ • trans-     │  │   applications│  │ • investments│     │
│  │   actions    │  │              │  │ • profit_    │     │
│  │ • portfolios │  │              │  │   distributions│   │
│  │ • holdings   │  │              │  │ • category_  │     │
│  │              │  │              │  │   account_   │     │
│  │              │  │              │  │   assignments│     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │ Workflow &   │  │ Customer     │                        │
│  │ Audit        │  │ Services     │                        │
│  ├──────────────┤  ├──────────────┤                        │
│  │ • modification│ │ • customer_  │                        │
│  │   _requests  │  │   credentials│                        │
│  │ • activity_  │  │              │                        │
│  │   logs       │  │              │                        │
│  └──────────────┘  └──────────────┘                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### Customer Onboarding Flow
```mermaid
sequenceDiagram
    participant U as User (Maker)
    participant C as Customers
    participant A as Accounts
    participant P as Portfolios
    
    U->>C: Create Customer
    Note over C: KYC Status: Pending
    U->>C: Verify KYC
    Note over C: KYC Status: Verified
    U->>A: Create Account
    Note over A: Link to Customer
    U->>P: Create Portfolio
    Note over P: Link to Customer
```

### Transaction Flow
```mermaid
sequenceDiagram
    participant U as User
    participant A as Account
    participant T as Transaction
    participant L as Activity Log
    
    U->>A: Check Balance
    A-->>U: Current Balance
    U->>T: Create Transaction
    Note over T: Validate Amount
    T->>A: Update Balance
    T->>L: Log Activity
    T-->>U: Transaction Complete
```

### Investment Flow
```mermaid
sequenceDiagram
    participant U as User
    participant I as Investor
    participant C as Category
    participant Inv as Investment
    participant P as Profit Distribution
    
    U->>I: Create Investor
    U->>C: Create Category
    U->>Inv: Create Investment
    Note over Inv: Link Investor & Category
    Note over Inv: Set Interest Rate
    U->>P: Distribute Profit
    Note over P: Calculate Amount
    P-->>U: Payment Processed
```

### Maker-Checker Workflow
```mermaid
sequenceDiagram
    participant M as Maker
    participant MR as Modification Request
    participant C as Checker
    participant T as Target Table
    
    M->>MR: Create Request
    Note over MR: Status: Pending
    C->>MR: Review Request
    alt Approved
        C->>MR: Approve
        MR->>T: Apply Changes
        Note over T: Data Updated
    else Rejected
        C->>MR: Reject
        Note over MR: Status: Rejected
    end
```

## Index Strategy

### High-Priority Indexes (Already Implemented)
- **users**: email, staff_id
- **customers**: email
- **accounts**: customer_id
- **transactions**: account_id
- **portfolios**: customer_id
- **holdings**: portfolio_id
- **investors**: email, investor_id
- **investments**: investor_id, category_id
- **activity_logs**: user_id, created_at

### Composite Indexes (Consider for Performance)
```sql
-- For frequent queries
CREATE INDEX idx_transactions_account_date ON transactions(account_id, created_at DESC);
CREATE INDEX idx_investments_investor_status ON investments(investor_id, status);
CREATE INDEX idx_ipo_applications_customer_status ON ipo_applications(customer_id, status);
```

## Storage Estimates

Based on average row sizes:

| Table | Avg Row Size | 10K Rows | 100K Rows | 1M Rows |
|-------|--------------|----------|-----------|---------|
| users | ~500 bytes | 5 MB | 50 MB | 500 MB |
| customers | ~600 bytes | 6 MB | 60 MB | 600 MB |
| accounts | ~300 bytes | 3 MB | 30 MB | 300 MB |
| transactions | ~400 bytes | 4 MB | 40 MB | 400 MB |
| holdings | ~350 bytes | 3.5 MB | 35 MB | 350 MB |
| investors | ~550 bytes | 5.5 MB | 55 MB | 550 MB |
| investments | ~450 bytes | 4.5 MB | 45 MB | 450 MB |

**Note:** These are estimates. Actual sizes will vary based on data content.

---

*This diagram is auto-generated from the database schema. Last updated: 2026-01-12*
