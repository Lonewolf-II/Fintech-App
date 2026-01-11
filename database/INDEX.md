# Database Documentation Index

Welcome to the FinTech Application Database Documentation! This directory contains everything you need to set up, understand, and maintain the database.

## 📚 Documentation Files

### 🚀 Getting Started
- **[QUICKSTART.md](QUICKSTART.md)** - Quick setup guide (Start here!)
  - Step-by-step setup instructions
  - Windows and Linux/Mac commands
  - Troubleshooting tips

### 📖 Main Documentation
- **[README.md](README.md)** - Complete database documentation
  - Directory structure
  - Database information
  - Setup options
  - Migration guide
  - Security notes
  - Maintenance commands

### 📊 Database Schema
- **[MODELS.md](MODELS.md)** - Detailed table documentation
  - All 15 database tables
  - Column descriptions
  - Relationships
  - Indexes
  - Best practices

### 🎨 Visual Diagrams
- **[DIAGRAM.md](DIAGRAM.md)** - Visual representations
  - Entity Relationship Diagrams
  - Data flow diagrams
  - Table groupings
  - Index strategy

### ⚙️ Configuration
- **[.env.example](.env.example)** - Environment variables template
  - Database configuration
  - Required variables
  - Security notes

## 📁 Database Files

### 🗄️ Schema
- **[schema.sql](schema.sql)** - Complete database schema
  - All tables in one file
  - All indexes
  - Default data
  - Ready to deploy

### 🔄 Migrations
- **[migrations/001_init_schema.sql](migrations/001_init_schema.sql)** - Core tables
- **[migrations/002_add_missing_tables.sql](migrations/002_add_missing_tables.sql)** - Feature tables
- **[migrations/003_create_activity_logs.sql](migrations/003_create_activity_logs.sql)** - Activity logs
- **[migrations/004_investor_module.sql](migrations/004_investor_module.sql)** - Investor module

### 🌱 Seeds
- **[seeds/001_default_users.sql](seeds/001_default_users.sql)** - Default user accounts
- **[seeds/002_sample_data.sql](seeds/002_sample_data.sql)** - Sample development data

### 🛠️ Scripts
- **[scripts/setup.ps1](scripts/setup.ps1)** - Windows PowerShell setup
- **[scripts/setup.sh](scripts/setup.sh)** - Linux/Mac Bash setup
- **[scripts/reset.sql](scripts/reset.sql)** - Database reset script

## 🎯 Quick Navigation

### I want to...

#### Set up the database for the first time
→ Read [QUICKSTART.md](QUICKSTART.md) and run the setup script

#### Understand the database structure
→ Read [MODELS.md](MODELS.md) for detailed table information
→ Read [DIAGRAM.md](DIAGRAM.md) for visual representations

#### Migrate to a new environment
→ Copy the entire `database` folder
→ Follow instructions in [README.md](README.md) → "Migration to Another Directory"

#### Reset the database
→ Run `scripts/reset.sql` then `schema.sql`
→ Or use setup script with `--reset` flag

#### Add sample data for testing
→ Run `seeds/002_sample_data.sql`
→ Or use setup script with `--with-sample-data` flag

#### Understand relationships between tables
→ Check [DIAGRAM.md](DIAGRAM.md) for ERD diagrams
→ Check [MODELS.md](MODELS.md) for relationship descriptions

#### Configure database connection
→ Copy `.env.example` to project root as `.env`
→ Update values as needed

## 📊 Database Statistics

- **Total Tables**: 15
- **Core Tables**: 6 (users, customers, accounts, transactions, portfolios, holdings)
- **Feature Tables**: 5 (credentials, IPO, modifications, activity logs)
- **Investor Module**: 5 (investors, categories, investments, distributions, assignments)
- **Total Indexes**: 20+
- **Default Users**: 4 (admin, maker, checker, investor)

## 🔐 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fintech.com | admin123 |
| Maker | maker@fintech.com | admin123 |
| Checker | checker@fintech.com | admin123 |
| Investor | investor@fintech.com | admin123 |

**⚠️ Change these in production!**

## 🗂️ Complete Directory Structure

```
database/
├── README.md                    # Main documentation
├── QUICKSTART.md                # Quick start guide
├── MODELS.md                    # Table documentation
├── DIAGRAM.md                   # Visual diagrams
├── INDEX.md                     # This file
├── .env.example                 # Environment template
├── schema.sql                   # Complete schema
│
├── migrations/                  # Migration files (ordered)
│   ├── 001_init_schema.sql
│   ├── 002_add_missing_tables.sql
│   ├── 003_create_activity_logs.sql
│   └── 004_investor_module.sql
│
├── seeds/                       # Seed data
│   ├── 001_default_users.sql
│   └── 002_sample_data.sql
│
└── scripts/                     # Utility scripts
    ├── setup.sh                 # Linux/Mac setup
    ├── setup.ps1                # Windows setup
    └── reset.sql                # Database reset
```

## 🚦 Setup Workflow

```
1. Prerequisites Check
   ├── PostgreSQL installed? ✓
   ├── PostgreSQL running? ✓
   └── Command line access? ✓

2. Choose Setup Method
   ├── Automated (Recommended)
   │   └── Run setup script
   └── Manual
       ├── Create database & user
       ├── Run schema.sql
       └── (Optional) Run seeds

3. Configuration
   ├── Copy .env.example to .env
   └── Update database credentials

4. Verification
   ├── Test database connection
   └── Start backend server

5. Done! 🎉
```

## 📞 Support & Resources

### Documentation
- Main README: [README.md](README.md)
- Quick Start: [QUICKSTART.md](QUICKSTART.md)
- Models: [MODELS.md](MODELS.md)
- Diagrams: [DIAGRAM.md](DIAGRAM.md)

### External Resources
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Sequelize ORM](https://sequelize.org/docs/v6/)
- Project Backend: `../backend/src/models/`

### Troubleshooting
- Check [QUICKSTART.md](QUICKSTART.md) → Troubleshooting section
- Check [README.md](README.md) → Troubleshooting section
- Review PostgreSQL logs
- Verify environment variables

## 🔄 Version History

- **v1.0** (2026-01-12) - Initial database structure
  - Core banking tables
  - IPO management
  - Investor module
  - Maker-Checker workflow
  - Activity logging

## 📝 Notes

- All SQL files use PostgreSQL syntax
- Migration files should be run in order
- Always backup before running reset script
- Test migrations on development first
- Keep this documentation updated with schema changes

---

**Ready to get started?** → [QUICKSTART.md](QUICKSTART.md)

**Need detailed info?** → [README.md](README.md)

**Want to understand tables?** → [MODELS.md](MODELS.md)

**Prefer visual diagrams?** → [DIAGRAM.md](DIAGRAM.md)

---

*Last Updated: 2026-01-12*
