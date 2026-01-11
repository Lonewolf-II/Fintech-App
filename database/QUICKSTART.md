# Database Quick Start Guide

This guide will help you quickly set up the database for the FinTech application.

## 📋 Prerequisites

- PostgreSQL 12 or higher installed
- PostgreSQL service running
- Command line access (PowerShell for Windows, Bash for Linux/Mac)

## 🚀 Quick Setup (Windows)

### Option 1: Automated Setup (Recommended)

```powershell
# Navigate to the database directory
cd database

# Run the setup script
.\scripts\setup.ps1

# Optional: Include sample data for development
.\scripts\setup.ps1 -WithSampleData

# Optional: Reset and recreate database
.\scripts\setup.ps1 -Reset -WithSampleData
```

### Option 2: Manual Setup

```powershell
# 1. Create database and user
psql -U postgres -c "CREATE USER fintech_user WITH PASSWORD 'fintech_password';"
psql -U postgres -c "CREATE DATABASE fintech_db OWNER fintech_user;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE fintech_db TO fintech_user;"

# 2. Run the complete schema
$env:PGPASSWORD = "fintech_password"
psql -U fintech_user -d fintech_db -f database/schema.sql

# 3. (Optional) Seed sample data
psql -U fintech_user -d fintech_db -f database/seeds/001_default_users.sql
psql -U fintech_user -d fintech_db -f database/seeds/002_sample_data.sql
```

## 🚀 Quick Setup (Linux/Mac)

### Option 1: Automated Setup (Recommended)

```bash
# Navigate to the database directory
cd database

# Make the script executable
chmod +x scripts/setup.sh

# Run the setup script
./scripts/setup.sh

# Optional: Include sample data for development
./scripts/setup.sh --with-sample-data

# Optional: Reset and recreate database
./scripts/setup.sh --reset --with-sample-data
```

### Option 2: Manual Setup

```bash
# 1. Create database and user
psql -U postgres -c "CREATE USER fintech_user WITH PASSWORD 'fintech_password';"
psql -U postgres -c "CREATE DATABASE fintech_db OWNER fintech_user;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE fintech_db TO fintech_user;"

# 2. Run the complete schema
PGPASSWORD=fintech_password psql -U fintech_user -d fintech_db -f database/schema.sql

# 3. (Optional) Seed sample data
PGPASSWORD=fintech_password psql -U fintech_user -d fintech_db -f database/seeds/001_default_users.sql
PGPASSWORD=fintech_password psql -U fintech_user -d fintech_db -f database/seeds/002_sample_data.sql
```

## ⚙️ Configuration

### Update Environment Variables

Create or update your `.env` file in the project root:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fintech_db
DB_USER=fintech_user
DB_PASSWORD=fintech_password
NODE_ENV=development
```

You can use the template:
```bash
cp database/.env.example .env
# Then edit .env with your values
```

## 🔐 Default Login Credentials

After setup, you can login with these default accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fintech.com | admin123 |
| Maker | maker@fintech.com | admin123 |
| Checker | checker@fintech.com | admin123 |
| Investor | investor@fintech.com | admin123 |

**⚠️ IMPORTANT:** Change these passwords before deploying to production!

## 🧪 Verify Setup

Test the database connection:

```bash
# Using psql
psql -U fintech_user -d fintech_db -c "SELECT COUNT(*) FROM users;"

# Expected output: 4 (if default users were seeded)
```

Or start your backend server:

```bash
cd backend
npm install
npm run dev
```

Look for the message: `✅ Database connection established successfully.`

## 🔄 Reset Database

If you need to start fresh:

```bash
# Using the reset script
psql -U fintech_user -d fintech_db -f database/scripts/reset.sql

# Then re-run the schema
psql -U fintech_user -d fintech_db -f database/schema.sql
```

Or use the setup script with reset flag:

```powershell
# Windows
.\database\scripts\setup.ps1 -Reset -WithSampleData
```

```bash
# Linux/Mac
./database/scripts/setup.sh --reset --with-sample-data
```

## 📚 Additional Resources

- **Full Documentation**: See [README.md](README.md)
- **Database Models**: See [MODELS.md](MODELS.md)
- **Migration Files**: See [migrations/](migrations/)
- **Seed Files**: See [seeds/](seeds/)

## 🐛 Troubleshooting

### PostgreSQL Not Running

**Windows:**
```powershell
# Check status
Get-Service postgresql*

# Start service
Start-Service postgresql-x64-14  # Adjust version number
```

**Linux:**
```bash
# Check status
sudo systemctl status postgresql

# Start service
sudo systemctl start postgresql
```

### Connection Refused

1. Check if PostgreSQL is running
2. Verify port 5432 is not blocked by firewall
3. Check `pg_hba.conf` for authentication settings
4. Ensure credentials in `.env` match database user

### Permission Denied

```sql
-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE fintech_db TO fintech_user;
GRANT ALL ON SCHEMA public TO fintech_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO fintech_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO fintech_user;
```

### Migration Errors

- Ensure migrations are run in order (001, 002, 003, 004)
- Check for existing tables before running migrations
- Use the reset script to start fresh if needed

## 📞 Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Review [MODELS.md](MODELS.md) for database schema details
- Consult the project's main README for contact information

---

**Happy Coding! 🚀**
