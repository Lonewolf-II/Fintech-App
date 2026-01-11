import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../.env') });

const PORT = process.env.PORT || 5001;
const API_URL = `http://localhost:${PORT}/api`;

const verifyTransaction = async () => {
    try {
        console.log('Logging in as maker...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'maker@fintech.com',
            password: '123456'
            // 001_init_schema says maker password hash is for 'admin123' (same as admin)
        }, {
            headers: { 'X-Tenant-Key': 'demo' }
        });

        const token = loginRes.data.token;
        console.log('Login successful.');

        // 1. Get an account to transact on
        // Ideally we need an account number. Let's create a customer first or find one.
        // For simplicity, let's try to find an account if there's an endpoint, or just guess one if we know seed data.
        // Seed data in 001_init_schema doesn't insert accounts?? 
        // 001_init_schema only inserts users.
        // manual_sync.js created an account: ACC-MANUAL-<timestamp>

        // Let's rely on finding a customer first? Or just try to hit the deposit endpoint with a dummy account and see if we get 404 or 500.
        // If we get 500 even with invalid account, that's a clue.
        // But better to have a valid account. 

        // Let's create a customer and account first to be sure.
        console.log('Creating generic customer for test...');
        const custRes = await axios.post(`${API_URL}/customers`, {
            fullName: 'Trans Test',
            email: `trans_${Date.now()}@test.com`,
            phone: '9800000000',
            accountType: 'individual',
            accountNumber: `TEST-ACC-${Date.now()}` // Manual account number
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
                'X-Tenant-Key': 'demo'
            }
        });

        const account = custRes.data.accounts?.[0]; // If response returns accounts
        // If not, we might need to fetch customer details.

        // Actually, createCustomer controller returns the customer object. 
        // Does it include accounts? createCustomer calls Customer.create then Account.create. 
        // It returns `res.status(201).json(customer)`. It does NOT reload with include accounts unless specified.

        const accountNumber = `TEST-ACC-${Date.now()}`;
        console.log('Creating generic customer with Account:', accountNumber);

        // 2 Create Customer. The controller will create an account with this number.
        await axios.post(`${API_URL}/customers`, {
            fullName: 'Trans Test',
            email: `trans_${Date.now()}@test.com`,
            phone: '9800000000',
            accountType: 'individual',
            accountNumber: accountNumber,
            accountName: 'Trans Test Account',
            bankName: 'Test Bank',
            branch: 'Test Branch'
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
                'X-Tenant-Key': 'demo'
            }
        });

        console.log('Customer and Account created.');

        // 3. Perform Deposit
        // Frontend logic mimics: lookup ID first
        console.log('Fetching accounts to resolve ID...');
        const accountsRes = await axios.get(`${API_URL}/banking/accounts`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'X-Tenant-Key': 'demo'
            }
        });

        const accounts = accountsRes.data;
        const targetAccount = accounts.find(a => a.accountNumber === accountNumber);

        if (!targetAccount) {
            throw new Error('Account created but not found in list!');
        }

        const accountId = targetAccount.id;
        console.log('Resolved Account ID:', accountId);

        console.log('Attempting Deposit...');
        const depositRes = await axios.post(`${API_URL}/banking/transactions`, {
            accountId: accountId,
            transactionType: 'deposit',
            amount: 500,
            description: 'Test Deposit'
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
                'X-Tenant-Key': 'demo'
            }
        });

        console.log('Deposit successful:', depositRes.data);

    } catch (error) {
        console.error('Error verifying transaction:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Message:', error.message);
        }
    }
};

verifyTransaction();
