# =====================================================
# FinTech Database Setup Script (Windows PowerShell)
# =====================================================
# This script sets up the PostgreSQL database for the FinTech application
# Usage: .\setup.ps1 [-WithSampleData] [-Reset]
# Options:
#   -WithSampleData    Include sample data for development
#   -Reset             Drop existing database and recreate
# =====================================================

param(
    [switch]$WithSampleData,
    [switch]$Reset
)

# Default values
$DB_NAME = if ($env:DB_NAME) { $env:DB_NAME } else { "fintech_db" }
$DB_USER = if ($env:DB_USER) { $env:DB_USER } else { "fintech_user" }
$DB_PASSWORD = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "fintech_password" }
$DB_HOST = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$DB_PORT = if ($env:DB_PORT) { $env:DB_PORT } else { "5432" }
$POSTGRES_USER = if ($env:POSTGRES_USER) { $env:POSTGRES_USER } else { "postgres" }

# Set environment variable for password
$env:PGPASSWORD = $DB_PASSWORD

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║   FinTech Database Setup Script                   ║" -ForegroundColor Blue
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

# Check if PostgreSQL is accessible
Write-Host "[1/7] Checking PostgreSQL service..." -ForegroundColor Yellow
try {
    $null = & pg_isready -h $DB_HOST -p $DB_PORT 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "PostgreSQL is not running"
    }
    Write-Host "✅ PostgreSQL is running" -ForegroundColor Green
} catch {
    Write-Host "❌ PostgreSQL is not running on ${DB_HOST}:${DB_PORT}" -ForegroundColor Red
    Write-Host "Please start PostgreSQL and try again." -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Reset database if requested
if ($Reset) {
    Write-Host "[2/7] Resetting database..." -ForegroundColor Yellow
    $env:PGPASSWORD = $env:POSTGRES_PASSWORD
    & psql -h $DB_HOST -p $DB_PORT -U $POSTGRES_USER -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>$null
    & psql -h $DB_HOST -p $DB_PORT -U $POSTGRES_USER -c "DROP USER IF EXISTS $DB_USER;" 2>$null
    Write-Host "✅ Database reset complete" -ForegroundColor Green
    $env:PGPASSWORD = $DB_PASSWORD
} else {
    Write-Host "[2/7] Skipping database reset" -ForegroundColor Yellow
}
Write-Host ""

# Create database user
Write-Host "[3/7] Creating database user..." -ForegroundColor Yellow
$env:PGPASSWORD = $env:POSTGRES_PASSWORD
$createUserResult = & psql -h $DB_HOST -p $DB_PORT -U $POSTGRES_USER -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>&1
if ($createUserResult -like "*already exists*") {
    Write-Host "ℹ️  User already exists" -ForegroundColor Cyan
} else {
    Write-Host "✅ Database user created" -ForegroundColor Green
}
$env:PGPASSWORD = $DB_PASSWORD
Write-Host ""

# Create database
Write-Host "[4/7] Creating database..." -ForegroundColor Yellow
$env:PGPASSWORD = $env:POSTGRES_PASSWORD
$createDbResult = & psql -h $DB_HOST -p $DB_PORT -U $POSTGRES_USER -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" 2>&1
if ($createDbResult -like "*already exists*") {
    Write-Host "ℹ️  Database already exists" -ForegroundColor Cyan
} else {
    Write-Host "✅ Database created" -ForegroundColor Green
}
& psql -h $DB_HOST -p $DB_PORT -U $POSTGRES_USER -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" | Out-Null
$env:PGPASSWORD = $DB_PASSWORD
Write-Host ""

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$DatabaseDir = Split-Path -Parent $ScriptDir

# Run schema
Write-Host "[5/7] Creating database schema..." -ForegroundColor Yellow
$SchemaFile = Join-Path $DatabaseDir "schema.sql"
if (Test-Path $SchemaFile) {
    & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $SchemaFile
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Schema created successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to create schema" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ schema.sql not found at: $SchemaFile" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Seed default users
Write-Host "[6/7] Seeding default users..." -ForegroundColor Yellow
$DefaultUsersFile = Join-Path $DatabaseDir "seeds\001_default_users.sql"
if (Test-Path $DefaultUsersFile) {
    & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $DefaultUsersFile
    Write-Host "✅ Default users seeded" -ForegroundColor Green
} else {
    Write-Host "⚠️  Default users seed file not found" -ForegroundColor Yellow
}
Write-Host ""

# Seed sample data if requested
if ($WithSampleData) {
    Write-Host "[7/7] Seeding sample data..." -ForegroundColor Yellow
    $SampleDataFile = Join-Path $DatabaseDir "seeds\002_sample_data.sql"
    if (Test-Path $SampleDataFile) {
        & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $SampleDataFile
        Write-Host "✅ Sample data seeded" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Sample data seed file not found" -ForegroundColor Yellow
    }
} else {
    Write-Host "[7/7] Skipping sample data (use -WithSampleData to include)" -ForegroundColor Yellow
}
Write-Host ""

# Summary
Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   Database Setup Complete! 🎉                      ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Database Details:" -ForegroundColor Blue
Write-Host "  Host:     " -NoNewline -ForegroundColor Blue
Write-Host "$DB_HOST" -ForegroundColor Green
Write-Host "  Port:     " -NoNewline -ForegroundColor Blue
Write-Host "$DB_PORT" -ForegroundColor Green
Write-Host "  Database: " -NoNewline -ForegroundColor Blue
Write-Host "$DB_NAME" -ForegroundColor Green
Write-Host "  User:     " -NoNewline -ForegroundColor Blue
Write-Host "$DB_USER" -ForegroundColor Green
Write-Host ""
Write-Host "Default Login Credentials:" -ForegroundColor Blue
Write-Host "  Admin:    " -NoNewline -ForegroundColor Blue
Write-Host "admin@fintech.com" -NoNewline -ForegroundColor Green
Write-Host " / " -NoNewline
Write-Host "admin123" -ForegroundColor Green
Write-Host "  Maker:    " -NoNewline -ForegroundColor Blue
Write-Host "maker@fintech.com" -NoNewline -ForegroundColor Green
Write-Host " / " -NoNewline
Write-Host "admin123" -ForegroundColor Green
Write-Host "  Checker:  " -NoNewline -ForegroundColor Blue
Write-Host "checker@fintech.com" -NoNewline -ForegroundColor Green
Write-Host " / " -NoNewline
Write-Host "admin123" -ForegroundColor Green
Write-Host "  Investor: " -NoNewline -ForegroundColor Blue
Write-Host "investor@fintech.com" -NoNewline -ForegroundColor Green
Write-Host " / " -NoNewline
Write-Host "admin123" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  Remember to change default passwords in production!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Blue
Write-Host "  1. Update your " -NoNewline -ForegroundColor Blue
Write-Host ".env" -NoNewline -ForegroundColor Green
Write-Host " file with database credentials" -ForegroundColor Blue
Write-Host "  2. Start your backend server: " -NoNewline -ForegroundColor Blue
Write-Host "npm run dev" -ForegroundColor Green
Write-Host "  3. Access the application and login with default credentials" -ForegroundColor Blue
Write-Host ""

# Clean up
Remove-Item Env:\PGPASSWORD
