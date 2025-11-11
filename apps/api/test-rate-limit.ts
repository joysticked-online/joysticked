#!/usr/bin/env bun

/**
 * Rate Limit Testing Script
 *
 * This script tests the rate limiting middleware by sending multiple requests
 * to the API and checking if the rate limit is properly enforced.
 */

const API_URL = 'http://localhost:3333';
const ENDPOINT = '/waitlist/join'; // Change this to your actual endpoint
const MAX_REQUESTS = 15; // Should exceed the rate limit (10 requests per 60 seconds)

interface RequestResult {
  requestNumber: number;
  status: number;
  success: boolean;
  message?: string;
  error?: string;
}

async function testRateLimit() {
  console.log('🧪 Starting Rate Limit Test...\n');
  console.log(`📍 Target: ${API_URL}${ENDPOINT}`);
  console.log(`📊 Sending ${MAX_REQUESTS} requests\n`);

  const results: RequestResult[] = [];
  let successCount = 0;
  let rateLimitedCount = 0;

  // Send requests sequentially with a small delay
  for (let i = 1; i <= MAX_REQUESTS; i++) {
    try {
      const response = await fetch(`${API_URL}${ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Simulate the same IP for rate limiting
          'x-forwarded-for': '127.0.0.1'
        },
        body: JSON.stringify({ email: `test${i}@example.com` })
      });

      const success = response.ok;

      if (success) {
        successCount++;
        console.log(`✅ Request ${i}: Success (${response.status})`);
      } else {
        rateLimitedCount++;
        const errorText = await response.text().catch(() => 'Unknown error');
        console.log(`❌ Request ${i}: Rate Limited (${response.status}) - ${errorText}`);
      }

      results.push({
        requestNumber: i,
        status: response.status,
        success,
        message: success ? 'Success' : 'Rate Limited'
      });
    } catch (error) {
      rateLimitedCount++;
      console.log(
        `❌ Request ${i}: Error - ${error instanceof Error ? error.message : 'Unknown error'}`
      );

      results.push({
        requestNumber: i,
        status: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📈 Test Summary:');
  console.log('='.repeat(50));
  console.log(`✅ Successful Requests: ${successCount}`);
  console.log(`❌ Rate Limited Requests: ${rateLimitedCount}`);
  console.log(`📊 Total Requests: ${MAX_REQUESTS}`);

  if (rateLimitedCount > 0) {
    console.log('\n✨ Rate limiting is working correctly!');
    console.log(`   First ${successCount} requests passed, then got rate limited.`);
  } else {
    console.log('\n⚠️  Warning: No requests were rate limited!');
    console.log('   Rate limiting might not be working as expected.');
  }

  console.log(
    '\n💡 Note: Rate limit is configured for 10 requests per 60 seconds (sliding window)'
  );
}

// Run the test
testRateLimit().catch(console.error);
