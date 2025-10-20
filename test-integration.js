#!/usr/bin/env node

/**
 * Quick Integration Test Script
 * Tests the Node.js + Django JWT integration
 * 
 * Usage:
 *   node test-integration.js <JWT_TOKEN>
 * 
 * Or set TOKEN environment variable:
 *   TOKEN=<your-jwt-token> node test-integration.js
 * 
 * To get a token from Django:
 *   curl -X POST http://localhost:8000/api/v1/login \
 *     -H "Content-Type: application/json" \
 *     -d '{"username":"testuser","password":"testpass"}'
 */

const http = require('http');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TOKEN = process.argv[2] || process.env.TOKEN;

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(method, path, data = null, useAuth = false) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (useAuth && TOKEN) {
      options.headers['Authorization'] = `Bearer ${TOKEN}`;
    }

    if (data) {
      const body = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: jsonBody
          });
        } catch (err) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function runTests() {
  log('\n🧪 Starting Integration Tests\n', 'cyan');
  log(`Base URL: ${BASE_URL}`, 'blue');
  log(`Token: ${TOKEN ? '✓ Provided' : '✗ Not provided (auth tests will be skipped)'}\n`, TOKEN ? 'green' : 'yellow');

  let passedTests = 0;
  let failedTests = 0;
  let createdOpportunityId = null;

  // Test 1: Health Check
  try {
    log('Test 1: Health Check...', 'blue');
    const res = await makeRequest('GET', '/health');
    if (res.status === 200 && res.body.status === 'OK') {
      log('✓ Health check passed', 'green');
      passedTests++;
    } else {
      log(`✗ Health check failed: ${res.status}`, 'red');
      failedTests++;
    }
  } catch (err) {
    log(`✗ Health check error: ${err.message}`, 'red');
    failedTests++;
  }

  // Test 2: API Info
  try {
    log('\nTest 2: API Info Endpoint...', 'blue');
    const res = await makeRequest('GET', '/api/v1/');
    if (res.status === 200 && res.body.message) {
      log('✓ API info retrieved', 'green');
      passedTests++;
    } else {
      log(`✗ API info failed: ${res.status}`, 'red');
      failedTests++;
    }
  } catch (err) {
    log(`✗ API info error: ${err.message}`, 'red');
    failedTests++;
  }

  // Test 3: Get All Opportunities (Public)
  try {
    log('\nTest 3: Get All Opportunities (Public)...', 'blue');
    const res = await makeRequest('GET', '/api/v1/opportunities');
    if (res.status === 200 && Array.isArray(res.body.data)) {
      log(`✓ Retrieved ${res.body.data.length} opportunities`, 'green');
      passedTests++;
    } else {
      log(`✗ Get opportunities failed: ${res.status}`, 'red');
      failedTests++;
    }
  } catch (err) {
    log(`✗ Get opportunities error: ${err.message}`, 'red');
    failedTests++;
  }

  // Test 4: Search Opportunities (Public)
  try {
    log('\nTest 4: Search Opportunities...', 'blue');
    const res = await makeRequest('GET', '/api/v1/opportunities/search?category=INTERNSHIP');
    if (res.status === 200 && Array.isArray(res.body.data)) {
      log(`✓ Search returned ${res.body.data.length} results`, 'green');
      passedTests++;
    } else {
      log(`✗ Search failed: ${res.status}`, 'red');
      failedTests++;
    }
  } catch (err) {
    log(`✗ Search error: ${err.message}`, 'red');
    failedTests++;
  }

  if (!TOKEN) {
    log('\n⚠️  Skipping protected endpoint tests (no token provided)', 'yellow');
    log('\nRun with: node test-integration.js <YOUR_JWT_TOKEN>', 'yellow');
  } else {
    // Test 5: Create Opportunity (Protected)
    try {
      log('\nTest 5: Create Opportunity (Auth Required)...', 'blue');
      const testData = {
        title: 'Integration Test Opportunity',
        description: 'This is a test opportunity created by the integration test script',
        category: 'INTERNSHIP',
        location: 'Lagos, Nigeria',
        isRemote: false,
        deadline: '2025-12-31'
      };
      const res = await makeRequest('POST', '/api/v1/opportunities', testData, true);
      if (res.status === 201 && res.body.id) {
        createdOpportunityId = res.body.id;
        log(`✓ Opportunity created: ${res.body.id}`, 'green');
        log(`  Created by: ${res.body.createdBy}`, 'cyan');
        passedTests++;
      } else {
        log(`✗ Create opportunity failed: ${res.status}`, 'red');
        if (res.body.error) log(`  Error: ${res.body.error}`, 'red');
        failedTests++;
      }
    } catch (err) {
      log(`✗ Create opportunity error: ${err.message}`, 'red');
      failedTests++;
    }

    // Test 6: Update Opportunity (Protected, Owner Only)
    if (createdOpportunityId) {
      try {
        log('\nTest 6: Update Opportunity (Owner)...', 'blue');
        const updateData = {
          title: 'Updated Integration Test Opportunity',
          isRemote: true
        };
        const res = await makeRequest('PUT', `/api/v1/opportunities/${createdOpportunityId}`, updateData, true);
        if (res.status === 200 && res.body.title === updateData.title) {
          log('✓ Opportunity updated successfully', 'green');
          passedTests++;
        } else {
          log(`✗ Update opportunity failed: ${res.status}`, 'red');
          if (res.body.error) log(`  Error: ${res.body.error}`, 'red');
          failedTests++;
        }
      } catch (err) {
        log(`✗ Update opportunity error: ${err.message}`, 'red');
        failedTests++;
      }

      // Test 7: Delete Opportunity (Protected, Owner Only)
      try {
        log('\nTest 7: Delete Opportunity (Owner)...', 'blue');
        const res = await makeRequest('DELETE', `/api/v1/opportunities/${createdOpportunityId}`, null, true);
        if (res.status === 200) {
          log('✓ Opportunity deleted successfully', 'green');
          passedTests++;
        } else {
          log(`✗ Delete opportunity failed: ${res.status}`, 'red');
          if (res.body.error) log(`  Error: ${res.body.error}`, 'red');
          failedTests++;
        }
      } catch (err) {
        log(`✗ Delete opportunity error: ${err.message}`, 'red');
        failedTests++;
      }
    }

    // Test 8: Unauthorized Access
    try {
      log('\nTest 8: Unauthorized Access (Invalid Token)...', 'blue');
      const testData = {
        title: 'Should Fail',
        description: 'This should not be created',
        category: 'INTERNSHIP'
      };
      // Temporarily modify makeRequest to use invalid token
      const res = await new Promise((resolve, reject) => {
        const url = new URL('/api/v1/opportunities', BASE_URL);
        const options = {
          method: 'POST',
          hostname: url.hostname,
          port: url.port || 80,
          path: url.pathname,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer invalid-token-12345'
          }
        };
        const body = JSON.stringify(testData);
        options.headers['Content-Length'] = Buffer.byteLength(body);
        
        const req = http.request(options, (res) => {
          let responseBody = '';
          res.on('data', chunk => responseBody += chunk);
          res.on('end', () => {
            resolve({
              status: res.statusCode,
              body: responseBody ? JSON.parse(responseBody) : {}
            });
          });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
      });

      if (res.status === 401) {
        log('✓ Correctly rejected invalid token', 'green');
        passedTests++;
      } else {
        log(`✗ Should have rejected invalid token but got: ${res.status}`, 'red');
        failedTests++;
      }
    } catch (err) {
      log(`✗ Unauthorized test error: ${err.message}`, 'red');
      failedTests++;
    }
  }

  // Summary
  log('\n' + '='.repeat(50), 'cyan');
  log('Test Summary:', 'cyan');
  log(`Total Tests: ${passedTests + failedTests}`, 'blue');
  log(`Passed: ${passedTests}`, 'green');
  log(`Failed: ${failedTests}`, failedTests > 0 ? 'red' : 'green');
  log('='.repeat(50) + '\n', 'cyan');

  if (failedTests === 0) {
    log('🎉 All tests passed! Integration is working correctly.', 'green');
    process.exit(0);
  } else {
    log('❌ Some tests failed. Please check the errors above.', 'red');
    process.exit(1);
  }
}

// Run tests
runTests().catch(err => {
  log(`\n❌ Fatal error: ${err.message}`, 'red');
  process.exit(1);
});
