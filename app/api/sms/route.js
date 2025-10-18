import { NextRequest, NextResponse } from 'next/server';
import { db, initializeDatabase } from '../../../lib/db.js';
import { processQuestion, getEmbedding } from '../../../lib/ai.js';
import { sendMemphisResponse } from '../../../lib/sms.js';

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
    
    // Generate embedding for the question
    const questionEmbedding = await getEmbedding(body);
    
    // Find similar pages using semantic search
    const similarPages = await db.searchSimilarPages(questionEmbedding, 5);
    
    // Process the question with AI and multilingual support
    const response = await processQuestion(body, similarPages);
    
    // Get or create conversation
    const conversationId = await db.createConversation(from, 'sms');
    
    // Store user message
    await db.addMessage(conversationId, 'user', body);
    
    // Store assistant response
    await db.addMessage(conversationId, 'assistant', response.answer);
    
    // Prepare relevant pages for SMS
    const relevantPages = similarPages.map(page => ({
      title: page.title,
      url: page.url,
      similarity: page.similarity
    }));
    
    // Send response via SMS
    await sendMemphisResponse(from, body, response.answer, relevantPages);
    
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
        await sendSMS(from, "Sorry, I'm having trouble right now. Please call 211 for community services or 311 at (901)636-6500 for immediate assistance.");
      }
    } catch (smsError) {
      console.error('Error sending error SMS:', smsError);
    }
    
    return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      headers: { 'Content-Type': 'application/xml' }
    });
  }
}
