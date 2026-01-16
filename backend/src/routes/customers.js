import express from 'express';
import multer from 'multer';
import {
    getAllCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    addCredential,
    updateCredential,
    deleteCredential
} from '../controllers/customerController.js';
import {
    bulkUploadCustomers,
    downloadBulkUploadTemplate
} from '../controllers/bulkUploadController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// All routes require authentication
router.use(authMiddleware);

// Get all customers
router.get('/', requireRole('admin', 'maker', 'checker'), getAllCustomers);

// Download bulk upload template
router.get('/bulk-upload/template', requireRole('admin', 'maker'), downloadBulkUploadTemplate);

// Get customer by ID
router.get('/:id', requireRole('admin', 'maker', 'checker'), getCustomerById);

// Create customer (maker only)
router.post('/', requireRole('admin', 'maker'), createCustomer);

// Bulk upload customers (maker/admin)
router.post('/bulk-upload', requireRole('admin', 'maker'), upload.single('file'), bulkUploadCustomers);

// Update customer
router.put('/:id', requireRole('admin', 'maker', 'checker'), updateCustomer);

// Delete customer (admin only)
router.delete('/:id', requireRole('admin'), deleteCustomer);

// Credential Routes
router.post('/:id/credentials', requireRole('admin', 'maker'), addCredential);
router.put('/:id/credentials/:credentialId', requireRole('admin', 'maker'), updateCredential);
router.delete('/:id/credentials/:credentialId', requireRole('admin', 'maker'), deleteCredential);

export default router;
