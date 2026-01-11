import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../.env') });


const PORT = process.env.PORT || 5001;
const API_URL = `http://localhost:${PORT}/api`;
console.log(`Using API URL: ${API_URL}`);

const verifyChecker = async () => {
    // Health check
    try {
        await axios.get('http://localhost:5000/health');
        console.log('Health check passed.');
    } catch (e) { console.log('Health check warning:', e.message); }

    try {
        console.log('Logging in as checker...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'checker@fintech.com',
            password: '123456'
        }, {
            headers: { 'X-Tenant-Key': 'demo' }
        });

        const token = loginRes.data.token;
        console.log('Login successful. Token:', token.substring(0, 20) + '...');

        console.log('Fetching pending requests...');
        const requestsRes = await axios.get(`${API_URL}/checker/requests`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'X-Tenant-Key': 'demo'
            }
        });

        console.log('Requests fetched successfully:', requestsRes.status);
        console.log('Data:', JSON.stringify(requestsRes.data, null, 2));

    } catch (error) {
        console.error('Error verifying checker:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Message:', error.message);
        }
    }
};

verifyChecker();
