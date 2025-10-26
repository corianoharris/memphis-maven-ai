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
    // Truncate answer if too long for SMS
    const maxAnswerLength = 200;
    let truncatedAnswer = answer;
    if (answer.length > maxAnswerLength) {
      truncatedAnswer = answer.substring(0, maxAnswerLength - 3) + '...';
    }
    
    let message = `Beale 🎵\n\nQ: ${question}\n\nA: ${truncatedAnswer}`;
    
    if (relevantPages && relevantPages.length > 0) {
      message += '\n\n📄 Resources:';
      relevantPages.slice(0, 2).forEach((page, index) => {
        // Extract department name from title
        const departmentName = page.title.replace(' - The City of Memphis', '');
        message += `\n${index + 1}. ${departmentName}`;
      });
      
      // Add a note about visiting the website
      if (relevantPages.length > 2) {
        message += `\n\nVisit memphistn.gov for more info`;
      }
    }
    
    message += '\n\nFor help: Call 211, 311, or 911';
    
    // Ensure message doesn't exceed SMS limits (1600 chars for concatenated SMS)
    if (message.length > 1500) {
      message = message.substring(0, 1497) + '...';
    }
    
    return await sendSMS(to, message);
  } catch (error) {
    console.error('Error sending Memphis response:', error);
    throw error;
  }
}

export default { sendSMS, sendMemphisResponse };
