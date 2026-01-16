
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
import {
    allotIPOApplication,
    getIPOApplicationsEnhanced,
    getIPOStats
} from '../controllers/ipoAllotmentController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// -- IPO Listing Routes --

// Create IPO Listing (Admin only)
router.post('/listings', requireRole('admin'), createIPOListing);

// Get All IPO Listings
router.get('/listings', getIPOListings);

// Get Open IPO Listings
router.get('/listings/open', getOpenIPOListings);

// Update IPO Status (Admin only)
router.patch('/listings/:id/status', requireRole('admin'), updateIPOStatus);

// -- IPO Application Routes --

// Apply for IPO (Maker/Admin)
router.post('/apply', requireRole('maker', 'admin'), applyIPO);

// Bulk Apply for IPO (Maker/Admin only)
router.post('/bulk-apply', requireRole('maker', 'admin'), bulkApplyIPO);

// Get applications (enhanced with filters)
router.get('/applications', getIPOApplicationsEnhanced);

// Verify IPO (Checker/Admin only)
router.put('/applications/:id/verify', requireRole('checker', 'admin'), verifyIPO);

// Allot IPO Application (Admin only)
router.post('/applications/:id/allot', requireRole('admin'), allotIPOApplication);

// Update IPO Application (Maker/Admin)
router.put('/applications/:id', requireRole('maker', 'admin'), updateIPOApplication);

// Delete IPO Application (Admin only)
router.delete('/applications/:id', requireRole('maker', 'admin'), deleteIPOApplication);

// -- Statistics Routes --

// Get IPO Statistics
router.get('/stats', requireRole('admin', 'checker'), getIPOStats);

export default router;
