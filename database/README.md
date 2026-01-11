# Database Structure Documentation

This directory contains all database-related files for the FinTech Application, making it easy to migrate and set up the database in different environments.

## 📁 Directory Structure

```
database/
├── README.md                    # This file - Database documentation
├── schema.sql                   # Complete database schema
├── migrations/                  # Migration files (ordered)
│   ├── 001_init_schema.sql
│   ├── 002_add_missing_tables.sql
│   ├── 003_create_activity_logs.sql
│   └── 004_investor_module.sql
├── seeds/                       # Seed data for development/testing
│   ├── 001_default_users.sql
│   └── 002_sample_data.sql
└── scripts/                     # Database utility scripts
    ├── setup.sh                 # Linux/Mac setup script
    ├── setup.ps1                # Windows PowerShell setup script
    └── reset.sql                # Database reset script
```

## 🗄️ Database Information

- **Database Type**: PostgreSQL
- **Default Database Name**: `fintech_db`
- **Default User**: `fintech_user`
- **Default Port**: `5432`

## 📊 Database Tables

### Core Tables
1. **users** - System users (admin, maker, checker, investor)
2. **customers** - Customer information
3. **accounts** - Customer bank accounts
4. **transactions** - Financial transactions
5. **portfolios** - Customer investment portfolios
6. **holdings** - Stock holdings

### Feature Tables
7. **customer_credentials** - Customer platform credentials (Mobile Banking, Meroshare, TMS)
8. **ipo_listings** - IPO listings information
9. **ipo_applications** - Customer IPO applications
10. **modification_requests** - Maker-Checker workflow requests
11. **activity_logs** - System activity logs

### Investor Module Tables
12. **investors** - Investor information
13. **investor_categories** - Investment categories
14. **investments** - Investment records
15. **profit_distributions** - Profit distribution records
16. **category_account_assignments** - Category-Account mappings

## 🚀 Quick Start

### Option 1: Using the Complete Schema (Recommended for New Setup)

```bash
# Create database
psql -U postgres -c "CREATE DATABASE fintech_db;"
psql -U postgres -c "CREATE USER fintech_user WITH PASSWORD 'fintech_password';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE fintech_db TO fintech_user;"

# Run the complete schema
psql -U fintech_user -d fintech_db -f database/schema.sql
```

### Option 2: Using Migration Files (Recommended for Version Control)

```bash
# Create database (same as above)
psql -U postgres -c "CREATE DATABASE fintech_db;"
psql -U postgres -c "CREATE USER fintech_user WITH PASSWORD 'fintech_password';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE fintech_db TO fintech_user;"

# Run migrations in order
psql -U fintech_user -d fintech_db -f database/migrations/001_init_schema.sql
psql -U fintech_user -d fintech_db -f database/migrations/002_add_missing_tables.sql
psql -U fintech_user -d fintech_db -f database/migrations/003_create_activity_logs.sql
psql -U fintech_user -d fintech_db -f database/migrations/004_investor_module.sql
```

### Option 3: Using Setup Scripts

#### Windows (PowerShell)
```powershell
.\database\scripts\setup.ps1
```

#### Linux/Mac
```bash
chmod +x database/scripts/setup.sh
./database/scripts/setup.sh
```

## 🌱 Seeding Data

After setting up the schema, you can optionally seed the database with sample data:

```bash
# Seed default users (admin, maker, checker, investor)
psql -U fintech_user -d fintech_db -f database/seeds/001_default_users.sql

# Seed sample data (customers, accounts, etc.)
psql -U fintech_user -d fintech_db -f database/seeds/002_sample_data.sql
```

## 🔄 Migration to Another Directory

To migrate this project to another directory or server:

1. **Copy the entire `database` folder** to your new location
2. **Update environment variables** in your `.env` file:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=fintech_db
   DB_USER=fintech_user
   DB_PASSWORD=fintech_password
   ```
3. **Run the setup script** or manually execute the SQL files
4. **Verify the connection** using the backend application

## 🔧 Database Configuration

The database configuration is located in:
- **Backend Config**: `backend/src/config/database.js`

### Environment Variables Required:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fintech_db
DB_USER=fintech_user
DB_PASSWORD=fintech_password
NODE_ENV=development
```

## 📝 Default Credentials

After running the migrations, the following default users are created:

| Email | Password | Role | Staff ID |
|-------|----------|------|----------|
| admin@fintech.com | admin123 | admin | 100 |
| maker@fintech.com | admin123 | maker | 101 |
| checker@fintech.com | admin123 | checker | 102 |
| investor@fintech.com | admin123 | investor | 103 |

**⚠️ IMPORTANT**: Change these passwords in production!

## 🔒 Security Notes

1. **Never commit** `.env` files with real credentials
2. **Change default passwords** before deploying to production
3. **Use strong passwords** for database users
4. **Restrict database access** to authorized IPs only
5. **Regular backups** are recommended

## 🛠️ Maintenance

### Backup Database
```bash
pg_dump -U fintech_user fintech_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database
```bash
psql -U fintech_user -d fintech_db < backup_file.sql
```

### Reset Database
```bash
psql -U fintech_user -d fintech_db -f database/scripts/reset.sql
```

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Sequelize ORM Documentation](https://sequelize.org/docs/v6/)
- Project Backend: `backend/src/models/` - Sequelize models

## 🐛 Troubleshooting

### Connection Refused
- Ensure PostgreSQL is running: `sudo service postgresql status`
- Check if port 5432 is open
- Verify credentials in `.env` file

### Permission Denied
- Grant proper privileges: `GRANT ALL PRIVILEGES ON DATABASE fintech_db TO fintech_user;`
- Grant schema privileges: `GRANT ALL ON SCHEMA public TO fintech_user;`

### Migration Errors
- Check if migrations are run in order
- Verify PostgreSQL version compatibility (recommended: 12+)
- Check for existing tables before running migrations

## 📞 Support

For issues or questions, refer to the main project README or contact the development team.
