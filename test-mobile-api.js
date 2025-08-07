#!/usr/bin/env node

/**
 * Velink Mobile API Test Script
 * 
 * This script tests all mobile API endpoints to ensure they work correctly.
 * Run this script to verify that the mobile API is functioning properly.
 */

const BASE_URL = process.env.VELINK_URL || 'http://localhost:3002';
const API_BASE = `${BASE_URL}/api/mobile`;

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  const data = await response.json();
  
  console.log(`\n📡 ${options.method || 'GET'} ${endpoint}`);
  console.log(`Status: ${response.status} ${response.statusText}`);
  
  if (data.success) {
    console.log('✅ Success:', data.message || 'OK');
    if (data.data) {
      console.log('📊 Data:', JSON.stringify(data.data, null, 2));
    }
  } else {
    console.log('❌ Error:', data.error);
    console.log('🔍 Code:', data.code);
  }
  
  return data;
}

async function runTests() {
  console.log('🚀 Starting Velink Mobile API Tests');
  console.log('=====================================');
  
  try {
    // Test 1: Health Check
    console.log('\n🔍 Test 1: Health Check');
    await apiRequest('/health');
    
    // Test 2: Get Basic Stats
    console.log('\n🔍 Test 2: Get Basic Stats');
    await apiRequest('/stats');
    
    // Test 3: Shorten URL
    console.log('\n🔍 Test 3: Shorten URL');
    const shortenResult = await apiRequest('/shorten', {
      method: 'POST',
      body: JSON.stringify({
        url: 'https://example.com/test-page',
        description: 'Test page for mobile API'
      })
    });
    
    let shortCode = null;
    if (shortenResult.success) {
      shortCode = shortenResult.data.shortCode;
    }
    
    // Test 4: Shorten URL with Custom Alias
    console.log('\n🔍 Test 4: Shorten URL with Custom Alias');
    await apiRequest('/shorten', {
      method: 'POST',
      body: JSON.stringify({
        url: 'https://github.com/velyzo/velink',
        customAlias: 'velink-repo',
        description: 'Velink GitHub Repository',
        expiresIn: '30d'
      })
    });
    
    // Test 5: Get URL Info
    if (shortCode) {
      console.log('\n🔍 Test 5: Get URL Info');
      await apiRequest(`/info/${shortCode}`);
    }
    
    // Test 6: Batch Shorten URLs
    console.log('\n🔍 Test 6: Batch Shorten URLs');
    const batchResult = await apiRequest('/batch-shorten', {
      method: 'POST',
      body: JSON.stringify({
        urls: [
          'https://google.com',
          'https://stackoverflow.com',
          'https://developer.mozilla.org'
        ],
        expiresIn: '7d'
      })
    });
    
    // Test 7: Get Analytics
    if (shortCode) {
      console.log('\n🔍 Test 7: Get Analytics');
      await apiRequest(`/analytics/${shortCode}`);
    }
    
    // Test 8: Get QR Code Data
    if (shortCode) {
      console.log('\n🔍 Test 8: Get QR Code Data');
      await apiRequest(`/qr/${shortCode}?size=300&format=png`);
    }
    
    // Test 9: Search Links
    console.log('\n🔍 Test 9: Search Links');
    await apiRequest('/search?q=example&limit=10');
    
    // Test 10: Test Password-Protected Link
    console.log('\n🔍 Test 10: Create Password-Protected Link');
    const protectedResult = await apiRequest('/shorten', {
      method: 'POST',
      body: JSON.stringify({
        url: 'https://secret.example.com',
        description: 'Secret protected link',
        customOptions: {
          password: 'test123'
        }
      })
    });
    
    if (protectedResult.success) {
      const protectedShortCode = protectedResult.data.shortCode;
      
      // Test 11: Verify Password (Wrong Password)
      console.log('\n🔍 Test 11: Verify Password (Wrong Password)');
      await apiRequest(`/verify-password/${protectedShortCode}`, {
        method: 'POST',
        body: JSON.stringify({
          password: 'wrongpassword'
        })
      });
      
      // Test 12: Verify Password (Correct Password)
      console.log('\n🔍 Test 12: Verify Password (Correct Password)');
      await apiRequest(`/verify-password/${protectedShortCode}`, {
        method: 'POST',
        body: JSON.stringify({
          password: 'test123'
        })
      });
    }
    
    console.log('\n🎉 All tests completed!');
    console.log('=====================================');
    
  } catch (error) {
    console.error('\n💥 Test failed with error:', error.message);
    process.exit(1);
  }
}

// Run the tests if this script is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests, apiRequest };
