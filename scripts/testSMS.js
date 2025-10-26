#!/usr/bin/env node

/**
 * Test SMS functionality for Memphis 211/311 AI Assistant
 * 
 * Usage:
 * node scripts/testSMS.js basic
 * node scripts/testSMS.js advanced --scenario=pothole
 * node scripts/testSMS.js advanced --scenario=emergency
 * node scripts/testSMS.js advanced --scenario=community
 * node scripts/testSMS.js advanced --custom="Your custom message here"
 */

import fetch from 'node-fetch';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config({ path: path.join(__dirname, '..', '.env.local') });
config({ path: path.join(__dirname, '..', '.env') });

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

async function testBasicSMS() {
  console.log('🧪 Testing basic SMS functionality...');
  
  try {
    // Check if we should use mock mode
    const useMock = process.env.TWILIO_MOCK_MODE === 'true' || 
                   !process.env.TWILIO_ACCOUNT_SID || 
                   process.env.TWILIO_PHONE_NUMBER === '15005550006';
    const url = useMock ? `${BASE_URL}/api/sms?mock=true` : `${BASE_URL}/api/sms`;
    
    if (useMock) {
      console.log('🔧 Using mock mode for testing');
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Basic SMS test successful!');
      console.log(`📱 Message SID: ${result.sid}`);
      console.log(`📞 To: ${result.to}`);
      console.log(`📞 From: ${result.from}`);
    } else {
      console.log('❌ Basic SMS test failed!');
      console.log(`Error: ${result.error}`);
      console.log(`Details: ${result.details}`);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

async function testAdvancedSMS(scenario, customMessage) {
  console.log(`🧪 Testing advanced SMS functionality with scenario: ${scenario}`);
  
  try {
    const payload = {
      testScenario: scenario,
      to: process.env.TWILIO_TEST_PHONE_NUMBER || '+15551234567'
    };
    
    if (customMessage) {
      payload.message = customMessage;
      payload.testScenario = 'custom';
    }
    
    const response = await fetch(`${BASE_URL}/api/sms`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Advanced SMS test successful!');
      console.log(`📱 Message SID: ${result.sid}`);
      console.log(`🎭 Scenario: ${result.scenario}`);
      console.log(`💬 Message: ${result.message}`);
      console.log(`🎯 Expected Response: ${result.expectedResponse}`);
      console.log(`📞 To: ${result.to}`);
      console.log(`📞 From: ${result.from}`);
      console.log(`ℹ️  Instructions: ${result.instructions}`);
    } else {
      console.log('❌ Advanced SMS test failed!');
      console.log(`Error: ${result.error}`);
      console.log(`Available scenarios: ${result.availableScenarios?.join(', ')}`);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

async function testAIChatbot(message, scenario) {
  console.log(`🤖 Testing AI chatbot (Beale) with message: "${message}"`);
  
  try {
    const payload = {
      message: message,
      from: process.env.TWILIO_TEST_PHONE_NUMBER || '+15551234567',
      testScenario: scenario
    };
    
    const response = await fetch(`${BASE_URL}/api/sms/test-ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ AI chatbot test successful!');
      console.log(`💬 Test Message: ${result.testMessage}`);
      console.log(`📞 From: ${result.from}`);
      console.log(`🤖 AI Response: ${result.aiResponse}`);
      console.log(`🌍 Language: ${result.language}`);
      console.log(`🎯 Confidence: ${result.confidence}%`);
      console.log(`💾 Conversation ID: ${result.conversationId}`);
      
      if (result.relevantPages && result.relevantPages.length > 0) {
        console.log(`📄 Relevant Resources (${result.relevantPages.length}):`);
        result.relevantPages.forEach((page, index) => {
          console.log(`   ${index + 1}. ${page.title} (${Math.round(page.similarity * 100)}%)`);
        });
      }
      
      console.log(`ℹ️  ${result.note}`);
    } else {
      console.log('❌ AI chatbot test failed!');
      console.log(`Error: ${result.error}`);
      console.log(`Details: ${result.details}`);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const testType = args[0];
  
  console.log('🎵 Memphis 211/311 AI Assistant - SMS Testing Tool\n');
  
  // Check environment variables
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    console.log('❌ Missing required environment variables:');
    console.log('   - TWILIO_ACCOUNT_SID');
    console.log('   - TWILIO_AUTH_TOKEN');
    console.log('   - TWILIO_PHONE_NUMBER');
    console.log('\nPlease set these in your .env.local file');
    return;
  }
  
  console.log(`🔧 Using Twilio Account: ${process.env.TWILIO_ACCOUNT_SID}`);
  console.log(`📞 From Number: ${process.env.TWILIO_PHONE_NUMBER}`);
  console.log(`📞 Test Number: ${process.env.TWILIO_TEST_PHONE_NUMBER || '+15551234567'}\n`);
  
  switch (testType) {
    case 'basic':
      await testBasicSMS();
      break;
      
    case 'advanced':
      const scenarioArg = args.find(arg => arg.startsWith('--scenario='));
      const customArg = args.find(arg => arg.startsWith('--custom='));
      
      if (customArg) {
        const customMessage = customArg.split('=')[1];
        await testAdvancedSMS('custom', customMessage);
      } else if (scenarioArg) {
        const scenario = scenarioArg.split('=')[1];
        await testAdvancedSMS(scenario);
      } else {
        console.log('Available scenarios: pothole, emergency, community, custom');
        console.log('Usage: node scripts/testSMS.js advanced --scenario=pothole');
        console.log('       node scripts/testSMS.js advanced --custom="Your message"');
      }
      break;
      
    case 'ai':
      const aiMessageArg = args.find(arg => arg.startsWith('--message='));
      const aiScenarioArg = args.find(arg => arg.startsWith('--scenario='));
      
      if (aiMessageArg) {
        const message = aiMessageArg.split('=')[1];
        const scenario = aiScenarioArg ? aiScenarioArg.split('=')[1] : 'custom';
        await testAIChatbot(message, scenario);
      } else {
        // Test with default scenarios
        console.log('Testing AI chatbot with default scenarios...\n');
        await testAIChatbot('Hello Beale, I need help with city services', 'general');
        console.log('\n' + '='.repeat(50) + '\n');
        await testAIChatbot('There is a pothole on Main Street', 'pothole');
        console.log('\n' + '='.repeat(50) + '\n');
        await testAIChatbot('I need help finding food assistance programs', 'community');
      }
      break;
      
    default:
      console.log('Usage:');
      console.log('  node scripts/testSMS.js basic');
      console.log('  node scripts/testSMS.js advanced --scenario=pothole');
      console.log('  node scripts/testSMS.js advanced --scenario=emergency');
      console.log('  node scripts/testSMS.js advanced --scenario=community');
      console.log('  node scripts/testSMS.js advanced --custom="Your custom message"');
      console.log('  node scripts/testSMS.js ai');
      console.log('  node scripts/testSMS.js ai --message="Your message to Beale"');
      console.log('  node scripts/testSMS.js ai --message="Your message" --scenario=pothole');
      break;
  }
}

main().catch(console.error);