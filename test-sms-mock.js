#!/usr/bin/env node

/**
 * Test SMS Mock Functionality
 * Tests the new mock SMS feature when Twilio is not properly configured
 */

import { sendMemphisResponse, sendSMS, getTwilioStatus } from './lib/sms.js';

console.log('🧪 Testing SMS Mock Functionality\n');

// Test 1: Check Twilio Status
console.log('📊 Step 1: Checking Twilio Configuration Status');
const status = getTwilioStatus();
console.log('Status:', JSON.stringify(status, null, 2));
console.log('');

// Test 2: Send Mock SMS
console.log('📱 Step 2: Testing Mock SMS sending');
try {
  const mockResult = await sendSMS('+15551234567', 'This is a test mock SMS message from Beale!');
  console.log('Mock SMS Result:', JSON.stringify(mockResult, null, 2));
} catch (error) {
  console.error('❌ Mock SMS Error:', error.message);
}
console.log('');

// Test 3: Send Mock Memphis Response
console.log('🎵 Step 3: Testing Mock Memphis Response');
try {
  const mockResponse = await sendMemphisResponse(
    '+15551234567',
    'How do I report a pothole?',
    'You can report potholes by calling 311 at (901) 636-6500 or by using the Memphis 311 mobile app or website.',
    [
      {
        title: 'Public Works - Street Maintenance - The City of Memphis',
        url: 'https://www.memphistn.gov/government/departments/public-works/',
        similarity: 0.85
      }
    ]
  );
  console.log('Mock Memphis Response:', JSON.stringify(mockResponse, null, 2));
} catch (error) {
  console.error('❌ Mock Response Error:', error.message);
}
console.log('');

// Test 4: Summary
console.log('✅ Step 4: Test Summary');
console.log(`- Twilio Configured: ${status.configured}`);
console.log(`- Current Mode: ${status.mode}`);
console.log(`- Mock Reason: ${status.mockReason}`);
console.log('');
console.log('🎉 Mock SMS functionality test completed!');
console.log('💡 The system will automatically use mock mode when no valid Twilio credentials are configured.');