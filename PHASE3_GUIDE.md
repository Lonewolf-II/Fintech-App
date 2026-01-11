# Phase 3: Multi-Tenancy Implementation Guide

## ✅ What's Been Implemented

### 1. Tenant Database Connection Manager
**File**: `backend/src/config/tenantDatabase.js`

**Features**:
- Dynamic Sequelize instance creation per tenant
- Connection caching for performance
- Password decryption for security
- Automatic model initialization
- All associations preserved

### 2. Tenant Context Middleware
**File**: `backend/src/middleware/tenantContext.js`

**Capabilities**:
- Extracts tenant from subdomain (e.g., `acme.yourapp.com`)
- Fallback to `X-Tenant-Key` header for testing
- Validates tenant status (active/suspended/expired)
- Checks IP whitelist if configured
- Validates license and expiry
- Connects to tenant's database
- Attaches to request: `req.tenant`, `req.tenantDb`, `req.tenantModels`, `req.features`

### 3. Feature Flag Middleware
**Function**: `requireFeature(featureName)`

**Usage**:
```javascript
app.use('/api/portfolio', requireFeature('portfolio'), portfolioRoutes);
app.use('/api/ipo', requireFeature('ipo'), ipoRoutes);
```

### 4. Server Integration
**File**: `backend/src/server.js`

**Changes**:
- Connects to central management database on startup
- Applies `tenantContext` middleware to all `/api/*` routes
- Feature flags on portfolio and IPO routes
- Multi-tenant mode indicator in logs

---

## 🔧 How to Update Controllers

### Pattern to Follow

**BEFORE** (Global Models):
```javascript
import { Customer, Account } from '../models/index.js';

export const getAllCustomers = async (req, res) => {
    const customers = await Customer.findAll();
    res.json(customers);
};
```

**AFTER** (Tenant Models):
```javascript
export const getAllCustomers = async (req, res) => {
    const { Customer } = req.tenantModels;
    const customers = await Customer.findAll();
    res.json(customers);
};
```

### Key Changes

1. **Remove global model imports** at the top of controller files
2. **Extract models from `req.tenantModels`** in each function
3. **Use `req.tenantDb`** for transactions
4. **Access `req.features`** to check enabled features
5. **Use `req.tenant`** for tenant-specific logic

---

## 🧪 Testing Multi-Tenancy

### Method 1: Using X-Tenant-Key Header

```bash
# Create a test tenant first via superadmin portal
# Then use the tenant's subdomain as the header value

curl -H "X-Tenant-Key: acme" \
     -H "Authorization: Bearer YOUR_JWT" \
     http://localhost:3001/api/customers
```

### Method 2: Using Subdomain (Production)

```bash
# Configure DNS or /etc/hosts to point subdomain to localhost
# Example: 127.0.0.1 acme.localhost

curl -H "Authorization: Bearer YOUR_JWT" \
     http://acme.localhost:3001/api/customers
```

### Method 3: Testing in Browser

1. Add to `/etc/hosts` (Mac/Linux) or `C:\Windows\System32\drivers\etc\hosts` (Windows):
   ```
   127.0.0.1 acme.localhost
   127.0.0.1 demo.localhost
   ```

2. Access: `http://acme.localhost:5173`

---

## 📋 Controllers to Update

The following controllers need to be updated to use `req.tenantModels`:

- [ ] `authController.js` - Use tenant User model
- [ ] `customerController.js` - Use tenant Customer/Account models
- [ ] `bankingController.js` - Use tenant Account/Transaction models
- [ ] `portfolioController.js` - Use tenant Portfolio/Holding models
- [ ] `ipoController.js` - Use tenant IPOApplication/IPOListing models
- [ ] `userController.js` - Use tenant User model

**Example file provided**: `backend/src/controllers/EXAMPLE_tenant_aware_controller.js`

---

## 🔐 Security Features Active

✅ **Tenant Isolation**: Each request connects to correct tenant database  
✅ **Status Validation**: Suspended/expired tenants blocked  
✅ **License Validation**: Only active licenses allowed  
✅ **IP Whitelisting**: Optional IP-based access control  
✅ **Feature Flags**: Portfolio/IPO routes require license features  
✅ **Connection Caching**: Performance optimization  

---

## 🚀 Next Steps

1. **Update All Controllers**: Follow the pattern in EXAMPLE file
2. **Test with Multiple Tenants**: Create 2-3 test tenants
3. **Verify Isolation**: Ensure tenant A cannot see tenant B's data
4. **Implement Subscription Limits**: Add user/customer count checks
5. **Add Usage Tracking**: Track monthly transaction counts

---

## 🐛 Troubleshooting

### "Tenant not specified" Error
- Ensure you're using subdomain or `X-Tenant-Key` header
- Check tenant exists in central database

### "Tenant not found" Error
- Verify tenant's subdomain matches request
- Check tenant was created via superadmin portal

### "Account suspended" Error
- Tenant status is 'suspended'
- Use superadmin portal to activate

### "No active license" Error
- Generate license via superadmin portal
- Check license hasn't expired or been revoked

### Connection Pool Errors
- Restart backend to clear cached connections
- Check tenant database credentials are correct

---

## 📊 Current Status

**Phase 3 Progress**: 80% Complete

✅ Tenant middleware implemented  
✅ Dynamic database connections  
✅ Feature flag enforcement  
✅ Server integration complete  
⏳ Controller updates needed  
⏳ Subscription limit enforcement  
⏳ Usage tracking  

