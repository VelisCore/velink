// Test script for admin update endpoints
const https = require('https');
const http = require('http');

const BASE_URL = 'https://velink.me';
const ADMIN_TOKEN = 'velink-admin-2025-secure-token-v2'; // Use the token from server .env

function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const isHttps = urlObj.protocol === 'https:';
        const client = isHttps ? https : http;
        
        const reqOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || (isHttps ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: options.headers || {}
        };

        const req = client.request(reqOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ status: res.statusCode, data: jsonData });
                } catch (error) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (options.body) {
            req.write(options.body);
        }

        req.end();
    });
}

async function testAdminEndpoints() {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_TOKEN}`
    };

    console.log('🔍 Testing Admin Update Manager Endpoints...\n');

    try {
        // Test admin verification
        console.log('1. Testing admin verification...');
        console.log('   Using token:', ADMIN_TOKEN);
        const verifyResult = await makeRequest(`${BASE_URL}/api/admin/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: ADMIN_TOKEN })
        });
        console.log('   Status:', verifyResult.status);
        console.log('   Result:', verifyResult.data);
        console.log('');

        // Test health check
        console.log('2. Testing health check...');
        const healthResult = await makeRequest(`${BASE_URL}/api/health`);
        console.log('   Status:', healthResult.status);
        console.log('   Result:', healthResult.data);
        console.log('');

        // Test update check
        console.log('3. Testing update check...');
        const updateResult = await makeRequest(`${BASE_URL}/api/admin/update/check`, {
            headers
        });
        console.log('   Status:', updateResult.status);
        console.log('   Result:', updateResult.data);
        console.log('');

        // Test update status
        console.log('4. Testing update status...');
        const statusResult = await makeRequest(`${BASE_URL}/api/admin/update/status`, {
            headers
        });
        console.log('   Status:', statusResult.status);
        console.log('   Result:', statusResult.data);
        console.log('');

        // Test backups
        console.log('5. Testing backup list...');
        const backupsResult = await makeRequest(`${BASE_URL}/api/admin/update/backups`, {
            headers
        });
        console.log('   Status:', backupsResult.status);
        console.log('   Result:', backupsResult.data);
        console.log('');

        // Test admin links
        console.log('6. Testing admin links...');
        const linksResult = await makeRequest(`${BASE_URL}/api/admin/links?page=1&limit=5`, {
            headers
        });
        console.log('   Status:', linksResult.status);
        console.log('   Result:', linksResult.data);
        console.log('');

        console.log('✅ All tests completed!');
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testAdminEndpoints();
