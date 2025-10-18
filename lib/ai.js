import { franc } from 'franc';
import axios from 'axios';
import { config } from 'dotenv';
config();

// Initialize AI services
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

// Simple in-memory cache for embeddings
const embeddingCache = new Map();

// Language detection and translation
const SUPPORTED_LANGUAGES = {
  'eng': 'English',
  'spa': 'Spanish', 
  'arb': 'Arabic'
};

const LANGUAGE_CODES = {
  'eng': 'en',
  'spa': 'es',
  'arb': 'ar'
};

/**
 * Detect the language of the input text
 * @param {string} text - Input text to analyze
 * @returns {string} - Detected language code
 */
function detectLanguage(text) {
  const detected = franc(text);
  return detected in SUPPORTED_LANGUAGES ? detected : 'eng';
}

/**
 * Translate text to English for processing using Ollama
 * @param {string} text - Text to translate
 * @param {string} fromLang - Source language code
 * @returns {string} - Translated text
 */
async function translateToEnglish(text, fromLang) {
  if (fromLang === 'eng') return text;
  
  try {
    const languageNames = {
      'spa': 'Spanish',
      'arb': 'Arabic'
    };
    
    const prompt = `Translate to English: ${text}`;
    
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: 'llama2',
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.3,
        max_tokens: 100
      }
    }, {
      timeout: 10000 // 10 second timeout
    });
    
    return response.data.response.trim();
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text if translation fails
  }
}

/**
 * Translate text from English to target language using Ollama
 * @param {string} text - English text to translate
 * @param {string} toLang - Target language code
 * @returns {string} - Translated text
 */
async function translateFromEnglish(text, toLang) {
  if (toLang === 'eng') return text;
  
  try {
    const languageNames = {
      'spa': 'Spanish',
      'arb': 'Arabic'
    };
    
    const prompt = `Translate to ${languageNames[toLang] || 'target language'}: ${text}`;
    
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: 'llama2',
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.3,
        max_tokens: 100
      }
    }, {
      timeout: 10000 // 10 second timeout
    });
    
    return response.data.response.trim();
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text if translation fails
  }
}

/**
 * Generate embedding for text using Ollama
 * @param {string} text - Text to embed
 * @returns {Array} - Embedding vector
 */
async function getEmbedding(text) {
  // Check cache first
  const cacheKey = text.toLowerCase().trim();
  if (embeddingCache.has(cacheKey)) {
    return embeddingCache.get(cacheKey);
  }

  try {
    // Use Ollama's embedding endpoint with timeout
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/embeddings`, {
      model: 'nomic-embed-text',
      prompt: text
    }, {
      timeout: 10000 // 10 second timeout
    });
    
    const embedding = response.data.embedding;
    
    // Cache the result
    embeddingCache.set(cacheKey, embedding);
    
    return embedding;
  } catch (error) {
    console.error('Embedding generation error:', error);
    
    // Fallback: create a simple hash-based embedding
    console.log('Using fallback embedding generation');
    const fallbackEmbedding = createSimpleEmbedding(text);
    
    // Cache the fallback too
    embeddingCache.set(cacheKey, fallbackEmbedding);
    
    return fallbackEmbedding;
  }
}

/**
 * Create a simple hash-based embedding as fallback
 * @param {string} text - Text to embed
 * @returns {Array} - Simple embedding vector
 */
function createSimpleEmbedding(text) {
  const words = text.toLowerCase().split(/\s+/);
  const embedding = new Array(384).fill(0); // Standard embedding size
  
  words.forEach(word => {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) - hash + word.charCodeAt(i)) & 0xffffffff;
    }
    const index = Math.abs(hash) % 384;
    embedding[index] += 1;
  });
  
  // Normalize the embedding
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
}

/**
 * Generate AI response using Ollama
 * @param {string} prompt - Input prompt
 * @param {Array} contextPages - Relevant pages for context
 * @returns {string} - AI response
 */
async function getAIResponse(prompt, contextPages = []) {
  try {
    // Build simple context from relevant pages
    const context = contextPages.slice(0, 2).map(page => 
      `${page.title}`
    ).join(', ');

    // Create a very simple prompt that should work reliably
    const simplePrompt = `You are Memphis Maven, an enthusiastic Memphis 211/311 assistant. Answer this question about Memphis city services: "${prompt}"

${context ? `Relevant services: ${context}` : ''}

Be excited and helpful! Keep your answer under 50 words. If unsure, suggest calling 211 for community services or 311 at (901)636-6500.`;

    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: 'llama3',
      prompt: simplePrompt,
      stream: false,
      options: {
        temperature: 0.5,
        num_predict: 80,
        top_p: 0.8
      }
    }, {
      timeout: 15000 // 15 second timeout
    });

    let answer = response.data.response?.trim();
    
    // Clean up the response
    if (answer) {
      // Remove any extra text after the main answer
      answer = answer.split('\n')[0];
      // Ensure it ends properly
      if (!answer.endsWith('.') && !answer.endsWith('!') && !answer.endsWith('?')) {
        answer += '.';
      }
    }

    return answer || "Hey Memphis! I'm Memphis Maven and I'm here to help! For specific questions, call 211 for community services or 311 at (901)636-6500. Let's make Memphis awesome! 🎵";
  } catch (error) {
    console.error('AI response generation error:', error);
    
    // Provide a more helpful fallback based on the question
    const lowerPrompt = prompt.toLowerCase();
    
    // Check if question is Memphis, 211, 311, or 911 related
    const memphisKeywords = ['memphis', '211', '311', '911', 'emergency', 'city', 'government', 'service', 'report', 'complaint'];
    const isMemphisRelated = memphisKeywords.some(keyword => lowerPrompt.includes(keyword));
    
    if (!isMemphisRelated) {
      // Handle non-Memphis/211/311/911 questions
      return "I'm Memphis Maven, your Memphis 211/311/911 assistant. I only help with Memphis city services, 211 community services, 311 city services, or 911 emergencies. Please ask about Memphis services, call 211 for community help, 311 for city services, or 911 for emergencies. How can I help with Memphis services? 🎵";
    }
    
    // Handle Memphis-related questions
    if (lowerPrompt.includes('parking') || lowerPrompt.includes('permit')) {
      return "Hey Memphis! For parking permits: 1) Visit Public Works at 125 N. Main St., 2) Bring ID and vehicle registration, 3) Pay the fee ($25-50), 4) Or call 211 for community services or 311 at (901)636-6500. Let's get you sorted! 🚗";
    } else if (lowerPrompt.includes('garbage') || lowerPrompt.includes('trash') || lowerPrompt.includes('waste')) {
      return "Memphis, let's keep our city clean! Garbage collection: 1) Check your collection day at memphistn.gov, 2) Place bins 3 feet apart, 3) Call 211 for community services or 311 at (901)636-6500 for questions. Visit memphistn.gov too! 🗑️";
    } else if (lowerPrompt.includes('pothole') || lowerPrompt.includes('street') || lowerPrompt.includes('road')) {
      return "Memphis roads need love too! Here's how to report a pothole: 1) Call 311 at (901)636-6500, 2) Visit memphistn.gov and use the online reporting form, 3) Provide the exact location and description. We'll get those streets smooth! 🛣️";
    } else if (lowerPrompt.includes('water') || lowerPrompt.includes('bill') || lowerPrompt.includes('utility')) {
      return "Memphis utilities got you covered! Water bill options: 1) Pay online at memphistn.gov, 2) Call 311 at (901)636-6500 for assistance, 3) Visit City Hall at 125 N. Main St., 4) Set up auto-pay. Let's keep the water flowing! 💧";
    } else {
      return "Hey Memphis! I'm Memphis Maven, super excited to help! Call 211 for community services or 311 at (901)636-6500. Let's make Memphis awesome together! 🎵";
    }
  }
}

/**
 * Process a user question with multilingual support and semantic search
 * @param {string} question - User's question
 * @param {Array} similarPages - Pages from semantic search
 * @returns {Object} - Response with answer and language info
 */
async function processQuestion(question, similarPages = []) {
  try {
    // Detect language
    const detectedLang = detectLanguage(question);
    const languageCode = LANGUAGE_CODES[detectedLang];
    
    // Translate to English for processing
    const englishQuestion = await translateToEnglish(question, detectedLang);
    
    // Generate AI response
    const englishAnswer = await getAIResponse(englishQuestion, similarPages);
    
    // Translate back to original language
    const translatedAnswer = await translateFromEnglish(englishAnswer, detectedLang);
    
    return {
      answer: translatedAnswer,
      originalLanguage: SUPPORTED_LANGUAGES[detectedLang],
      languageCode: languageCode,
      confidence: similarPages.length > 0 ? similarPages[0].similarity : 0
    };
  } catch (error) {
    console.error('Question processing error:', error);
    return {
      answer: "I'm sorry, I'm having trouble processing your request right now. Please try calling Memphis 311 at (901)636-6500 for immediate assistance.",
      originalLanguage: 'English',
      languageCode: 'en',
      confidence: 0
    };
  }
}

/**
 * Calculate cosine similarity between two vectors
 * @param {Array} a - First vector
 * @param {Array} b - Second vector
 * @returns {number} - Cosine similarity score
 */
function cosineSimilarity(a, b) {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export {
  detectLanguage,
  translateToEnglish,
  translateFromEnglish,
  getEmbedding,
  getAIResponse,
  processQuestion,
  cosineSimilarity,
  SUPPORTED_LANGUAGES,
  LANGUAGE_CODES
};
