import { NextRequest, NextResponse } from 'next/server';
import { db, initializeDatabase } from '../../../lib/db.js';
import { processQuestion, getEmbedding } from '../../../lib/ai.js';

/**
 * POST /api/chat
 * Handle chat requests with semantic search and multilingual support
 */
export async function POST(request) {
  try {
    // Set timeout for the entire request
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 30000)
    );
    
    const processRequest = async () => {
      // Initialize database if needed
      await initializeDatabase();
    
      const { userId, question, conversationId } = await request.json();
      
      if (!userId || !question) {
        return NextResponse.json(
          { error: 'Missing required fields: userId, question' },
          { status: 400 }
        );
      }
      
      // Get or create conversation
      let convId = conversationId;
      if (!convId) {
        convId = await db.createConversation(userId, 'web');
      }
      
      // Generate embedding for the question
      const questionEmbedding = await getEmbedding(question);
      
      // Find similar pages using semantic search
      const similarPages = await db.searchSimilarPages(questionEmbedding, 5);
      
      // Process the question with AI and multilingual support
      const response = await processQuestion(question, similarPages);
      
      // Store user message
      await db.addMessage(convId, 'user', question);
      
      // Store assistant response
      await db.addMessage(convId, 'assistant', response.answer);
      
      // Prepare response with relevant pages
      const relevantPages = similarPages.map(page => ({
        title: page.title,
        url: page.url,
        similarity: page.similarity
      }));
      
      return NextResponse.json({
        answer: response.answer,
        conversationId: convId,
        language: response.originalLanguage,
        languageCode: response.languageCode,
        confidence: response.confidence,
        relevantPages: relevantPages,
        timestamp: new Date().toISOString()
      });
    };
    
    // Race between the request processing and timeout
    return await Promise.race([processRequest(), timeoutPromise]);
    
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error.message === 'Request timeout' ? 'Request timed out. Please try again.' : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/chat
 * Get conversation history
 */
export async function GET(request) {
  try {
    // Initialize database if needed
    await initializeDatabase();
    
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const userId = searchParams.get('userId');
    
    if (!conversationId && !userId) {
      return NextResponse.json(
        { error: 'Missing conversationId or userId' },
        { status: 400 }
      );
    }
    
    let messages = [];
    
    if (conversationId) {
      messages = await db.getMessages(conversationId);
    } else if (userId) {
      const conversation = await db.getConversationByUser(userId, 'web');
      if (conversation) {
        messages = await db.getMessages(conversation.id);
      }
    }
    
    return NextResponse.json({
      messages: messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        text: msg.text,
        timestamp: msg.created_at
      }))
    });
    
  } catch (error) {
    console.error('Chat history API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Named exports are used above
