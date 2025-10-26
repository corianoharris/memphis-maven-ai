import { NextRequest, NextResponse } from 'next/server';
import { db, initializeDatabase } from '../../../lib/db.js';
import { processQuestion, getEmbedding } from '../../../lib/ai.js';
import { sendMemphisResponse, sendSMS } from '../../../lib/sms.js';
import twilio from 'twilio';
import Filter from 'bad-words';

/**
 * GET /api/sms
 * Test SMS functionality with Twilio test phone numbers
 */
export async function GET(request) {
  const url = new URL(request.url);
  const mockMode = url.searchParams.get('mock') === 'true' || process.env.TWILIO_MOCK_MODE === 'true';
  
  // Check if we should use mock mode (when explicitly enabled)
  if (mockMode) {
    console.log('Using mock mode for SMS testing');
    return NextResponse.json({ 
      success: true, 
      sid: 'mock_' + Date.now(),
      message: 'Mock SMS test successful',
      to: process.env.TWILIO_TEST_PHONE_NUMBER || '+15005550006',
      from: process.env.TWILIO_PHONE_NUMBER || '+15005550006',
      note: 'MOCK MODE - No actual SMS sent. Set TWILIO_MOCK_MODE=false and configure valid Twilio credentials for real testing.'
    });
  }

  try {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    // Use Twilio test phone numbers for testing
    // If TWILIO_PHONE_NUMBER is a test number, use a different test number for 'to'
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;
    const toNumber = process.env.TWILIO_TEST_PHONE_NUMBER || '+15551234567';
    
    const testMessage = await client.messages.create({
      body: '🐢 Test message from Memphis 211/311 AI Assistant! This is a test of the SMS functionality.',
      from: fromNumber,
      to: toNumber,
    });

    return NextResponse.json({ 
      success: true, 
      sid: testMessage.sid,
      message: 'Test SMS sent successfully',
      to: toNumber,
      from: fromNumber,
      note: 'Using Twilio test numbers - no actual SMS sent'
    });
  } catch (error) {
    console.error('Test SMS error:', error);
    
    let errorMessage = error.message;
    let details = 'Make sure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER are set in your environment variables';
    
    if (error.code === 21211) {
      errorMessage = 'Invalid From Number (caller ID)';
      details = 'TWILIO_PHONE_NUMBER must be a valid Twilio phone number that you own. Check your Twilio console for available phone numbers.';
    } else if (error.code === 21266) {
      errorMessage = 'To and From numbers cannot be the same';
      details = 'The phone number you\'re sending from cannot be the same as the number you\'re sending to.';
    }
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage,
      details: details,
      twilioErrorCode: error.code,
      currentFromNumber: process.env.TWILIO_PHONE_NUMBER,
      currentToNumber: process.env.TWILIO_TEST_PHONE_NUMBER || '+15005550006'
    }, { status: 500 });
  }
}

/**
 * POST /api/sms
 * Handle incoming SMS messages via Twilio webhook
 */
export async function POST(request) {
  try {
    // Initialize database if needed
    await initializeDatabase();
    
    // Parse Twilio webhook data
    const formData = await request.formData();
    const from = formData.get('From');
    const body = formData.get('Body');
    
    if (!from || !body) {
      return NextResponse.json(
        { error: 'Missing From or Body' },
        { status: 400 }
      );
    }
    
    console.log(`SMS from ${from}: ${body}`);
    
    // Filter profanity from user input
    const filter = new Filter();
    const cleanBody = filter.clean(body);
    
    // If the body was modified due to profanity, log it
    if (cleanBody !== body) {
      console.log('Profanity detected and filtered in SMS input');
    }
    
    // Generate embedding for the question
    const questionEmbedding = await getEmbedding(cleanBody);
    
    // Find similar pages using semantic search
    const similarPages = await db.searchSimilarPages(questionEmbedding, 5);
    
    // Process the question with AI and multilingual support
    const response = await processQuestion(cleanBody, similarPages);
    
    // Get or create conversation
    const conversationId = await db.createConversation(from, 'sms');
    
    // Store user message (store cleaned version)
    await db.addMessage(conversationId, 'user', cleanBody);
    
    // Store assistant response
    await db.addMessage(conversationId, 'assistant', response.answer);
    
    // Prepare relevant pages for SMS
    const relevantPages = similarPages.map(page => ({
      title: page.title,
      url: page.url,
      similarity: page.similarity
    }));
    
    // Send response via SMS (use cleanBody for context)
    await sendMemphisResponse(from, cleanBody, response.answer, relevantPages);
    
    // Return TwiML response (empty for SMS)
    return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      headers: { 'Content-Type': 'application/xml' }
    });
    
  } catch (error) {
    console.error('SMS API error:', error);
    
    // Send error response via SMS
    try {
      const formData = await request.formData();
      const from = formData.get('From');
      if (from) {
        await sendMemphisResponse(from, "", "Sorry, I'm having trouble right now. Please call 211 for community services or 311 at (901)636-6500 for immediate assistance.", []);
      }
    } catch (smsError) {
      console.error('Error sending error SMS:', smsError);
    }
    
    return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      headers: { 'Content-Type': 'application/xml' }
    });
  }
}

/**
 * PUT /api/sms
 * Advanced SMS testing with custom messages and scenarios
 */
export async function PUT(request) {
  try {
    const { message, to, testScenario } = await request.json();
    
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    // Default test scenarios
    const scenarios = {
      'pothole': {
        message: 'There is a large pothole on Main Street near the intersection with 2nd Avenue. It\'s causing damage to cars.',
        expectedResponse: 'Memphis 311 service request for pothole repair'
      },
      'emergency': {
        message: 'There is a water main break flooding the street',
        expectedResponse: 'Emergency response for water main break'
      },
      'community': {
        message: 'I need help finding food assistance programs',
        expectedResponse: 'Community services and food assistance resources'
      },
      'custom': {
        message: message || 'Test message from Memphis AI Assistant',
        expectedResponse: 'Custom test message'
      }
    };

    const scenario = scenarios[testScenario] || scenarios['custom'];
    const testMessage = scenario.message;
    
    // Handle test number conflicts
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;
    const recipient = to || process.env.TWILIO_TEST_PHONE_NUMBER || '+15551234567';

    // Send test message
    const result = await client.messages.create({
      body: `🧪 TEST: ${testMessage}`,
      from: fromNumber,
      to: recipient
    });

    return NextResponse.json({
      success: true,
      sid: result.sid,
      scenario: testScenario || 'custom',
      message: testMessage,
      expectedResponse: scenario.expectedResponse,
      to: recipient,
      from: fromNumber,
      note: 'Using Twilio test numbers - no actual SMS sent',
      instructions: 'This was a test message. To test the full AI response, send this message to your Twilio webhook URL.'
    });

  } catch (error) {
    console.error('Advanced SMS test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      availableScenarios: ['pothole', 'emergency', 'community', 'custom']
    }, { status: 500 });
  }
}
