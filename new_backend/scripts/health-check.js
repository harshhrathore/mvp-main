#!/usr/bin/env node

/**
 * Health Check Utility
 * Polls service health endpoints with retry logic and exponential backoff
 */

const http = require('http');
const https = require('https');

const DEFAULT_TIMEOUT = 5000; // 5 seconds
const MAX_RETRIES = 3;
const INITIAL_BACKOFF = 1000; // 1 second

/**
 * Make HTTP GET request to health endpoint
 * @param {string} url - Health endpoint URL
 * @param {number} timeout - Request timeout in ms
 * @returns {Promise<{status: number, body: object}>}
 */
function checkHealth(url, timeout = DEFAULT_TIMEOUT) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;

    const req = client.get(url, { timeout }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const body = JSON.parse(data);
          resolve({ status: res.statusCode, body });
        } catch (err) {
          resolve({ status: res.statusCode, body: { raw: data } });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Check service health with retry logic
 * @param {string} serviceName - Service name for logging
 * @param {string} url - Health endpoint URL
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Promise<boolean>} - True if healthy, false otherwise
 */
async function checkServiceHealth(serviceName, url, maxRetries = MAX_RETRIES) {
  let attempt = 0;
  let backoff = INITIAL_BACKOFF;

  while (attempt < maxRetries) {
    try {
      console.log(`[${serviceName}] Health check attempt ${attempt + 1}/${maxRetries}...`);
      
      const result = await checkHealth(url);
      
      if (result.status === 200 && result.body.status === 'healthy') {
        console.log(`[${serviceName}] ✓ Healthy`);
        return true;
      } else {
        console.log(`[${serviceName}] ✗ Unhealthy (status: ${result.status}, body: ${JSON.stringify(result.body)})`);
      }
    } catch (err) {
      console.log(`[${serviceName}] ✗ Error: ${err.message}`);
    }

    attempt++;
    
    if (attempt < maxRetries) {
      console.log(`[${serviceName}] Retrying in ${backoff}ms...`);
      await new Promise(resolve => setTimeout(resolve, backoff));
      backoff *= 2; // Exponential backoff
    }
  }

  console.log(`[${serviceName}] ✗ Failed after ${maxRetries} attempts`);
  return false;
}

/**
 * Check all services health
 * @returns {Promise<boolean>} - True if all healthy, false otherwise
 */
async function checkAllServices() {
  const services = [
    { name: 'Checkin Chat', url: process.env.CHECKIN_CHAT_URL || 'http://localhost:8000/health' },
    { name: 'Checkin Voice', url: process.env.CHECKIN_VOICE_URL || 'http://localhost:8001/health' },
    { name: 'API Gateway', url: process.env.API_GATEWAY_URL || 'http://localhost:5000/health' },
    { name: 'Frontend', url: process.env.FRONTEND_URL || 'http://localhost:5173' }
  ];

  console.log('\nChecking health of all services...\n');

  const results = await Promise.all(
    services.map(service => 
      checkServiceHealth(service.name, service.url, MAX_RETRIES)
        .then(healthy => ({ ...service, healthy }))
    )
  );

  console.log('\n=== Health Check Summary ===');
  results.forEach(result => {
    const status = result.healthy ? '✓ Healthy' : '✗ Unhealthy';
    console.log(`${result.name}: ${status}`);
  });
  console.log('============================\n');

  return results.every(r => r.healthy);
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  
  // Check if --all flag is present
  if (args.includes('--all')) {
    const allHealthy = await checkAllServices();
    process.exit(allHealthy ? 0 : 1);
    return;
  }

  if (args.length < 2) {
    console.error('Usage: node health-check.js <service-name> <health-url> [max-retries]');
    console.error('       node health-check.js --all');
    console.error('Example: node health-check.js backend http://localhost:5000/health 3');
    console.error('Example: node health-check.js --all');
    process.exit(1);
  }

  const [serviceName, url, maxRetriesArg] = args;
  const maxRetries = maxRetriesArg ? parseInt(maxRetriesArg, 10) : MAX_RETRIES;

  console.log(`\nChecking health of ${serviceName}...`);
  console.log(`URL: ${url}`);
  console.log(`Max retries: ${maxRetries}\n`);

  const isHealthy = await checkServiceHealth(serviceName, url, maxRetries);

  if (isHealthy) {
    console.log(`\n✓ ${serviceName} is healthy\n`);
    process.exit(0);
  } else {
    console.log(`\n✗ ${serviceName} is unhealthy\n`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { checkHealth, checkServiceHealth };
