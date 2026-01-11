#!/bin/bash

# =====================================================
# FinTech Database Setup Script (Linux/Mac)
# =====================================================
# This script sets up the PostgreSQL database for the FinTech application
# Usage: ./setup.sh [options]
# Options:
#   --with-sample-data    Include sample data for development
#   --reset               Drop existing database and recreate
# =====================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
DB_NAME="${DB_NAME:-fintech_db}"
DB_USER="${DB_USER:-fintech_user}"
DB_PASSWORD="${DB_PASSWORD:-fintech_password}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
WITH_SAMPLE_DATA=false
RESET_DB=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --with-sample-data)
            WITH_SAMPLE_DATA=true
            shift
            ;;
        --reset)
            RESET_DB=true
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   FinTech Database Setup Script                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if PostgreSQL is running
echo -e "${YELLOW}[1/7] Checking PostgreSQL service...${NC}"
if ! pg_isready -h $DB_HOST -p $DB_PORT > /dev/null 2>&1; then
    echo -e "${RED}❌ PostgreSQL is not running on $DB_HOST:$DB_PORT${NC}"
    echo -e "${YELLOW}Please start PostgreSQL and try again.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ PostgreSQL is running${NC}"
echo ""

# Reset database if requested
if [ "$RESET_DB" = true ]; then
    echo -e "${YELLOW}[2/7] Resetting database...${NC}"
    psql -h $DB_HOST -p $DB_PORT -U $POSTGRES_USER -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>/dev/null || true
    psql -h $DB_HOST -p $DB_PORT -U $POSTGRES_USER -c "DROP USER IF EXISTS $DB_USER;" 2>/dev/null || true
    echo -e "${GREEN}✅ Database reset complete${NC}"
else
    echo -e "${YELLOW}[2/7] Skipping database reset${NC}"
fi
echo ""

# Create database user
echo -e "${YELLOW}[3/7] Creating database user...${NC}"
psql -h $DB_HOST -p $DB_PORT -U $POSTGRES_USER -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || echo -e "${BLUE}ℹ️  User already exists${NC}"
echo -e "${GREEN}✅ Database user ready${NC}"
echo ""

# Create database
echo -e "${YELLOW}[4/7] Creating database...${NC}"
psql -h $DB_HOST -p $DB_PORT -U $POSTGRES_USER -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" 2>/dev/null || echo -e "${BLUE}ℹ️  Database already exists${NC}"
psql -h $DB_HOST -p $DB_PORT -U $POSTGRES_USER -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
echo -e "${GREEN}✅ Database created${NC}"
echo ""

# Run schema
echo -e "${YELLOW}[5/7] Creating database schema...${NC}"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DATABASE_DIR="$(dirname "$SCRIPT_DIR")"

if [ -f "$DATABASE_DIR/schema.sql" ]; then
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$DATABASE_DIR/schema.sql"
    echo -e "${GREEN}✅ Schema created successfully${NC}"
else
    echo -e "${RED}❌ schema.sql not found${NC}"
    exit 1
fi
echo ""

# Seed default users
echo -e "${YELLOW}[6/7] Seeding default users...${NC}"
if [ -f "$DATABASE_DIR/seeds/001_default_users.sql" ]; then
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$DATABASE_DIR/seeds/001_default_users.sql"
    echo -e "${GREEN}✅ Default users seeded${NC}"
else
    echo -e "${YELLOW}⚠️  Default users seed file not found${NC}"
fi
echo ""

# Seed sample data if requested
if [ "$WITH_SAMPLE_DATA" = true ]; then
    echo -e "${YELLOW}[7/7] Seeding sample data...${NC}"
    if [ -f "$DATABASE_DIR/seeds/002_sample_data.sql" ]; then
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$DATABASE_DIR/seeds/002_sample_data.sql"
        echo -e "${GREEN}✅ Sample data seeded${NC}"
    else
        echo -e "${YELLOW}⚠️  Sample data seed file not found${NC}"
    fi
else
    echo -e "${YELLOW}[7/7] Skipping sample data (use --with-sample-data to include)${NC}"
fi
echo ""

# Summary
echo -e "${GREEN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Database Setup Complete! 🎉                      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Database Details:${NC}"
echo -e "  Host:     ${GREEN}$DB_HOST${NC}"
echo -e "  Port:     ${GREEN}$DB_PORT${NC}"
echo -e "  Database: ${GREEN}$DB_NAME${NC}"
echo -e "  User:     ${GREEN}$DB_USER${NC}"
echo ""
echo -e "${BLUE}Default Login Credentials:${NC}"
echo -e "  Admin:    ${GREEN}admin@fintech.com${NC} / ${GREEN}admin123${NC}"
echo -e "  Maker:    ${GREEN}maker@fintech.com${NC} / ${GREEN}admin123${NC}"
echo -e "  Checker:  ${GREEN}checker@fintech.com${NC} / ${GREEN}admin123${NC}"
echo -e "  Investor: ${GREEN}investor@fintech.com${NC} / ${GREEN}admin123${NC}"
echo ""
echo -e "${YELLOW}⚠️  Remember to change default passwords in production!${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo -e "  1. Update your ${GREEN}.env${NC} file with database credentials"
echo -e "  2. Start your backend server: ${GREEN}npm run dev${NC}"
echo -e "  3. Access the application and login with default credentials"
echo ""
