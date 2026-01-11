import express from 'express';
import {
    applyIPO,
    verifyIPO,
    getIPOApplications,
    createIPOListing,
    getIPOListings,
    getOpenIPOListings,
    updateIPOStatus,
    bulkApplyIPO
} from '../controllers/ipoController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// -- IPO Application Routes --

// Apply for IPO
router.post('/apply', applyIPO);

// Bulk Apply for IPO (Maker/Admin only)
router.post('/bulk', requireRole('maker', 'admin'), bulkApplyIPO);

// Verify IPO (Checker/Admin only)
router.put('/:id/verify', requireRole('checker', 'admin'), verifyIPO);

// Get applications
router.get('/applications', getIPOApplications);


// -- IPO Listing Routes --

// Create IPO Listing (Admin only)
router.post('/listings', requireRole('admin'), createIPOListing);

// Get All IPO Listings
router.get('/listings', getIPOListings);

// Get Open IPO Listings
router.get('/listings/open', getOpenIPOListings);

// Update IPO Status (Admin only)
router.patch('/listings/:id/status', requireRole('admin'), updateIPOStatus);

export default router;
