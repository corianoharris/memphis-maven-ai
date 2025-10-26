import { NextRequest, NextResponse } from 'next/server';
import { db, initializeDatabase } from '../../../../lib/db.js';
import { processQuestion, getEmbedding } from '../../../../lib/ai.js';

/**
 * POST /api/sms/test-ai
 * Test the full AI chatbot flow by simulating an SMS webhook
 */
export async function POST(request) {
  try {
    // Parse test parameters
    const { message, from, testScenario } = await request.json();
    
    // Initialize database if needed
    await initializeDatabase();
    
    // Use test parameters or defaults
    const testFrom = from || process.env.TWILIO_TEST_PHONE_NUMBER || '+15551234567';
    const testMessage = message || 'Hello Beale, I need help with city services';
    
    console.log(`🧪 Testing AI chatbot with message: "${testMessage}" from ${testFrom}`);
    
    // Generate embedding for the question
    const questionEmbedding = await getEmbedding(testMessage);
    
    // Find similar pages using semantic search
    const similarPages = await db.searchSimilarPages(questionEmbedding, 5);
    
    // Process the question with AI and multilingual support
    const response = await processQuestion(testMessage, similarPages);
    
    // Get or create conversation
    const conversationId = await db.createConversation(testFrom, 'sms-test');
    
    // Store user message
    await db.addMessage(conversationId, 'user', testMessage);
    
    // Store assistant response
    await db.addMessage(conversationId, 'assistant', response.answer);
    
    // Prepare relevant pages for response
    const relevantPages = similarPages.map(page => ({
      title: page.title,
      url: page.url,
      similarity: page.similarity
    }));
    
    return NextResponse.json({
      success: true,
      message: 'AI chatbot test successful',
      testMessage: testMessage,
      from: testFrom,
      aiResponse: response.answer,
      relevantPages: relevantPages,
      conversationId: conversationId,
      language: response.language,
      confidence: response.confidence,
      note: 'This was a test - no actual SMS sent. The AI processed your message and generated a response.'
    });
    
  } catch (error) {
    console.error('AI chatbot test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: 'Failed to test AI chatbot functionality'
    }, { status: 500 });
  }
}
