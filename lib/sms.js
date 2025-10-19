import twilio from 'twilio';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config({ path: path.join(__dirname, '..', '.env.local') });
config({ path: path.join(__dirname, '..', '.env') });

// Initialize Twilio client
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

/**
 * Send SMS message using Twilio
 * @param {string} to - Recipient phone number
 * @param {string} message - Message content
 * @returns {Promise<Object>} - Twilio message result
 */
export async function sendSMS(to, message) {
  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });
    
    console.log(`SMS sent to ${to}: ${result.sid}`);
    return result;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
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
    let message = `Beale 🎵\n\nQ: ${question}\n\nA: ${answer}`;
    
    if (relevantPages && relevantPages.length > 0) {
      message += '\n\n📄 Resources:';
      relevantPages.slice(0, 3).forEach((page, index) => {
        message += `\n${index + 1}. ${page.title}`;
        message += `\n   ${page.url}`;
      });
    }
    
    message += '\n\nFor more help: Call 211, 311, or 911';
    
    return await sendSMS(to, message);
  } catch (error) {
    console.error('Error sending Memphis response:', error);
    throw error;
  }
}

export default { sendSMS, sendMemphisResponse };
