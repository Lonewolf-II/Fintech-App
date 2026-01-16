import { Op } from 'sequelize';
import { Account } from '../models/index.js';

/**
 * Generate numeric account number for customer accounts
 * Format: 3001XXXXXXXXX (13 digits total)
 * @returns {Promise<string>} Generated account number
 */
export const generateCustomerAccountNumber = async () => {
    const prefix = '3001';

    // Find the latest account number with this prefix
    const latestAccount = await Account.findOne({
        where: {
            accountNumber: {
                [Op.like]: `${prefix}%`
            }
        },
        order: [['accountNumber', 'DESC']],
        attributes: ['accountNumber']
    });

    let sequence = 1;
    if (latestAccount && latestAccount.accountNumber) {
        // Extract the last 9 digits and increment
        const lastSequence = parseInt(latestAccount.accountNumber.slice(4));
        if (!isNaN(lastSequence)) {
            sequence = lastSequence + 1;
        }
    }

    // Pad to 9 digits
    const paddedSequence = sequence.toString().padStart(9, '0');
    return `${prefix}${paddedSequence}`;
};

/**
 * Generate short name for account
 * Format: {FirstName}-{Last3Digits}
 * @param {string} fullName - Customer's full name
 * @param {string} accountNumber - Generated account number
 * @returns {string} Short name
 */
export const generateAccountShortName = (fullName, accountNumber) => {
    const firstName = fullName.split(' ')[0].toUpperCase();
    const last3Digits = accountNumber.slice(-3);
    return `${firstName}-${last3Digits}`;
};

/**
 * Validate email format
 * @param {string} email 
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate phone number (Nepal format: 98XXXXXXXX)
 * @param {string} phone 
 * @returns {boolean}
 */
export const isValidPhone = (phone) => {
    const phoneRegex = /^98[0-9]{8}$/;
    return phoneRegex.test(phone);
};

/**
 * Validate date format (YYYY-MM-DD)
 * @param {string} dateString 
 * @returns {boolean}
 */
export const isValidDate = (dateString) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) return false;

    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
};

/**
 * Check if customer is at least 18 years old
 * @param {string} dateOfBirth - Date in YYYY-MM-DD format
 * @returns {boolean}
 */
export const isAtLeast18YearsOld = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= 18;
    }

    return age >= 18;
};

/**
 * Validate CSV row for bulk customer upload
 * Expected format: Customer Name, Mobile Number, Email, Date of Birth, Bank Name
 * @param {Object} row - CSV row object
 * @param {number} rowIndex - Row number for error reporting
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export const validateCustomerRow = (row, rowIndex) => {
    const errors = [];

    // Check required fields
    if (!row['Customer Name'] || row['Customer Name'].trim() === '') {
        errors.push(`Row ${rowIndex}: Customer Name is required`);
    } else if (row['Customer Name'].trim().length < 2) {
        errors.push(`Row ${rowIndex}: Customer Name must be at least 2 characters`);
    }

    if (!row['Mobile Number'] || row['Mobile Number'].trim() === '') {
        errors.push(`Row ${rowIndex}: Mobile Number is required`);
    } else if (!isValidPhone(row['Mobile Number'].trim())) {
        errors.push(`Row ${rowIndex}: Invalid mobile number format. Must be 10 digits starting with 98`);
    }

    if (!row['Email'] || row['Email'].trim() === '') {
        errors.push(`Row ${rowIndex}: Email is required`);
    } else if (!isValidEmail(row['Email'].trim())) {
        errors.push(`Row ${rowIndex}: Invalid email format`);
    }

    if (!row['Date of Birth'] || row['Date of Birth'].trim() === '') {
        errors.push(`Row ${rowIndex}: Date of Birth is required`);
    } else if (!isValidDate(row['Date of Birth'].trim())) {
        errors.push(`Row ${rowIndex}: Invalid date format. Use YYYY-MM-DD`);
    } else if (!isAtLeast18YearsOld(row['Date of Birth'].trim())) {
        errors.push(`Row ${rowIndex}: Customer must be at least 18 years old`);
    }

    if (!row['Bank Name'] || row['Bank Name'].trim() === '') {
        errors.push(`Row ${rowIndex}: Bank Name is required`);
    }

    return {
        valid: errors.length === 0,
        errors
    };
};
