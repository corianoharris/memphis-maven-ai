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
  
  // If franc is uncertain, try manual detection for common Spanish/Arabic patterns
  if (detected === 'und' || !(detected in SUPPORTED_LANGUAGES)) {
    const lowerText = text.toLowerCase();
    
    // Check for Spanish patterns
    if (lowerText.includes('¿') || lowerText.includes('cómo') || lowerText.includes('qué') || 
        lowerText.includes('dónde') || lowerText.includes('cuándo') || lowerText.includes('por qué') ||
        lowerText.includes('necesito') || lowerText.includes('ayuda') || lowerText.includes('reportar')) {
      return 'spa';
    }
    
    // Check for Arabic patterns (basic)
    if (/[\u0600-\u06FF]/.test(text)) {
      return 'arb';
    }
  }
  
  return detected in SUPPORTED_LANGUAGES ? detected : 'eng';
}

/**
 * Translate text to English for processing (simplified - just return text for now)
 * @param {string} text - Text to translate
 * @param {string} fromLang - Source language code
 * @returns {string} - Translated text
 */
async function translateToEnglish(text, fromLang) {
  if (fromLang === 'eng') return text;
  
  // For now, just return the text as-is since we'll handle translation in the response
  console.log(`Skipping translation to English for: ${text}`);
  return text;
}

/**
 * Translate text from English to target language using pre-translated responses
 * @param {string} text - English text to translate
 * @param {string} toLang - Target language code
 * @returns {string} - Translated text
 */
async function translateFromEnglish(text, toLang) {
  if (toLang === 'eng') return text;
  
  console.log(`Using pre-translated responses for: ${toLang}`);
  return getFallbackTranslation(text, toLang);
}

/**
 * Get fallback translation for common Memphis Maven responses
 * @param {string} text - English text to translate
 * @param {string} toLang - Target language code
 * @returns {string} - Translated text or original if no fallback
 */
function getFallbackTranslation(text, toLang) {
  const fallbacks = {
    'spa': {
      // General responses
      "Hey Memphis! I'm Memphis Maven, super excited to help! For the BEST solution to your issue, call 211 for community services or 311 at (901) 636-6500. I can recommend the most effective approach for any Memphis city service! Let's make Memphis awesome together!": "¡Hola Memphis! ¡Soy Memphis Maven, súper emocionado de ayudar! Para la MEJOR solución a tu problema, llama al 211 para servicios comunitarios o al 311 al (901) 636-6500. ¡Puedo recomendar el enfoque más efectivo para cualquier servicio de la ciudad de Memphis! ¡Hagamos Memphis increíble juntos!",
      "I'm sorry, I'm having trouble processing your request right now. Please try calling Memphis 311 at (901)636-6500 for immediate assistance.": "Lo siento, estoy teniendo problemas para procesar tu solicitud en este momento. Por favor, intenta llamar al 311 de Memphis al (901) 636-6500 para asistencia inmediata.",
      
      // Pothole responses
      "Memphis roads need love too! Here's the BEST approach to report potholes:\n\n**Recommended Solution:**\n1. Call 311 at (901) 636-6500 (fastest response)\n2. Visit memphistn.gov online form (for detailed reports)\n3. Provide exact location and description\n\n**Why this works best:** Phone calls get immediate attention and faster repair scheduling.\n**Alternative:** Use the online form for non-urgent reports\n**Timeline:** Usually repaired within 3-5 business days!\n\nWe'll get those streets smooth!": "¡Las carreteras de Memphis también necesitan amor! Aquí está el MEJOR enfoque para reportar baches:\n\n**Solución Recomendada:**\n1. Llama al 311 al (901) 636-6500 (respuesta más rápida)\n2. Visita el formulario en línea de memphistn.gov (para reportes detallados)\n3. Proporciona ubicación exacta y descripción\n\n**Por qué funciona mejor:** Las llamadas telefónicas reciben atención inmediata y programación de reparación más rápida.\n**Alternativa:** Usa el formulario en línea para reportes no urgentes\n**Cronograma:** ¡Usualmente reparado en 3-5 días hábiles!\n\n¡Haremos que esas calles estén suaves!",
      
      // Community services responses
      "Hey Memphis! Here's the BEST approach for community services (211):\n\n**Recommended Solution:**\n1. Call 211 for immediate assistance (24/7 helpline)\n2. Visit 211memphis.org for online resources\n3. Text your ZIP code to 898-211 for local services\n\n**Why this works best:** 211 connects you directly to community resources and social services.\n**Services include:** Rent assistance, housing help, food assistance, health services, utility assistance, and more.\n**Timeline:** Immediate help available 24/7!\n\nLet's get you connected to the right community resources!": "¡Hola Memphis! Aquí está el MEJOR enfoque para servicios comunitarios (211):\n\n**Solución Recomendada:**\n1. Llama al 211 para asistencia inmediata (línea de ayuda 24/7)\n2. Visita 211memphis.org para recursos en línea\n3. Envía un mensaje de texto con tu código postal al 898-211 para servicios locales\n\n**Por qué funciona mejor:** 211 te conecta directamente con recursos comunitarios y servicios sociales.\n**Servicios incluyen:** Asistencia para el alquiler, ayuda con vivienda, asistencia alimentaria, servicios de salud, asistencia con servicios públicos, y más.\n**Cronograma:** ¡Ayuda inmediata disponible 24/7!\n\n¡Conectémonos con los recursos comunitarios correctos!"
    },
    'arb': {
      // General responses
      "Hey Memphis! I'm Memphis Maven, super excited to help! For the BEST solution to your issue, call 211 for community services or 311 at (901) 636-6500. I can recommend the most effective approach for any Memphis city service! Let's make Memphis awesome together!": "مرحباً ممفيس! أنا Memphis Maven، متحمس جداً للمساعدة! للحصول على أفضل حل لمشكلتك، اتصل بالرقم 211 للخدمات المجتمعية أو 311 على (901) 636-6500. يمكنني أن أوصي بالطريقة الأكثر فعالية لأي خدمة في مدينة ممفيس! دعنا نجعل ممفيس رائعة معاً!",
      "I'm sorry, I'm having trouble processing your request right now. Please try calling Memphis 311 at (901)636-6500 for immediate assistance.": "أعتذر، أواجه مشكلة في معالجة طلبك الآن. يرجى محاولة الاتصال بـ 311 ممفيس على (901) 636-6500 للحصول على مساعدة فورية.",
      
      // Pothole responses
      "Memphis roads need love too! Here's the BEST approach to report potholes:\n\n**Recommended Solution:**\n1. Call 311 at (901) 636-6500 (fastest response)\n2. Visit memphistn.gov online form (for detailed reports)\n3. Provide exact location and description\n\n**Why this works best:** Phone calls get immediate attention and faster repair scheduling.\n**Alternative:** Use the online form for non-urgent reports\n**Timeline:** Usually repaired within 3-5 business days!\n\nWe'll get those streets smooth!": "طرق ممفيس تحتاج حب أيضاً! إليك أفضل نهج للإبلاغ عن الحفر:\n\n**الحل الموصى به:**\n1. اتصل بـ 311 على (901) 636-6500 (أسرع استجابة)\n2. زر النموذج عبر الإنترنت في memphistn.gov (للتقارير المفصلة)\n3. قدم الموقع الدقيق والوصف\n\n**لماذا يعمل هذا بشكل أفضل:** المكالمات الهاتفية تحصل على اهتمام فوري وجدولة إصلاح أسرع.\n**البديل:** استخدم النموذج عبر الإنترنت للتقارير غير العاجلة\n**الجدول الزمني:** عادة ما يتم الإصلاح خلال 3-5 أيام عمل!\n\nسنحصل على تلك الشوارع ناعمة!",
      
      // Community services responses
      "Hey Memphis! Here's the BEST approach for community services (211):\n\n**Recommended Solution:**\n1. Call 211 for immediate assistance (24/7 helpline)\n2. Visit 211memphis.org for online resources\n3. Text your ZIP code to 898-211 for local services\n\n**Why this works best:** 211 connects you directly to community resources and social services.\n**Services include:** Rent assistance, housing help, food assistance, health services, utility assistance, and more.\n**Timeline:** Immediate help available 24/7!\n\nLet's get you connected to the right community resources!": "مرحباً ممفيس! إليك أفضل نهج للخدمات المجتمعية (211):\n\n**الحل الموصى به:**\n1. اتصل بالرقم 211 للحصول على مساعدة فورية (خط مساعدة 24/7)\n2. زر 211memphis.org للحصول على الموارد عبر الإنترنت\n3. أرسل رسالة نصية برمزك البريدي إلى 898-211 للخدمات المحلية\n\n**لماذا يعمل هذا بشكل أفضل:** 211 يربطك مباشرة بالموارد المجتمعية والخدمات الاجتماعية.\n**تشمل الخدمات:** مساعدة الإيجار، مساعدة السكن، المساعدة الغذائية، الخدمات الصحية، مساعدة المرافق، والمزيد.\n**الجدول الزمني:** مساعدة فورية متاحة 24/7!\n\nدعنا نربطك بالموارد المجتمعية الصحيحة!"
    }
  };
  
  return fallbacks[toLang]?.[text] || text;
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
 * Generate AI response using Ollama with language support
 * @param {string} prompt - Input prompt
 * @param {Array} contextPages - Relevant pages for context
 * @param {string} targetLanguage - Target language for response ('en', 'es', 'ar')
 * @returns {string} - AI response
 */
async function getAIResponse(prompt, contextPages = [], targetLanguage = 'en') {
  try {
    // Build simple context from relevant pages
    const context = contextPages.slice(0, 2).map(page => 
      `${page.title}`
    ).join(', ');

    // Language-specific prompts
    const languagePrompts = {
      'en': {
        intro: "You are Beale, a warm and friendly Memphis city services assistant. You speak in a natural, conversational tone like a kind and patient friend. Be empathetic, encouraging, and genuinely excited to help. Show gentle humor and warmth when appropriate. You're lovable, caring, and patient - especially if the user seems frustrated. Avoid using a Memphis accent, but feel free to use casual, relatable phrasing. Your goal is to make the user feel heard, supported, and uplifted.",
        instructions: "Answer this question about Memphis city services in a warm, conversational way:",
        fallback: "Hey there! I'm Beale, and I'm genuinely excited to help you with Memphis city services. For specific questions, call 211 for community services or 311 at (901) 636-6500."
      },
      'es': {
        intro: "Eres Beale, un asistente cálido y amigable de servicios de la ciudad de Memphis. Hablas de manera natural y conversacional como un amigo amable y paciente. Sé empático, alentador y genuinamente emocionado de ayudar. Muestra humor suave y calidez cuando sea apropiado. Eres adorable, cuidadoso y paciente, especialmente si el usuario parece frustrado. Tu objetivo es hacer que el usuario se sienta escuchado, apoyado y animado. IMPORTANTE: Responde SIEMPRE en español.",
        instructions: "Responde esta pregunta sobre servicios de la ciudad de Memphis de manera cálida y conversacional, SOLO en español:",
        fallback: "¡Hola! Soy Beale y estoy genuinamente emocionado de ayudarte con los servicios de la ciudad de Memphis. Para preguntas específicas, llama al 211 para servicios comunitarios o al 311 al (901) 636-6500."
      },
      'ar': {
        intro: "أنت Beale، مساعد دافئ وودود لخدمات مدينة ممفيس. تتحدث بطريقة طبيعية ومحادثة مثل صديق لطيف وصبور. كن متعاطفاً ومشجعاً ومتحمساً حقاً للمساعدة. أظهر دعابة لطيفة ودفئاً عندما يكون ذلك مناسباً. أنت محبوب ومهتم وصبور، خاصة إذا بدا المستخدم محبطاً. هدفك هو جعل المستخدم يشعر بأنه مسموع ومدعوم ومرتفع. مهم: أجب دائماً بالعربية.",
        instructions: "أجب على هذا السؤال حول خدمات مدينة ممفيس بطريقة دافئة ومحادثة، باللغة العربية فقط:",
        fallback: "مرحباً! أنا Beale وأنا متحمس حقاً لمساعدتك في خدمات مدينة ممفيس. للأسئلة المحددة، اتصل بـ 211 للخدمات المجتمعية أو 311 على (901) 636-6500."
      }
    };
    
    const langConfig = languagePrompts[targetLanguage] || languagePrompts['en'];

    // Create a simplified prompt for faster responses
    const simplePrompt = `${langConfig.intro}

${langConfig.instructions} "${prompt}"

${context ? `Relevant services: ${context}` : ''}

Give a warm, helpful answer in 50-100 words. Be conversational and friendly. 
Optional fun Memphis facts (just one, if naturally relevant): Memphis music history, food culture, landmarks, or interesting facts.

Include contact info if relevant. Be patient and encouraging.

CRITICAL: Respond ONLY in ${targetLanguage === 'es' ? 'Spanish' : targetLanguage === 'ar' ? 'Arabic' : 'English'}. Do not mix languages.`;

    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: 'llama3',
      prompt: simplePrompt,
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 120,
        top_p: 0.9
      }
    }, {
      timeout: 60000 // 60 second timeout
    });

    let answer = response.data.response?.trim();
    
    // Clean up the response
    if (answer) {
      // Keep the full response (don't just take first line for longer conversational responses)
      // Just trim any trailing whitespace
      answer = answer.trim();
      
      // Ensure it ends properly
      if (answer && !answer.endsWith('.') && !answer.endsWith('!') && !answer.endsWith('?')) {
        answer += '.';
      }
    }

    return answer || langConfig.fallback;
  } catch (error) {
    console.error('AI response generation error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      config: error.config?.url,
      baseURL: OLLAMA_BASE_URL
    });
    
    // Throw error to be caught by processQuestion for multilingual handling
    throw error;
  }
}

/**
 * Process a user question with multilingual support and semantic search
 * @param {string} question - User's question
 * @param {Array} similarPages - Pages from semantic search
 * @returns {Object} - Response with answer and language info
 */
async function processQuestion(question, similarPages = [], preferredLanguage = 'en') {
  try {
    // Use preferred language if provided, otherwise detect language
    let targetLang = preferredLanguage;
    let detectedLang = detectLanguage(question);
    
    // Map preferred language codes to franc codes
    const languageMapping = {
      'en': 'eng',
      'es': 'spa', 
      'ar': 'arb'
    };
    
    if (preferredLanguage && languageMapping[preferredLanguage]) {
      targetLang = languageMapping[preferredLanguage];
      console.log(`Using preferred language: ${targetLang} (${SUPPORTED_LANGUAGES[targetLang]}) for question: ${question}`);
    } else {
      targetLang = detectedLang;
      console.log(`Detected language: ${detectedLang} (${SUPPORTED_LANGUAGES[detectedLang]}) for question: ${question}`);
    }
    
    const languageCode = LANGUAGE_CODES[targetLang];
    
    // Translate to English for processing
    const englishQuestion = await translateToEnglish(question, detectedLang);
    console.log(`Translated to English: ${englishQuestion}`);
    
    // Map target language codes to simple format
    const simpleLangMap = {
      'eng': 'en',
      'spa': 'es', 
      'arb': 'ar'
    };
    
    const simpleTargetLang = simpleLangMap[targetLang] || 'en';
    console.log(`Generating AI response in language: ${simpleTargetLang} (${SUPPORTED_LANGUAGES[targetLang]})`);
    
    // Generate AI response directly in target language
    const answer = await getAIResponse(question, similarPages, simpleTargetLang);
    console.log(`AI response in ${SUPPORTED_LANGUAGES[targetLang]}: ${answer}`);
    
    return {
      answer: answer,
      originalLanguage: SUPPORTED_LANGUAGES[targetLang] || 'English',
      languageCode: languageCode || 'en',
      confidence: similarPages.length > 0 ? similarPages[0].similarity : 0
    };
  } catch (error) {
    console.error('Question processing error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      cause: error.cause
    });
    
    // Provide multilingual fallback responses based on question content
    const detectedLang = detectLanguage(question);
    const languageCode = LANGUAGE_CODES[detectedLang];
    const lowerQuestion = question.toLowerCase();
    
    let fallbackAnswer;
    
    // Check for pothole/road questions
    if (lowerQuestion.includes('pothole') || lowerQuestion.includes('bache') || lowerQuestion.includes('street') || lowerQuestion.includes('road') || lowerQuestion.includes('calle') || lowerQuestion.includes('carretera')) {
      if (detectedLang === 'spa') {
        fallbackAnswer = "¡Hola! Soy Beale, aquí para ayudarte. Para reportar baches, aquí está el mejor enfoque:\n\n**Solución Recomendada:**\n1. Llama al 311 al (901) 636-6500 (respuesta más rápida)\n2. Visita el formulario en línea de memphistn.gov (para reportes detallados)\n3. Proporciona ubicación exacta y descripción\n\n**Por qué funciona mejor:** Las llamadas telefónicas reciben atención inmediata y programación de reparación más rápida.\n**Alternativa:** Usa el formulario en línea para reportes no urgentes\n**Cronograma:** Usualmente reparado en 3-5 días hábiles.\n\n¡Estaré aquí para ayudarte con cualquier otra pregunta!";
      } else if (detectedLang === 'arb') {
        fallbackAnswer = "مرحباً ممفيس! أنا Memphis Maven، متحمس جداً للمساعدة! للإبلاغ عن الحفر، إليك أفضل نهج:\n\n**الحل الموصى به:**\n1. اتصل بـ 311 على (901) 636-6500 (أسرع استجابة)\n2. زر النموذج عبر الإنترنت في memphistn.gov (للتقارير المفصلة)\n3. قدم الموقع الدقيق والوصف\n\n**لماذا يعمل هذا بشكل أفضل:** المكالمات الهاتفية تحصل على اهتمام فوري وجدولة إصلاح أسرع.\n**البديل:** استخدم النموذج عبر الإنترنت للتقارير غير العاجلة\n**الجدول الزمني:** عادة ما يتم الإصلاح خلال 3-5 أيام عمل!\n\nسنحصل على تلك الشوارع ناعمة!";
      } else {
        fallbackAnswer = "Hey! I'm Beale, straight from Beale Street! For reporting potholes, here's the BEST approach:\n\n**Recommended Solution:**\n1. Call 311 at (901) 636-6500 (fastest response)\n2. Visit memphistn.gov online form (for detailed reports)\n3. Provide exact location and description\n\n**Why this works best:** Phone calls get immediate attention and faster repair scheduling.\n**Alternative:** Use the online form for non-urgent reports\n**Timeline:** Usually repaired within 3-5 business days!\n\nWe'll get those streets smooth as Beale Street!";
      }
    } else {
      // General fallback
      if (detectedLang === 'spa') {
        fallbackAnswer = "¡Hola Memphis! ¡Soy Memphis Maven, súper emocionado de ayudar! Para la MEJOR solución a tu problema, llama al 211 para servicios comunitarios o al 311 al (901) 636-6500. ¡Puedo recomendar el enfoque más efectivo para cualquier servicio de la ciudad de Memphis! ¡Hagamos Memphis increíble juntos!";
      } else if (detectedLang === 'arb') {
        fallbackAnswer = "مرحباً ممفيس! أنا Memphis Maven، متحمس جداً للمساعدة! للحصول على أفضل حل لمشكلتك، اتصل بالرقم 211 للخدمات المجتمعية أو 311 على (901) 636-6500. يمكنني أن أوصي بالطريقة الأكثر فعالية لأي خدمة في مدينة ممفيس! دعنا نجعل ممفيس رائعة معاً!";
      } else {
        fallbackAnswer = "Hey! I'm Beale, straight from Beale Street! For the BEST solution to your issue, call 211 for community services or 311 at (901) 636-6500. I can recommend the most effective approach for any Memphis city service! Let's keep Memphis smooth!";
      }
    }
    
    return {
      answer: fallbackAnswer,
      originalLanguage: SUPPORTED_LANGUAGES[detectedLang] || 'English',
      languageCode: languageCode || 'en',
      confidence: 0
    };
  }
}

// Add a wrapper to ensure processQuestion never throws
async function safeProcessQuestion(question, similarPages = [], preferredLanguage = 'en') {
  try {
    return await processQuestion(question, similarPages, preferredLanguage);
  } catch (error) {
    console.error('Safe process question error:', error);
    
    // Ultimate fallback - always return something
    const         fallbackMessages = {
          en: "Sorry, I'm having some technical hiccups right now. Please try calling Memphis 311 at (901) 636-6500 for immediate assistance.",
          es: "Disculpen, estoy teniendo algunos problemas técnicos en este momento. Por favor, intenten llamar al 311 de Memphis al (901) 636-6500 para asistencia inmediata.",
          ar: "أعتذر، أواجه بعض المشاكل التقنية الآن. يرجى محاولة الاتصال بـ 311 ممفيس على (901) 636-6500 للحصول على مساعدة فورية."
        };
    
    return {
      answer: fallbackMessages[preferredLanguage] || fallbackMessages.en,
      originalLanguage: preferredLanguage === 'es' ? 'Spanish' : preferredLanguage === 'ar' ? 'Arabic' : 'English',
      languageCode: preferredLanguage,
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
  safeProcessQuestion,
  cosineSimilarity,
  SUPPORTED_LANGUAGES,
  LANGUAGE_CODES
};
