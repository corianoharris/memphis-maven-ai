#!/usr/bin/env node

import { sendMemphisResponse } from '../lib/sms.js';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config({ path: path.join(__dirname, '..', '.env.local') });
config({ path: path.join(__dirname, '..', '.env') });

async function testSMS() {
  console.log('🧪 Testing Twilio SMS...');
  
  // Check if Twilio credentials are set
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    console.error('❌ Twilio credentials not found in .env.local');
    console.log('Please add:');
    console.log('TWILIO_ACCOUNT_SID=your-account-sid');
    console.log('TWILIO_AUTH_TOKEN=your-auth-token');
    console.log('TWILIO_PHONE_NUMBER=+1234567890');
    process.exit(1);
  }
  
  console.log('✅ Twilio credentials found');
  
  // Test phone number (replace with your number)
  const testNumber = process.argv[2];
  if (!testNumber) {
    console.error('❌ Please provide a test phone number:');
    console.log('node scripts/testSMS.js +1234567890');
    process.exit(1);
  }
  
  try {
    const testQuestion = "How do I report a pothole?";
    const testAnswer = "Memphis roads need love too! Here's how to report a pothole: 1) Call 311 at (901)636-6500, 2) Visit memphistn.gov and use the online reporting form, 3) Provide the exact location and description. We'll get those streets smooth! 🛣️";
    
    const testPages = [
      { title: "Call 311 - The City of Memphis", url: "https://memphistn.gov/call-311/" },
      { title: "Public Works - The City of Memphis", url: "https://memphistn.gov/government/public-works/" }
    ];
    
    console.log(`📱 Sending test SMS to ${testNumber}...`);
    
    await sendMemphisResponse(testNumber, testQuestion, testAnswer, testPages);
    
    console.log('✅ Test SMS sent successfully!');
    
  } catch (error) {
    console.error('❌ SMS test failed:', error.message);
    process.exit(1);
  }
}

testSMS();
