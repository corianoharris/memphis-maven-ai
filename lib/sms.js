import twilio from 'twilio';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config({ path: path.join(__dirname, '..', '.env.local') });
config({ path: path.join(__dirname, '..', '.env') });

// Check if valid Twilio configuration exists
const hasValidTwilioConfig = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
  
  // Check if required credentials exist
  if (!accountSid || !authToken || !phoneNumber) {
    return false;
  }
  
  // Check if using test numbers (these won't send real SMS)
  const testNumbers = ['15005550006', '+15005550006', '15551234567', '+15551234567'];
  if (testNumbers.includes(phoneNumber)) {
    return false;
  }
  
  // Check if account SID looks like a test account
  if (accountSid.startsWith('AC') && accountSid.length === 34) {
    // This looks like a real account SID, but we still need to validate
    return true;
  }
  
  return false;
};

// Initialize Twilio client only if valid config exists
const getTwilioClient = () => {
  if (hasValidTwilioConfig()) {
    return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return null;
};

const client = getTwilioClient();

/**
 * Send SMS message using Twilio or mock if no valid config
 * @param {string} to - Recipient phone number
 * @param {string} message - Message content
 * @returns {Promise<Object>} - Twilio message result or mock response
 */
export async function sendSMS(to, message) {
  // Check if we have valid Twilio configuration
  if (!client) {
    console.log(`📱 MOCK SMS to ${to}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`);
    
    // Return mock response that mimics Twilio's response format
    return {
      sid: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      to: to,
      from: process.env.TWILIO_PHONE_NUMBER || '+15005550006',
      body: message,
      status: 'mocked',
      dateCreated: new Date(),
      mock: true,
      note: 'No valid Twilio configuration found - using mock mode'
    };
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });
    
    console.log(`📱 SMS sent to ${to}: ${result.sid}`);
    return result;
  } catch (error) {
    console.error('Error sending SMS:', error);
    
    // If Twilio fails, fall back to mock mode
    console.log('📱 Twilio failed, falling back to mock mode');
    return {
      sid: `mock_fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      to: to,
      from: process.env.TWILIO_PHONE_NUMBER || '+15005550006',
      body: message,
      status: 'mocked',
      dateCreated: new Date(),
      mock: true,
      fallback: true,
      originalError: error.message,
      note: 'Twilio failed, using mock mode'
    };
  }
}

/**
 * Send Memphis Maven response via SMS
 * @param {string} to - Recipient phone number
 * @param {string} question - User's question
 * @param {string} answer - AI response
 * @param {Array} relevantPages - Relevant pages
 */
export async function sendMemphisResponse(to, question, answer, relevantPages = []) {
  try {
    // Check if we're in mock mode for better message formatting
    const isMockMode = !client;
    
    // Truncate answer if too long for SMS
    const maxAnswerLength = 200;
    let truncatedAnswer = answer;
    if (answer.length > maxAnswerLength) {
      truncatedAnswer = answer.substring(0, maxAnswerLength - 3) + '...';
    }
    
    // Build the message
    let message;
    if (isMockMode) {
      // Mock mode message with clear indication
      message = `📱 MOCK MODE - Beale\n\nQ: ${question}\n\nA: ${truncatedAnswer}`;
      
      if (relevantPages && relevantPages.length > 0) {
        message += '\n\n📄 Mock Resources:';
        relevantPages.slice(0, 2).forEach((page, index) => {
          const departmentName = page.title.replace(' - The City of Memphis', '');
          message += `\n${index + 1}. ${departmentName}`;
        });
        
        if (relevantPages.length > 2) {
          message += `\n\nVisit memphistn.gov for more info`;
        }
      }
      
      message += '\n\nFor help: Call 211, 311, or 911';
      message += '\n\n💡 Enable real Twilio for actual SMS delivery';
    } else {
      // Real SMS mode
      message = `Beale 🎵\n\nQ: ${question}\n\nA: ${truncatedAnswer}`;
      
      if (relevantPages && relevantPages.length > 0) {
        message += '\n\n📄 Resources:';
        relevantPages.slice(0, 2).forEach((page, index) => {
          const departmentName = page.title.replace(' - The City of Memphis', '');
          message += `\n${index + 1}. ${departmentName}`;
        });
        
        if (relevantPages.length > 2) {
          message += `\n\nVisit memphistn.gov for more info`;
        }
      }
      
      message += '\n\nFor help: Call 211, 311, or 911';
    }
    
    // Ensure message doesn't exceed SMS limits (1600 chars for concatenated SMS)
    if (message.length > 1500) {
      message = message.substring(0, 1497) + '...';
    }
    
    const result = await sendSMS(to, message);
    
    // Log mock mode information
    if (isMockMode) {
      console.log('📱 Mock SMS sent successfully - configure Twilio for real delivery');
    }
    
    return result;
  } catch (error) {
    console.error('Error sending Memphis response:', error);
    
    // Even in case of error, try to send a simple error message in mock mode
    if (!client) {
      try {
        const errorMessage = `📱 MOCK ERROR - Beale\n\nSorry, I'm having trouble right now.\n\nFor help: Call 211, 311, or 911`;
        return await sendSMS(to, errorMessage);
      } catch (mockError) {
        console.error('Error sending mock error SMS:', mockError);
      }
    }
    
    throw error;
  }
}

/**
 * Check if Twilio is configured for real SMS delivery
 * @returns {Object} - Configuration status
 */
export function getTwilioStatus() {
  const isValid = hasValidTwilioConfig();
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
  
  const testNumbers = ['15005550006', '+15005550006', '15551234567', '+15551234567'];
  const isTestNumber = testNumbers.includes(phoneNumber);
  
  return {
    configured: isValid,
    phoneNumber: phoneNumber || 'Not set',
    isTestNumber: isTestNumber,
    mode: isValid ? 'real' : 'mock',
    message: isValid
      ? 'Twilio is configured for real SMS delivery'
      : 'Using mock mode - configure valid Twilio credentials for real SMS',
    mockReason: isValid
      ? null
      : !phoneNumber
        ? 'No phone number configured'
        : isTestNumber
          ? 'Using Twilio test number'
          : 'Missing valid Twilio credentials'
  };
}

export default { sendSMS, sendMemphisResponse, getTwilioStatus };
