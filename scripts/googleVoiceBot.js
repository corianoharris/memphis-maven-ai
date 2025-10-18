import puppeteer from 'puppeteer';
import axios from 'axios';
import { db } from '../lib/db.js';
import { config } from 'dotenv';
config();

class GoogleVoiceBot {
  constructor() {
    this.browser = null;
    this.page = null;
    this.isRunning = false;
    this.lastMessageTime = new Date();
    this.processedMessages = new Set();
  }

  /**
   * Initialize the browser and login to Google Voice
   */
  async initialize() {
    try {
      console.log('Initializing Google Voice bot...');
      
      this.browser = await puppeteer.launch({
        headless: false, // Set to true for production
        timeout: 60000, // 60 second timeout
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--no-zygote',
          '--disable-gpu',
          '--single-process'
        ]
      });

      this.page = await this.browser.newPage();
      
      // Set user agent
      await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Navigate to Google Voice
      await this.page.goto('https://voice.google.com', { waitUntil: 'networkidle2' });
      
      // Wait for login page or dashboard
      await this.page.waitForSelector('input[type="email"], [data-testid="conversation-list"]', { timeout: 10000 });
      
      // Check if we need to login
      const isLoginPage = await this.page.$('input[type="email"]');
      if (isLoginPage) {
        await this.login();
      }
      
      console.log('Google Voice bot initialized successfully');
      return true;
      
    } catch (error) {
      console.error('Error initializing Google Voice bot:', error);
      return false;
    }
  }

  /**
   * Login to Google Voice
   */
  async login() {
    try {
      console.log('Logging into Google Voice...');
      
      // Enter email
      await this.page.type('input[type="email"]', process.env.GOOGLE_EMAIL);
      await this.page.click('#identifierNext');
      
      // Wait for password field
      await this.page.waitForSelector('input[type="password"]', { timeout: 10000 });
      
      // Enter password
      await this.page.type('input[type="password"]', process.env.GOOGLE_PASSWORD);
      await this.page.click('#passwordNext');
      
      // Wait for Google Voice dashboard
      await this.page.waitForSelector('[data-testid="conversation-list"]', { timeout: 30000 });
      
      console.log('Successfully logged into Google Voice');
      
    } catch (error) {
      console.error('Error logging into Google Voice:', error);
      throw error;
    }
  }

  /**
   * Send SMS message
   */
  async sendSMS(phoneNumber, message) {
    try {
      console.log(`Sending SMS to ${phoneNumber}: ${message}`);
      
      // Click on compose button
      await this.page.click('[data-testid="compose-button"]');
      
      // Wait for compose dialog
      await this.page.waitForSelector('input[placeholder*="number"]', { timeout: 5000 });
      
      // Enter phone number
      await this.page.type('input[placeholder*="number"]', phoneNumber);
      
      // Click on the message input
      await this.page.click('[data-testid="message-input"]');
      
      // Type message
      await this.page.type('[data-testid="message-input"]', message);
      
      // Send message
      await this.page.click('[data-testid="send-button"]');
      
      // Wait for message to be sent
      await this.page.waitForTimeout(2000);
      
      console.log(`SMS sent successfully to ${phoneNumber}`);
      
    } catch (error) {
      console.error(`Error sending SMS to ${phoneNumber}:`, error);
    }
  }

  /**
   * Get new messages from Google Voice
   */
  async getNewMessages() {
    try {
      // Wait for conversation list to load
      await this.page.waitForSelector('[data-testid="conversation-list"]', { timeout: 5000 });
      
      // Get all conversation elements
      const conversations = await this.page.$$('[data-testid="conversation-item"]');
      const newMessages = [];
      
      for (const conversation of conversations) {
        try {
          // Click on conversation to open it
          await conversation.click();
          await this.page.waitForTimeout(1000);
          
          // Get conversation details
          const phoneNumber = await this.page.$eval('[data-testid="contact-name"]', el => el.textContent).catch(() => '');
          const lastMessage = await this.page.$eval('[data-testid="message-text"]:last-child', el => el.textContent).catch(() => '');
          const messageTime = await this.page.$eval('[data-testid="message-time"]:last-child', el => el.textContent).catch(() => '');
          
          // Check if this is a new incoming message
          if (lastMessage && !this.processedMessages.has(lastMessage)) {
            const messageData = {
              phoneNumber: phoneNumber.trim(),
              message: lastMessage.trim(),
              timestamp: new Date(),
              conversationId: null
            };
            
            newMessages.push(messageData);
            this.processedMessages.add(lastMessage);
          }
          
        } catch (error) {
          console.error('Error processing conversation:', error);
        }
      }
      
      return newMessages;
      
    } catch (error) {
      console.error('Error getting new messages:', error);
      return [];
    }
  }

  /**
   * Process incoming message with AI
   */
  async processMessage(messageData) {
    try {
      const { phoneNumber, message } = messageData;
      
      console.log(`Processing message from ${phoneNumber}: ${message}`);
      
      // Get or create conversation
      let conversation = await db.getConversationByUser(phoneNumber, 'sms');
      if (!conversation) {
        const conversationId = await db.createConversation(phoneNumber, 'sms');
        conversation = { id: conversationId, user_id: phoneNumber, channel: 'sms' };
      }
      
      // Send to AI API
      const response = await axios.post(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/chat`, {
        userId: phoneNumber,
        question: message,
        conversationId: conversation.id
      });
      
      const { answer } = response.data;
      
      // Send AI response back via SMS
      await this.sendSMS(phoneNumber, answer);
      
      console.log(`AI response sent to ${phoneNumber}`);
      
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Send error message
      try {
        await this.sendSMS(messageData.phoneNumber, 
          'Sorry, I encountered an error processing your request. Please call Memphis 311 at (901)636-6500 for immediate assistance.'
        );
      } catch (sendError) {
        console.error('Error sending error message:', sendError);
      }
    }
  }

  /**
   * Start monitoring for new messages
   */
  async startMonitoring() {
    if (this.isRunning) {
      console.log('Bot is already running');
      return;
    }
    
    this.isRunning = true;
    console.log('Starting message monitoring...');
    
    while (this.isRunning) {
      try {
        const newMessages = await this.getNewMessages();
        
        for (const message of newMessages) {
          await this.processMessage(message);
        }
        
        // Wait before checking again
        await this.page.waitForTimeout(5000);
        
      } catch (error) {
        console.error('Error in monitoring loop:', error);
        await this.page.waitForTimeout(10000); // Wait longer on error
      }
    }
  }

  /**
   * Stop monitoring
   */
  async stop() {
    console.log('Stopping Google Voice bot...');
    this.isRunning = false;
    
    if (this.browser) {
      await this.browser.close();
    }
  }

  /**
   * Handle graceful shutdown
   */
  async shutdown() {
    console.log('Shutting down Google Voice bot...');
    await this.stop();
    process.exit(0);
  }
}

// Main execution
async function main() {
  const bot = new GoogleVoiceBot();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => bot.shutdown());
  process.on('SIGTERM', () => bot.shutdown());
  
  try {
    const initialized = await bot.initialize();
    if (initialized) {
      await bot.startMonitoring();
    } else {
      console.error('Failed to initialize bot');
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default GoogleVoiceBot;
