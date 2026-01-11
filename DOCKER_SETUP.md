# Quick Start Guide - Docker Setup

## Prerequisites
- Docker Desktop installed and running
- Docker Compose installed

## Step 1: Start All Services

From the root directory (`G:\Earnmore\fintech-app`), run:

```bash
docker-compose up -d
```

This will start:
- **central-db** (Port 5433) - Central management database
- **tenant-db** (Port 5432) - Default tenant database
- **superadmin-api** (Port 4000) - Superadmin backend
- **backend** (Port 3001) - Main application backend
- **frontend** (Port 5173) - Main application frontend
- **superadmin-portal** (Port 5174) - Superadmin portal frontend

## Step 2: Initialize Central Database

The central database will be automatically initialized with the schema on first run.

To create the default superadmin user, run:

```bash
docker-compose exec superadmin-api node ../central-db/init.js
```

**Default Superadmin Credentials:**
- Email: `admin@yourcompany.com`
- Password: `admin123`
- ⚠️ **Change this immediately in production!**

## Step 3: Access the Applications

- **Main Application**: http://localhost:5173
- **Superadmin Portal**: http://localhost:5174
- **Backend API**: http://localhost:3001
- **Superadmin API**: http://localhost:4000

## Step 4: Create Your First Tenant

1. Go to http://localhost:5174
2. Login with superadmin credentials
3. Click "Create New Tenant"
4. Fill in tenant details
5. The system will automatically provision a database

## Useful Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f superadmin-api
```

### Restart Services
```bash
docker-compose restart backend
docker-compose restart superadmin-api
```

### Stop All Services
```bash
docker-compose down
```

### Stop and Remove Volumes (⚠️ Deletes all data)
```bash
docker-compose down -v
```

### Access Database
```bash
# Central DB
docker-compose exec central-db psql -U postgres -d fintech_central

# Tenant DB
docker-compose exec tenant-db psql -U postgres -d fintech_tenant_default
```

### Rebuild After Code Changes
```bash
docker-compose up -d --build
```

## Troubleshooting

### Port Already in Use
If you get port conflicts, edit `docker-compose.yml` and change the port mappings.

### Database Connection Issues
Check if databases are healthy:
```bash
docker-compose ps
```

All services should show "healthy" status.

### Reset Everything
```bash
docker-compose down -v
docker-compose up -d
```

## Next Steps

1. Complete superadmin API implementation (Phase 1.3)
2. Build superadmin portal UI (Phase 2)
3. Implement tenant middleware in main backend (Phase 3)
