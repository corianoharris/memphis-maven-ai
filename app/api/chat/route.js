import { NextRequest, NextResponse } from 'next/server';
import Filter from 'bad-words';
import { db, initializeDatabase } from '../../../lib/db.js';
import { processQuestion, getEmbedding, safeProcessQuestion } from '../../../lib/ai.js';

/**
 * POST /api/chat
 * Handle chat requests with semantic search and multilingual support
 */
export async function POST(request) {
  try {
    // Set timeout for the entire request (increased to handle slower AI responses)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 120000)
    );
    
    const processRequest = async () => {
      // Initialize database if needed
      await initializeDatabase();
    
      const { userId, question, conversationId, language } = await request.json();
      
      console.log('Received request:', { userId, question: question?.substring(0, 50), conversationId, language });
      
      if (!userId) {
        return NextResponse.json(
          { error: 'Missing required field: userId' },
          { status: 400 }
        );
      }
      
      if (!question || question.trim().length === 0) {
        console.log('Question is empty or null');
        return NextResponse.json(
          { error: 'Question cannot be empty' },
          { status: 400 }
        );
      }
      
      // Filter profanity from user input
      const filter = new Filter();
      const cleanQuestion = filter.clean(question);
      
      // If the question was modified due to profanity, log it
      if (cleanQuestion !== question) {
        console.log('Profanity detected and filtered in user input');
      }
      
      // Get or create conversation
      let convId = conversationId;
      if (!convId) {
        convId = await db.createConversation(userId, 'web');
      }
      
      // Generate embedding for the question
      const questionEmbedding = await getEmbedding(cleanQuestion);
      
      // Find similar pages using semantic search
      const similarPages = await db.searchSimilarPages(questionEmbedding, 5);
      
      // Process the question with AI and multilingual support
      const response = await safeProcessQuestion(cleanQuestion, similarPages, language);
      
      console.log('Process question response:', response);
      
      // Validate response
      if (!response || !response.answer) {
        throw new Error('Invalid response from processQuestion');
      }
      
      // Store user message (store original to maintain conversation context)
      await db.addMessage(convId, 'user', cleanQuestion);
      
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
        language: response.originalLanguage || 'English',
        languageCode: response.languageCode || 'en',
        confidence: response.confidence || 0,
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
