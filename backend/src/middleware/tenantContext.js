import { Tenant, License, IPWhitelist } from '../../../central-db/index.js';
import { getTenantDatabase, initializeTenantModels } from '../config/tenantDatabase.js';

// Middleware to extract and validate tenant context
export async function tenantContext(req, res, next) {
    try {
        // Extract tenant identifier from subdomain or header
        let tenantKey = null;

        // Method 1: From subdomain (e.g., acme.yourapp.com)
        const host = req.get('host');
        if (host) {
            const subdomain = host.split('.')[0];
            if (subdomain && subdomain !== 'localhost' && subdomain !== 'www') {
                tenantKey = subdomain;
            }
        }

        // Method 2: From custom header (for development/testing)
        if (!tenantKey && req.get('X-Tenant-Key')) {
            tenantKey = req.get('X-Tenant-Key');
        }

        // If no tenant key found, reject request
        if (!tenantKey) {
            return res.status(400).json({
                error: 'Tenant not specified. Please access via subdomain or provide X-Tenant-Key header.'
            });
        }

        // Fetch tenant from central database
        const tenant = await Tenant.findOne({
            where: { subdomain: tenantKey },
            include: [
                { model: License, as: 'licenses' }
            ]
        });

        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }

        // Check tenant status
        if (tenant.status === 'suspended') {
            return res.status(403).json({
                error: 'Your account has been suspended. Please contact support.',
                contactEmail: 'support@yourcompany.com'
            });
        }

        if (tenant.status === 'expired') {
            return res.status(403).json({
                error: 'Your subscription has expired. Please renew to continue.',
                contactEmail: 'billing@yourcompany.com'
            });
        }

        // Check IP whitelist (if configured)
        const whitelistEntries = await IPWhitelist.findAll({
            where: { tenantId: tenant.id }
        });

        if (whitelistEntries.length > 0) {
            const clientIP = req.ip || req.connection.remoteAddress;
            const isAllowed = whitelistEntries.some(entry => {
                // Simple IP matching (can be enhanced with CIDR support)
                return clientIP.includes(entry.ipAddress) || entry.ipAddress === clientIP;
            });

            if (!isAllowed) {
                console.warn(`IP ${clientIP} not whitelisted for tenant ${tenant.companyName}`);
                return res.status(403).json({
                    error: 'Access denied. Your IP address is not whitelisted.'
                });
            }
        }

        // Validate license
        const activeLicense = tenant.licenses?.find(l =>
            !l.revokedAt && (!l.expiresAt || new Date(l.expiresAt) > new Date())
        );

        if (!activeLicense) {
            return res.status(403).json({
                error: 'No active license found. Please contact your administrator.'
            });
        }

        // Connect to tenant's database
        const tenantDb = await getTenantDatabase(tenant);
        const tenantModels = await initializeTenantModels(tenantDb);

        // Attach to request object
        req.tenant = tenant;
        req.tenantDb = tenantDb;
        req.tenantModels = tenantModels;
        req.license = activeLicense;
        req.features = activeLicense.featureFlags || {};

        next();
    } catch (error) {
        console.error('Tenant context error:', error);
        res.status(500).json({
            error: 'Failed to establish tenant context',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

// Middleware to check feature flags
export function requireFeature(featureName) {
    return (req, res, next) => {
        if (!req.features || !req.features[featureName]) {
            return res.status(403).json({
                error: `Feature '${featureName}' is not enabled for your subscription.`,
                contactEmail: 'sales@yourcompany.com'
            });
        }
        next();
    };
}

// Middleware to check subscription limits
export async function checkSubscriptionLimits(req, res, next) {
    try {
        const { Subscription } = await import('../../../central-db/index.js');

        const subscription = await Subscription.findOne({
            where: { tenantId: req.tenant.id },
            order: [['createdAt', 'DESC']]
        });

        if (!subscription) {
            return res.status(403).json({ error: 'No active subscription found' });
        }

        // Check if subscription is expired
        if (new Date(subscription.endDate) < new Date()) {
            return res.status(403).json({
                error: 'Your subscription has expired. Please renew to continue.'
            });
        }

        // Attach subscription to request
        req.subscription = subscription;
        next();
    } catch (error) {
        console.error('Subscription check error:', error);
        res.status(500).json({ error: 'Failed to verify subscription' });
    }
}
