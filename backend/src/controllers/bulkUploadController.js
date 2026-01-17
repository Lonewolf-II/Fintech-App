import { Customer, Account, Portfolio, sequelize } from '../models/index.js';
import { Op } from 'sequelize';
import csv from 'csv-parser';
import fs from 'fs';
import {
    generateCustomerAccountNumber,
    generateAccountShortName,
    validateCustomerRow,
    isAtLeast18YearsOld
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
            const rawRow = results[i];
            const rowIndex = i + 2; // +2 because row 1 is header, array is 0-indexed

            // Normalize row data - trim all keys and values, handle BOM
            const row = {};
            Object.keys(rawRow).forEach(key => {
                // Remove BOM and trim whitespace from keys
                const cleanKey = key.replace(/^\uFEFF/, '').trim();
                // Trim values
                const cleanValue = typeof rawRow[key] === 'string' ? rawRow[key].trim() : rawRow[key];
                row[cleanKey] = cleanValue;
            });

            // Log the row for debugging
            console.log(`\n📋 Processing row ${rowIndex}:`, {
                'Customer Name': row['Customer Name'],
                'Mobile Number': row['Mobile Number'],
                'Email': row['Email'],
                'Date of Birth': row['Date of Birth']
            });

            // Validate row
            const validation = validateCustomerRow(row, rowIndex);
            if (!validation.valid) {
                // Log validation errors for debugging
                console.error(`❌ Validation failed for row ${rowIndex}:`, validation.errors);
                console.error(`   Raw data:`, rawRow);
                console.error(`   Cleaned data:`, row);

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
                    fullName: row['Customer Name'],
                    email: row['Email'].toLowerCase(),
                    phone: row['Mobile Number'],
                    dateOfBirth: row['Date of Birth'],
                    // ... other fields
                    accountType: 'individual',
                    kycStatus: 'pending',
                    createdBy: req.user.id,
                    accountOpeningDate: new Date()
                }, { transaction });

                // Check if account number is provided in CSV
                let accountNumber = row['Account Number'] || null;
                let account = null;

                // Determine if customer is major or minor
                const isMajor = isAtLeast18YearsOld(row['Date of Birth']);
                const accountCategory = isMajor ? 'major' : 'minor';

                // Only create account if account number is provided
                if (accountNumber) {
                    // Validate if provided account number already exists
                    const existingAccount = await Account.findOne({ where: { accountNumber } });
                    if (existingAccount) {
                        throw new Error(`Account Number ${accountNumber} already exists`);
                    }

                    // Generate account name and short name
                    const accountName = `${row['Customer Name']} - ${row['Bank Name'] || 'Bank'}`;
                    const shortName = generateAccountShortName(row['Customer Name'], accountNumber);

                    // Create account with category
                    account = await Account.create({
                        accountNumber,
                        accountName,
                        shortName,
                        bankName: row['Bank Name'] || null,
                        branch: row['Branch Name'] || 'Main Branch',
                        customerId: customer.id,
                        accountType: 'savings',
                        accountCategory: accountCategory,
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

                console.log(`✅ Created customer ${rowIndex}: ${customer.fullName} (${customer.customerId})`);

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

        // Fetch all created customers with their accounts
        const createdCustomerIds = successRecords.map(r => r.customerId);
        const createdCustomers = await Customer.findAll({
            where: { customerId: { [Op.in]: createdCustomerIds } },
            include: [
                { association: 'accounts' },
                { association: 'creator', attributes: ['name'] }
            ]
        });

        // Log summary
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📊 BULK UPLOAD SUMMARY`);
        console.log(`${'='.repeat(60)}`);
        console.log(`✅ Successfully created: ${successRecords.length} customers`);
        console.log(`❌ Failed: ${failedRecords.length} rows`);
        console.log(`📋 Total processed: ${results.length} rows`);
        if (failedRecords.length > 0) {
            console.log(`\n❌ Failed rows:`);
            failedRecords.forEach(f => {
                console.log(`   Row ${f.row}: ${f.errors.join(', ')}`);
            });
        }
        console.log(`${'='.repeat(60)}\n`);

        // Return results
        res.json({
            message: `Processed ${results.length} rows`,
            summary: {
                total: results.length,
                successful: successRecords.length,
                failed: failedRecords.length
            },
            createdCount: successRecords.length,
            createdCustomers: createdCustomers,
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
