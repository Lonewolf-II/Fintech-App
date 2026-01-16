import { Customer, Account, Portfolio, sequelize } from '../models/index.js';
import { Op } from 'sequelize';
import csv from 'csv-parser';
import fs from 'fs';
import {
    generateCustomerAccountNumber,
    generateAccountShortName,
    validateCustomerRow
} from '../utils/accountHelpers.js';

/**
 * Bulk upload customers from CSV file
 * CSV Format: Customer Name, Mobile Number, Email, Date of Birth, Bank Name
 * POST /api/customers/bulk-upload
 */
export const bulkUploadCustomers = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const results = [];
    const successRecords = [];
    const failedRecords = [];

    try {
        // Read and parse CSV
        await new Promise((resolve, reject) => {
            fs.createReadStream(req.file.path)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', resolve)
                .on('error', reject);
        });

        // Determine starting Customer ID
        const prefix = '2026';
        const latestCustomer = await Customer.findOne({
            where: {
                customerId: { [Op.like]: `${prefix}%` }
            },
            order: [['customerId', 'DESC']],
            attributes: ['customerId']
        });

        let currentIdCounter = BigInt(2026000000); // Base
        if (latestCustomer && latestCustomer.customerId) {
            const latestVal = BigInt(latestCustomer.customerId);
            // Ensure we are at least at the base
            if (latestVal > currentIdCounter) {
                currentIdCounter = latestVal;
            }
        }

        // Process each row
        for (let i = 0; i < results.length; i++) {
            const row = results[i];
            const rowIndex = i + 2; // +2 because row 1 is header, array is 0-indexed

            // Validate row
            const validation = validateCustomerRow(row, rowIndex);
            if (!validation.valid) {
                // ... error handling
                failedRecords.push({
                    row: rowIndex,
                    data: row,
                    errors: validation.errors
                });
                continue;
            }

            // Increment ID for this row
            currentIdCounter++;
            const customerId = currentIdCounter.toString();

            const transaction = await sequelize.transaction();
            try {
                // Create customer
                const customer = await Customer.create({
                    customerId,
                    fullName: row['Customer Name'].trim(),
                    email: row['Email'].trim().toLowerCase(),
                    phone: row['Mobile Number'].trim(),
                    dateOfBirth: row['Date of Birth'].trim(),
                    // ... other fields
                    accountType: 'individual',
                    kycStatus: 'pending',
                    createdBy: req.user.id,
                    accountOpeningDate: new Date()
                }, { transaction });

                // Check if account number is provided in CSV
                let accountNumber = row['Account Number'] ? row['Account Number'].trim() : null;
                let account = null;

                // Only create account if account number is provided
                if (accountNumber) {
                    // Validate if provided account number already exists
                    const existingAccount = await Account.findOne({ where: { accountNumber } });
                    if (existingAccount) {
                        throw new Error(`Account Number ${accountNumber} already exists`);
                    }

                    // Generate account name and short name
                    const accountName = `${row['Customer Name'].trim()} - ${row['Bank Name']?.trim() || 'Bank'}`;
                    const shortName = generateAccountShortName(row['Customer Name'].trim(), accountNumber);

                    // Create account
                    account = await Account.create({
                        accountNumber,
                        accountName,
                        shortName,
                        bankName: row['Bank Name']?.trim(),
                        branch: row['Branch Name']?.trim() || 'Main Branch', // Default if not provided
                        customerId: customer.id,
                        accountType: 'savings',
                        balance: 0.00,
                        blockedAmount: 0.00,
                        isPrimary: true,
                        status: 'active',
                        openingDate: new Date()
                    }, { transaction });
                }

                // Create empty portfolio
                await Portfolio.create({
                    portfolioId: `PORT-${customer.id}-${Date.now()}`,
                    customerId: customer.id,
                    totalValue: 0.00,
                    totalInvestment: 0.00,
                    profitLoss: 0.00
                }, { transaction });

                await transaction.commit();

                successRecords.push({
                    row: rowIndex,
                    customerId: customer.customerId,
                    customerName: customer.fullName,
                    accountNumber: account ? account.accountNumber : 'Not Created',
                    accountName: account ? account.accountName : '-',
                    shortName: account ? account.shortName : '-',
                    branch: account ? account.branch : '-'
                });

            } catch (error) {
                await transaction.rollback();
                console.error(`Error creating customer at row ${rowIndex}:`, error);

                failedRecords.push({
                    row: rowIndex,
                    data: row,
                    errors: [error.message]
                });
            }
        }

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        // Return results
        res.json({
            message: `Processed ${results.length} rows`,
            summary: {
                total: results.length,
                successful: successRecords.length,
                failed: failedRecords.length
            },
            successRecords,
            failedRecords: failedRecords.length > 0 ? failedRecords : undefined
        });

    } catch (error) {
        // Clean up file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        console.error('Bulk upload error:', error);
        res.status(500).json({
            error: 'Failed to process bulk upload',
            details: error.message
        });
    }
};

/**
 * Download CSV template for bulk upload
 * GET /api/customers/bulk-upload/template
 */
export const downloadBulkUploadTemplate = async (req, res) => {
    const csvContent = `Customer Name,Mobile Number,Email,Date of Birth,Bank Name,Branch Name,Account Number
Ram Kumar Sharma,9801234567,ram.sharma@example.com,1990-05-15,Nepal Bank Limited,Kathmandu Branch,01000123456789
Sita Devi Poudel,9841234567,sita.poudel@example.com,1985-08-20,Rastriya Banijya Bank,Lalitpur Branch,
Hari Prasad Thapa,9851234567,hari.thapa@example.com,1995-02-10,Nabil Bank,Pokhara Branch,02000123456789`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=bulk_customer_upload_template.csv');
    res.send(csvContent);
};
