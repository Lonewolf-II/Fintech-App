// Simple test to call the API and see the actual error
import axios from 'axios';

const testAPI = async () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkB5b3VyY29tcGFueS5jb20iLCJyb2xlIjoib3duZXIiLCJpYXQiOjE3Njg0ODE1ODgsImV4cCI6MTc2ODU2Nzk4OH0.-0f3MD9C819RHi6iF53nnrJW0ms3l2SWwF4HrqZtieQ';

    try {
        console.log('Testing GET /api/tenants...');
        const response = await axios.get('http://localhost:4000/api/tenants', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Success!');
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('❌ Error:', error.response?.status, error.response?.statusText);
        console.error('Error data:', error.response?.data);
        console.error('Full error:', error.message);
    }

    try {
        console.log('\nTesting GET /api/auth/me...');
        const response = await axios.get('http://localhost:4000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Success!');
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('❌ Error:', error.response?.status, error.response?.statusText);
        console.error('Error data:', error.response?.data);
        console.error('Full error:', error.message);
    }
};

testAPI();
