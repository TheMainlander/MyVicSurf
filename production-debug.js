#!/usr/bin/env node

/**
 * Production Debug Script for VicSurf
 * Run this to check production deployment health and debug issues
 */

const https = require('https');
const http = require('http');

// Configuration
const PRODUCTION_URL = process.env.REPL_SLUG ? 
  `https://${process.env.REPL_SLUG}.${process.env.REPLIT_DOMAINS.split(',')[0]}` : 
  'https://your-app-name.replit.app';

console.log('🚀 VicSurf Production Debug Tool');
console.log('================================\n');

async function makeRequest(url, useHttps = true) {
  return new Promise((resolve, reject) => {
    const client = useHttps ? https : http;
    const options = {
      timeout: 10000,
      headers: {
        'User-Agent': 'VicSurf-Debug/1.0'
      }
    };

    const req = client.get(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          url: url
        });
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.on('error', (err) => {
      reject(err);
    });
  });
}

async function checkHealth() {
  console.log('1. Checking Health Endpoint...');
  
  try {
    const healthUrl = `${PRODUCTION_URL}/api/health`;
    console.log(`   GET ${healthUrl}`);
    
    const response = await makeRequest(healthUrl);
    
    console.log(`   Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      const health = JSON.parse(response.body);
      console.log('   ✅ Health Check Passed');
      console.log(`   📊 Database: ${health.database}`);
      console.log(`   🔒 HTTPS: ${health.https}`);
      console.log(`   🌍 Environment: ${health.environment}`);
      console.log(`   📍 Surf Spots: ${health.spotsCount}`);
      return true;
    } else {
      console.log('   ❌ Health Check Failed');
      console.log(`   Response: ${response.body.substring(0, 200)}`);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Health Check Error');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function checkFrontend() {
  console.log('\n2. Checking Frontend...');
  
  try {
    const response = await makeRequest(PRODUCTION_URL);
    
    console.log(`   Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log('   ✅ Frontend Loading');
      
      // Check if it's the actual app or an error page
      if (response.body.includes('VicSurf') && response.body.includes('Victoria Surf')) {
        console.log('   ✅ VicSurf App Detected');
        return true;
      } else {
        console.log('   ⚠️  Frontend loaded but may not be VicSurf app');
        console.log(`   Content Preview: ${response.body.substring(0, 100)}...`);
        return false;
      }
    } else {
      console.log('   ❌ Frontend Failed');
      console.log(`   Response: ${response.body.substring(0, 200)}`);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Frontend Error');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function checkAPI() {
  console.log('\n3. Checking API Endpoints...');
  
  const endpoints = [
    '/api/surf-spots',
    '/api/carousel-images',
    '/api/auth/user'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`   Testing ${endpoint}...`);
      const response = await makeRequest(`${PRODUCTION_URL}${endpoint}`);
      
      if (response.statusCode === 200 || response.statusCode === 401) {
        console.log(`   ✅ ${endpoint} (${response.statusCode})`);
      } else {
        console.log(`   ❌ ${endpoint} (${response.statusCode})`);
        console.log(`      Response: ${response.body.substring(0, 100)}`);
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint} - ${error.message}`);
    }
  }
}

async function checkSSL() {
  console.log('\n4. Checking SSL Certificate...');
  
  try {
    const response = await makeRequest(PRODUCTION_URL);
    console.log('   ✅ SSL Certificate Valid');
    
    // Check if HTTPS redirect works
    try {
      const httpUrl = PRODUCTION_URL.replace('https://', 'http://');
      const httpResponse = await makeRequest(httpUrl, false);
      
      if (httpResponse.statusCode === 301 || httpResponse.statusCode === 302) {
        console.log('   ✅ HTTP to HTTPS Redirect Working');
      } else {
        console.log('   ⚠️  HTTP to HTTPS Redirect May Not Be Working');
      }
    } catch (error) {
      console.log('   ⚠️  Could not test HTTP redirect');
    }
    
  } catch (error) {
    console.log('   ❌ SSL Certificate Issue');
    console.log(`   Error: ${error.message}`);
  }
}

async function main() {
  console.log(`Target URL: ${PRODUCTION_URL}\n`);
  
  const healthOk = await checkHealth();
  const frontendOk = await checkFrontend();
  
  await checkAPI();
  await checkSSL();
  
  console.log('\n📋 Summary:');
  console.log('===========');
  
  if (healthOk && frontendOk) {
    console.log('✅ Production deployment appears healthy');
    console.log('🎉 VicSurf is ready for users!');
  } else {
    console.log('❌ Production deployment has issues');
    console.log('');
    console.log('🔧 Troubleshooting Tips:');
    console.log('- Check deployment logs in Replit');
    console.log('- Verify environment variables are set');
    console.log('- Ensure database is connected');
    console.log('- Try redeploying the application');
  }
  
  console.log(`\n🌐 Access your app: ${PRODUCTION_URL}`);
}

main().catch(console.error);