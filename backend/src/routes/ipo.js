
import express from 'express';
import {
    createIPOListing,
    getIPOListings,
    getOpenIPOListings,
    applyIPO,
    getIPOApplications,
    updateIPOStatus,
    verifyIPO,
    bulkApplyIPO,
    updateIPOApplication,
    deleteIPOApplication
} from '../controllers/ipoController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// -- IPO Listing Routes --

router.post('/listings', requireRole('admin'), createIPOListing);

// Get All IPO Listings
router.get('/listings', getIPOListings);

// Get Open IPO Listings
router.get('/listings/open', getOpenIPOListings);

// Update IPO Status (Admin only)
router.patch('/listings/:id/status', requireRole('admin'), updateIPOStatus);

// -- IPO Application Routes --

// Apply for IPO
router.post('/apply', applyIPO);

// Bulk Apply for IPO (Maker/Admin only)
router.post('/bulk-apply', requireRole('maker', 'admin'), bulkApplyIPO);

// Verify IPO (Checker/Admin only)
router.put('/applications/:id/verify', requireRole('checker', 'admin'), verifyIPO);

// Update IPO (Maker/Admin) - New
router.put('/applications/:id', requireRole('maker', 'admin'), updateIPOApplication);

// Delete IPO (Maker/Admin) - New
router.delete('/applications/:id', requireRole('maker', 'admin'), deleteIPOApplication);

// Get applications
router.get('/applications', getIPOApplications);

export default router;
