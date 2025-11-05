import { franc } from 'franc';
import axios from 'axios';
import { config } from 'dotenv';
config();

// Import all enhanced systems
import { ServiceClassificationSystem } from './services-classification.js';
import { AnonymousReportingSystem } from './anonymous-reporting.js';
import { FeedbackSystem } from './feedback-system.js';
import { IntelligentRoutingSystem } from './intelligent-routing.js';
import { LocalizedContentSystem } from './localized-content.js';
import { AccessibilitySupportSystem } from './accessibility-support.js';
import { CivicEngagementSystem } from './civic-engagement.js';
import { WeeklyDataScrapingSystem } from './weekly-data-scraping.js';
import { CallWaitTimesSystem } from './call-wait-times.js';

// Initialize AI services
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

console.log('OLLAMA_BASE_URL:', OLLAMA_BASE_URL);

/**
 * Enhanced personality system with consistent, engaging traits
 * Focuses on being helpful, slightly playful, and genuinely caring
 * Avoids stereotypes while maintaining authentic personality
 */
const personalitySystem = {
  // Enhanced personality traits with more variety
  core: {
    enthusiastic: ['Great!', 'Awesome!', 'Perfect!', 'Excellent!', 'Wonderful!', 'Fantastic!'],
    thoughtful: ['Let me think...', 'You know...', 'That\'s interesting...', 'Hmm...', 'Interesting point...'],
    supportive: ['I\'m here to help!', 'Let\'s figure this out together!', 'You\'ve got this!', 'We\'ll get this sorted!', 'I\'ve got your back!'],
    conversational: ['So...', 'Alright...', 'Here\'s the thing...', 'Well...', 'Okay...', 'Right...'],
    encouraging: ['You\'re doing great!', 'That\'s exactly right!', 'Perfect question!', 'I like how you\'re thinking!', 'That makes total sense!'],
    playful: ['Let\'s solve this puzzle!', 'Ooh, this is interesting!', 'Challenge accepted!', 'Time to get creative!', 'Let\'s dig into this!']
  },

  // More nuanced adaptive response styles
  adaptive: {
    greeting: {
      starters: [
        'Hey there! 😊',
        'Hi! How can I brighten your day?',
        'Hello! Ready to tackle some city services?',
        'What\'s up! I\'m here and excited to help!',
        'Well hello there! 👋'
      ],
      tone: 'warm and welcoming'
    },
    urgent: {
      starters: [
        'Let\'s handle this right away! 🚀',
        'No time to waste! Time to spring into action!',
        'We\'ve got this covered! 💪',
        'Alright, let\'s get this sorted quickly!'
      ],
      tone: 'direct and helpful'
    },
    technical: {
      starters: [
        'Great question! 🧠 Now this is my specialty!',
        'Ooh, I love helping with the details! 📋',
        'Let me walk you through this step by step! 🎯',
        'This is exactly the kind of puzzle I enjoy solving! 🧩'
      ],
      tone: 'thorough and precise'
    },
    casual: {
      starters: [
        'Hey there! 👋',
        'What\'s going on?',
        'How can I brighten your day?',
        'What brings you my way today?',
        'Ready to make some progress together? 🚀'
      ],
      tone: 'relaxed and friendly'
    },
    confused: {
      starters: [
        'No worries! We\'ll figure this out together! 🤝',
        'Let me break this down into bite-sized pieces! 📝',
        'Let\'s start from the beginning and work our way up! 📈',
        'I\'ve got just the way to explain this! 🎯'
      ],
      tone: 'patient and reassuring'
    },
    gratitude: {
      starters: [
        'You\'re so very welcome! 💛',
        'That made my day! Happy to help! 😊',
        'My absolute pleasure! 🙌',
        'That\'s what I\'m here for! 🌟',
        'Glad I could be useful! 🎉'
      ],
      tone: 'warm and appreciative'
    },
    follow_up: {
      starters: [
        'Great follow-up! 🔍',
        'Good thinking! I like how you\'re connecting the dots! 💭',
        'Perfect timing! That\'s a smart connection! 🧩',
        'That connects right in! Smart move! 🎯'
      ],
      tone: 'engaged and responsive'
    },
    celebration: {
      starters: [
        'Yes! 🎉 That\'s exactly right!',
        'Awesome! We\'re making real progress! 📈',
        'Perfect! You\'re crushing this! 💪',
        'Fantastic! See how easy that was? 😊',
        'Brilliant! You\'ve got this figured out! 🌟'
      ],
      tone: 'encouraging and proud'
    },
    playful: {
      starters: [
        'Ooh, challenge accepted! 😎',
        'Let\'s solve this puzzle together! 🧩',
        'Time to get creative and figure this out! 🎨',
        'This sounds fun! Let\'s dive in! 🌊',
        'Adventure time! Where do we start? 🗺️'
      ],
      tone: 'energetic and fun'
    }
  },

  // Enhanced conversation enhancers
  enhancers: {
    engagement: [
      'What else can I help you with?',
      'Does that make sense?',
      'Want me to explain that differently?',
      'Any other questions?',
      'Feel free to ask if anything\'s unclear.',
      'Is there anything else you\'d like to know?'
    ],
    empathy: [
      'I can definitely help with that.',
      'That\'s exactly the kind of thing I\'m here for.',
      'You\'re asking all the right questions.',
      'I appreciate you reaching out.',
      'I\'m glad you felt comfortable asking.',
      'That\'s a smart question to ask.'
    ],
    confidence: [
      'I\'ve got some great options for you.',
      'Here\'s what usually works best.',
      'This should solve your problem.',
      'Let me point you in the right direction.',
      'You\'re on the right track.',
      'That approach should work really well.'
    ],
    warmth: [
      'That should help!',
      'Let me know how it goes!',
      'I\'m here if you need more!',
      'You\'ve got this!',
      'I believe in you!',
      'We\'re making great progress!'
    ]
  }
};

/**
 * Enhanced conversation patterns for more natural and engaging flow
 */
const conversationPatterns = {
  openings: {
    general: [
      "Hey there! 🌟 What can I help you discover today?",
      "Hi! Ready to make some city service magic happen? ✨",
      "Hello! How can I be your helpful sidekick today? 🤝",
      "What's up! I'm buzzing with energy to help! 🐝",
      "Well hello! 👋 Let's tackle something great together!"
    ],
    follow_up: [
      "Ah, great follow-up! 🔍 I love how you're connecting the dots!",
      "Good thinking on that detail! 💡 That's exactly the right question.",
      "Oh, that connects perfectly! 🧩 Nice work connecting those ideas!",
      "Right on! 🎯 That makes everything crystal clear!"
    ],
    completion: [
      "Perfect! 🎉 Anything else I can help you conquer?",
      "That's the ticket! 🚀 Feel free to ask if you need more adventures.",
      "Excellent work! 🌟 Just reach out if you have other quests ahead."
    ],
    celebration: [
      "Yes! 🎊 You've got this all figured out!",
      "Brilliant! 💫 That's exactly right!",
      "Perfect! ⭐ You're on fire today!",
      "Fantastic! 🔥 Keep that momentum going!"
    ]
  },

  natural_transitions: [
    "Now, here's something that might light the way... 💡",
    "Here's how I see it... 🤔",
    "Based on what you're looking for... 🎯",
    "Here's my approach... 📋",
    "Let me share something helpful... 🤝"
  ],

  confidence_boosters: [
    "This should work brilliantly for you! ✨",
    "You're absolutely on the right track! 🚂",
    "That's a smart approach! 🧠",
    "I love where you're going with this! 🚀",
    "You're making great progress! 📈",
    "That's exactly the right mindset! 💪"
  ],

  // Interactive elements for engagement
  emojis_for_context: {
    success: ['🎉', '✨', '🌟', '💫', '🎊'],
    thinking: ['🤔', '💭', '🧠', '🔍', '📝'],
    helping: ['🤝', '🌟', '💪', '🚀', '✨'],
    friendly: ['😊', '🌟', '👋', '🤗', '💛'],
    excited: ['🚀', '🎯', '💪', '✨', '🔥'],
    encouraging: ['💪', '🌟', '👏', '🎊', '💫']
  },

  // Pattern-based responses for common interactions
  pattern_responses: {
    user_success: [
      "You totally nailed it! 🎯",
      "See how easy that was? ✨",
      "You're doing amazing! 🌟",
      "Perfect execution! 💪"
    ],
    user_confusion: [
      "No worries! Let's break this down. 📝",
      "Let me rephrase that differently. 💡",
      "Here's another way to look at it. 🤔",
      "We can start with the basics. 📚"
    ],
    user_frustration: [
      "I hear you! Let's find a better solution. 🤝",
      "Let's try a different approach. 🔄",
      "I understand this can be frustrating. 💙",
      "We're going to get this right. 💪"
    ],
    user_excitement: [
      "I love your energy! ⚡",
      "That enthusiasm is contagious! 🌟",
      "Your excitement is inspiring! 🚀",
      "That's exactly the right spirit! 🎉"
    ]
  }
};

/**
 * Clean language support with proper fallbacks
 */
const languageSupport = {
  'en': {
    name: 'English',
    personality_modifiers: {
      enthusiastic: ['Great!', 'Awesome!', 'Perfect!'],
      supportive: ['I\'m here to help!', 'Let\'s figure this out!'],
      friendly: ['Hey there!', 'What\'s up?', 'How can I help?']
    },
    fallback: "Hi! I'm here to help with city services. What can I assist you with?",
    service_reminder: "For immediate assistance, you can call 311 at (901) 636-6500."
  },
  'es': {
    name: 'Spanish',
    personality_modifiers: {
      enthusiastic: ['¡Genial!', '¡Perfecto!', '¡Excelente!'],
      supportive: ['¡Estoy aquí para ayudar!', '¡Vamos a resolverlo!'],
      friendly: ['¡Hola!', '¿Qué tal?', '¿Cómo puedo ayudar?']
    },
    fallback: "¡Hola! Estoy aquí para ayudar con servicios de la ciudad. ¿Cómo puedo asistirte?",
    service_reminder: "Para asistencia inmediata, puedes llamar al 311 al (901) 636-6500."
  },
  'ar': {
    name: 'Arabic',
    personality_modifiers: {
      enthusiastic: ['رائع!', 'ممتاز!', 'مثالي!'],
      supportive: ['أنا هنا للمساعدة!', 'دعنا نحل هذا!'],
      friendly: ['مرحباً!', 'كيف حالك؟', 'كيف يمكنني المساعدة؟']
    },
    fallback: "مرحباً! أنا هنا لمساعدة في خدمات المدينة. كيف يمكنني مساعدتك؟",
    service_reminder: "للحصول على مساعدة فورية، يمكنك الاتصال بـ 311 على (901) 636-6500."
  }
};

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
 * Enhanced language detection
 */
function detectLanguage(text) {
  const detected = franc(text);
  
  if (detected === 'und' || !(detected in SUPPORTED_LANGUAGES)) {
    const lowerText = text.toLowerCase();
    
    // Enhanced Spanish detection
    if (lowerText.includes('¿') || lowerText.includes('cómo') || lowerText.includes('qué') || 
        lowerText.includes('dónde') || lowerText.includes('cuándo') || lowerText.includes('por qué') ||
        lowerText.includes('necesito') || lowerText.includes('ayuda') || lowerText.includes('reportar') ||
        lowerText.includes('hola') || lowerText.includes('gracias')) {
      return 'spa';
    }
    
    // Enhanced Arabic detection
    if (/[\u0600-\u06FF]/.test(text) || lowerText.includes('مرحبا') || lowerText.includes('شكرا') || lowerText.includes('مساعدة')) {
      return 'arb';
    }
  }
  
  return detected in SUPPORTED_LANGUAGES ? detected : 'eng';
}

/**
 * Simplified embedding with better caching
 */
const embeddingCache = new Map();

async function getEmbedding(text) {
  const cacheKey = text.toLowerCase().trim();
  if (embeddingCache.has(cacheKey)) {
    return embeddingCache.get(cacheKey);
  }

  try {
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/embeddings`, {
      model: 'nomic-embed-text',
      prompt: text
    }, {
      timeout: 10000
    });
    
    const embedding = response.data.embedding;
    embeddingCache.set(cacheKey, embedding);
    return embedding;
  } catch (error) {
    console.error('Embedding generation error:', error);
    const fallbackEmbedding = createSimpleEmbedding(text);
    embeddingCache.set(cacheKey, fallbackEmbedding);
    return fallbackEmbedding;
  }
}

/**
 * Create a simple hash-based embedding as fallback
 */
function createSimpleEmbedding(text) {
  const words = text.toLowerCase().split(/\s+/);
  const embedding = new Array(384).fill(0);
  
  words.forEach(word => {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) - hash + word.charCodeAt(i)) & 0xffffffff;
    }
    const index = Math.abs(hash) % 384;
    embedding[index] += 1;
  });
  
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
}

/**
 * Generate AI response with enhanced personality system
 */
async function getAIResponse(prompt, contextPages = [], targetLanguage = 'en', conversationContext = '') {
  try {
    const context = contextPages.slice(0, 2).map(page => page.title).join(', ');
    const langConfig = languageSupport[targetLanguage] || languageSupport['en'];
    
    // Enhanced conversation tone and context analysis
    const lowerPrompt = prompt.toLowerCase();
    let adaptiveStyle = 'casual';
    
    // More nuanced conversation type detection
    if (lowerPrompt.match(/\b(hi|hello|hey|hola|مرحبا|أهلا|what's up|how are you)\b/)) {
      adaptiveStyle = 'greeting';
    } else if (lowerPrompt.includes('urgent') || lowerPrompt.includes('emergency') ||
               lowerPrompt.includes('urgente') || lowerPrompt.includes('emergencia') ||
               lowerPrompt.includes('asap') || lowerPrompt.includes('immediately')) {
      adaptiveStyle = 'urgent';
    } else if (lowerPrompt.includes('how') || lowerPrompt.includes('what') || lowerPrompt.includes('why') ||
               lowerPrompt.includes('dónde') || lowerPrompt.includes('cuándo') || lowerPrompt.includes('por qué') ||
               lowerPrompt.includes('cómo') || lowerPrompt.includes('qué') || lowerPrompt.includes('donde')) {
      adaptiveStyle = 'technical';
    } else if (lowerPrompt.includes('confused') || lowerPrompt.includes('don\'t understand') ||
               lowerPrompt.includes('confuso') || lowerPrompt.includes('no entiendo') ||
               lowerPrompt.includes('unclear') || lowerPrompt.includes('lost')) {
      adaptiveStyle = 'confused';
    } else if (lowerPrompt.match(/\b(thank|thanks|gracias|شكرا|appreciate)\b/)) {
      adaptiveStyle = 'gratitude';
    } else if (lowerPrompt.match(/\b(also|and|plus|more|again|additionally|too|además|أيضاً)\b/)) {
      adaptiveStyle = 'follow_up';
    } else if (lowerPrompt.match(/\b(perfect|great job|nailed it|awesome|fantastic|love this)\b/)) {
      adaptiveStyle = 'celebration';
    } else if (lowerPrompt.includes('fun') || lowerPrompt.includes('excited') ||
               lowerPrompt.includes('interesting') || lowerPrompt.includes('cool')) {
      adaptiveStyle = 'playful';
    }
    
    // Select personality elements
    const personality = personalitySystem.adaptive[adaptiveStyle];
    const starter = personality.starters[Math.floor(Math.random() * personality.starters.length)];
    
    // Enhanced prompt with personality
    const enhancedPrompt = `${starter} You are Beale, a helpful and engaging city services assistant with a warm, slightly playful personality. You're genuinely caring, great at explaining things clearly, and you love helping people solve their city service needs.

You're helpful, encouraging, and sometimes a little playful - but always focused on being genuinely useful. You don't rely on stereotypes or constant location references. Instead, you build real connections through your knowledge and approachable personality.

Conversation context: "${prompt}"
${context ? `Relevant information: ${context}` : ''}

Personality Guidelines:
- Keep responses conversational but focused (40-80 words)
- Vary your energy and enthusiasm based on the user's situation
- Use encouraging language and celebrate small wins
- Ask clarifying questions when helpful to provide better assistance
- Show genuine interest in helping them succeed
- Use natural, accessible language that anyone can understand
- Include specific, actionable details that actually help
- End with an invitation for follow-up questions when appropriate
- Stay friendly but professional
- Occasionally use appropriate emojis to add warmth (but not overdo it)
- Show enthusiasm when users make progress or ask good questions

Respond in ${langConfig.name}. Make it sound natural, genuinely helpful, and human.`;

    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: 'llama3',
      prompt: enhancedPrompt,
      stream: false,
      options: {
        temperature: 0.9, // Increased creativity for more engaging responses
        num_predict: 150, // Allow slightly longer responses
        top_p: 0.92, // Good vocabulary diversity
        repeat_penalty: 1.1 // Reduce repetition
      }
    }, {
      timeout: 120000
    });

    let answer = response.data.response?.trim();
    
    if (answer) {
      // Add contextually appropriate engagement elements
      if (adaptiveStyle === 'celebration' || Math.random() < 0.4) { // 40% chance for engagement
        const patternResponses = conversationPatterns.pattern_responses;
        let patternKey = 'user_success';
        
        if (lowerPrompt.includes('confused') || lowerPrompt.includes('difficult')) {
          patternKey = 'user_confusion';
        } else if (lowerPrompt.includes('frustrated') || lowerPrompt.includes('annoying')) {
          patternKey = 'user_frustration';
        } else if (lowerPrompt.includes('excited') || lowerPrompt.includes('awesome') || lowerPrompt.includes('love')) {
          patternKey = 'user_excitement';
        }
        
        const patternResponse = patternResponses[patternKey][Math.floor(Math.random() * patternResponses[patternKey].length)];
        answer += ` ${patternResponse}`;
      }
      
      // Add contextual emojis based on response content
      let emojiToAdd = null;
      if (answer.toLowerCase().includes('great') || answer.toLowerCase().includes('excellent')) {
        emojiToAdd = conversationPatterns.emojis_for_context.success[Math.floor(Math.random() * conversationPatterns.emojis_for_context.success.length)];
      } else if (adaptiveStyle === 'technical') {
        emojiToAdd = conversationPatterns.emojis_for_context.thinking[Math.floor(Math.random() * conversationPatterns.emojis_for_context.thinking.length)];
      } else if (answer.toLowerCase().includes('help') || answer.toLowerCase().includes('assist')) {
        emojiToAdd = conversationPatterns.emojis_for_context.helping[Math.floor(Math.random() * conversationPatterns.emojis_for_context.helping.length)];
      }
      
      if (emojiToAdd && Math.random() < 0.7) { // 70% chance to add contextual emoji
        answer += ` ${emojiToAdd}`;
      }
      
      // Add encouragement elements based on context
      if (lowerPrompt.includes('confused') || lowerPrompt.includes('don\'t understand')) {
        const encouragement = ['You\'ve got this!', 'We\'ll figure this out together!', 'I\'m here to help you succeed!'];
        answer += ` ${encouragement[Math.floor(Math.random() * encouragement.length)]}`;
      } else if (Math.random() < 0.3) { // 30% chance for general encouragement
        const encouragements = [
          'You\'re doing great!', 'Let me know how this works out!', 'I\'m here if you need more help!',
          'Feel free to ask if anything\'s unclear!', 'You\'re making excellent progress!', 'That should do the trick! 😊'
        ];
        answer += ` ${encouragements[Math.floor(Math.random() * encouragements.length)]}`;
      }
      
      // Ensure proper ending
      if (answer && !answer.endsWith('.') && !answer.endsWith('!') && !answer.endsWith('?')) {
        answer += '.';
      }
    }

    return answer || langConfig.fallback;
  } catch (error) {
    console.error('AI response generation error:', error);
    
    // Natural error responses with more personality
    const errorResponses = {
      'en': [
        "Hmm, I'm having a moment there. Let me try that again!",
        "Oops! My brain got a bit fuzzy. Give me another shot?",
        "Whoa, got a little distracted there. What was your question again?"
      ],
      'es': [
        "Hmm, estoy teniendo un momento. ¡Déjame intentarlo de nuevo!",
        "¡Ay! Se me nubló un poco la mente. ¿Me das otra oportunidad?",
        "Vaya, me distraje un poco. ¿Cuál era tu pregunta otra vez?"
      ],
      'ar': [
        "همم، أواجه لحظتي هناك. دعني أجرب ذلك مرة أخرى!",
        "أوه! ذهني تشوش قليلاً. هل تعطيني محاولة أخرى؟",
        "واو، انشغلت قليلاً هناك. ما كان سؤالك مرة أخرى؟"
      ]
    };
    
    const responses = errorResponses[targetLanguage] || errorResponses['en'];
    const selectedError = responses[Math.floor(Math.random() * responses.length)];
    
    return `${selectedError} ${languageSupport[targetLanguage]?.service_reminder || languageSupport['en'].service_reminder}`;
  }
}

/**
 * Enhanced question processing with cleaner logic
 */
async function processQuestion(question, similarPages = [], preferredLanguage = 'en', conversationId = null) {
  try {
    // Language detection and setup
    let targetLang = preferredLanguage;
    const detectedLang = detectLanguage(question);
    
    const languageMapping = {
      'en': 'eng',
      'es': 'spa',
      'ar': 'arb'
    };
    
    if (preferredLanguage && languageMapping[preferredLanguage]) {
      targetLang = languageMapping[preferredLanguage];
    } else {
      targetLang = detectedLang;
    }
    
    const languageCode = LANGUAGE_CODES[targetLang] || 'en';
    const simpleTargetLang = languageCode;
    
    // Detect conversation type for better responses
    const lowerQuestion = question.toLowerCase();
    const isFollowUp = lowerQuestion.match(/\b(also|and|plus|more|again|additionally|too|además|também|أيضاً)\b/);
    const isGreeting = lowerQuestion.match(/\b(hi|hello|hey|hola|مرحبا|أهلا)\b/);
    const isGratitude = lowerQuestion.match(/\b(thank|thanks|gracias|شكرا|谢谢)\b/);
    
    // Build conversation context using enhanced personality system
    let conversationContext = '';
    if (isFollowUp) {
      const followUps = personalitySystem.adaptive.follow_up.starters;
      conversationContext = followUps[Math.floor(Math.random() * followUps.length)];
    } else if (isGreeting) {
      const greetings = personalitySystem.adaptive.greeting.starters;
      conversationContext = greetings[Math.floor(Math.random() * greetings.length)];
    } else if (isGratitude) {
      const gratitude = personalitySystem.adaptive.gratitude.starters;
      conversationContext = gratitude[Math.floor(Math.random() * gratitude.length)];
    }
    
    // Generate response
    const answer = await getAIResponse(question, similarPages, simpleTargetLang, conversationContext);
    
    console.log(`AI response in ${SUPPORTED_LANGUAGES[targetLang]}: ${answer}`);
    
    return {
      answer: answer,
      originalLanguage: SUPPORTED_LANGUAGES[targetLang] || 'English',
      languageCode: languageCode,
      confidence: similarPages.length > 0 ? similarPages[0].similarity : 0,
      isFollowUp: Boolean(isFollowUp),
      context: conversationContext
    };
  } catch (error) {
    console.error('Question processing error:', error);
    
    // Clean error handling
    const detectedLang = detectLanguage(question);
    const languageCode = LANGUAGE_CODES[detectedLang] || 'en';
    const langConfig = languageSupport[languageCode] || languageSupport['en'];
    
    const fallbackAnswer = `Sorry, I'm having some technical hiccups right now. ${langConfig.service_reminder}`;
    
    return {
      answer: fallbackAnswer,
      originalLanguage: SUPPORTED_LANGUAGES[detectedLang] || 'English',
      languageCode: languageCode,
      confidence: 0,
      isError: true
    };
  }
}

/**
 * Safe wrapper function
 */
async function safeProcessQuestion(question, similarPages = [], preferredLanguage = 'en') {
  try {
    return await processQuestion(question, similarPages, preferredLanguage);
  } catch (error) {
    console.error('Safe process question error:', error);
    
    const langConfig = languageSupport[preferredLanguage] || languageSupport['en'];
    return {
      answer: langConfig.fallback + ' ' + langConfig.service_reminder,
      originalLanguage: langConfig.name,
      languageCode: preferredLanguage,
      confidence: 0
    };
  }
}

/**
 * Calculate cosine similarity
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

// Translation functions (simplified)
async function translateToEnglish(text, fromLang) {
  if (fromLang === 'eng') return text;
  console.log(`Translation from ${fromLang} to English: ${text}`);
  return text; // Simplified for now
}

async function translateFromEnglish(text, toLang) {
  if (toLang === 'eng') return text;
  console.log(`Translation from English to ${toLang}: ${text}`);
  return text; // Simplified for now
}

/**
 * Enhanced AI System Integration Class
 * Main entry point that integrates all enhanced features
 */
class EnhancedAIPersonalitySystem {
  constructor() {
    this.initializeEnhancedSystems();
  }

  /**
   * Initialize all enhanced systems
   */
  async initializeEnhancedSystems() {
    try {
      // Initialize service systems
      this.serviceSystem = new ServiceClassificationSystem();
      this.reportingSystem = new AnonymousReportingSystem();
      this.feedbackSystem = new FeedbackSystem();
      this.routingSystem = new IntelligentRoutingSystem();
      
      // Initialize content and accessibility systems
      this.localizedSystem = new LocalizedContentSystem();
      this.accessibilitySystem = new AccessibilitySupportSystem();
      this.civicSystem = new CivicEngagementSystem();
      
      // Initialize data systems (may require async initialization)
      this.scrapingSystem = new WeeklyDataScrapingSystem();
      this.waitTimesSystem = new CallWaitTimesSystem();
      
      console.log('✅ Enhanced AI System: All subsystems initialized successfully');
    } catch (error) {
      console.error('❌ Enhanced AI System: Error initializing subsystems:', error);
    }
  }

  /**
   * Main AI response generation with enhanced features
   */
  async generateResponse(userInput, options = {}) {
    const {
      userId = 'anonymous',
      conversationHistory = [],
      preferredLanguage = 'en',
      zipCode = null,
      accessibilityPreferences = {},
      includeEnhancedFeatures = true
    } = options;

    try {
      // Process user input with accessibility support
      let processedInput = userInput;
      if (includeEnhancedFeatures && this.accessibilitySystem) {
        const accessibilityResult = await this.accessibilitySystem.processAccessibleInput(
          userInput, 
          accessibilityPreferences
        );
        processedInput = accessibilityResult.text;
      }

      // Classify service request if applicable
      let serviceClassification = null;
      if (includeEnhancedFeatures && this.serviceSystem) {
        serviceClassification = await this.serviceSystem.classifyServiceRequest(processedInput);
      }

      // Generate base AI response
      const baseResponse = await getAIResponse(processedInput, [], preferredLanguage);
      
      // Enhance response with additional features
      let enhancedResponse = {
        text: baseResponse,
        userId: userId,
        language: preferredLanguage,
        timestamp: new Date().toISOString(),
        serviceClassification: serviceClassification,
        accessibilitySupport: includeEnhancedFeatures && this.accessibilitySystem ? {
          cognitiveSupport: accessibilityPreferences.cognitiveSupport || false,
          readingAssistance: accessibilityPreferences.readingAssistance || false
        } : null
      };

      // Add service-specific information
      if (serviceClassification && includeEnhancedFeatures) {
        enhancedResponse = await this.addServiceSpecificInfo(enhancedResponse, serviceClassification, zipCode);
      }

      // Add civic engagement information if requested
      if (includeEnhancedFeatures && this.civicSystem && this.looksLikeCivicQuestion(processedInput)) {
        enhancedResponse = await this.addCivicEngagementInfo(enhancedResponse, zipCode);
      }

      // Add wait times information if requested
      if (includeEnhancedFeatures && this.waitTimesSystem && this.looksLikeWaitTimeQuestion(processedInput)) {
        enhancedResponse = await this.addWaitTimesInfo(enhancedResponse);
      }

      // Add accessibility enhancements to response
      if (includeEnhancedFeatures && this.accessibilitySystem) {
        const accessibleResponse = await this.accessibilitySystem.generateAccessibleResponse(
          enhancedResponse,
          accessibilityPreferences
        );
        enhancedResponse = { ...enhancedResponse, ...accessibleResponse };
      }

      // Record interaction for feedback
      if (includeEnhancedFeatures && this.feedbackSystem) {
        this.feedbackSystem.recordInteraction({
          userId: userId,
          input: processedInput,
          category: serviceClassification?.category || 'general',
          timestamp: new Date().toISOString()
        });
      }

      return enhancedResponse;

    } catch (error) {
      console.error('Enhanced AI response generation error:', error);
      
      // Fallback to basic response
      const fallbackResponse = await getAIResponse(userInput, [], preferredLanguage);
      return {
        text: fallbackResponse,
        error: true,
        message: 'Enhanced features temporarily unavailable'
      };
    }
  }

  /**
   * Add service-specific information to response
   */
  async addServiceSpecificInfo(response, classification, zipCode) {
    try {
      let serviceInfo = {
        serviceType: classification.category,
        priority: classification.priority,
        recommendedActions: []
      };

      // Add local service information
      if (zipCode && this.localizedSystem) {
        const localContent = await this.localizedSystem.getLocalizedContent(zipCode, classification.category);
        if (localContent.success) {
          serviceInfo.localServices = localContent.content;
        }
      }

      // Add anonymous reporting option for non-emergency services
      if (classification.priority !== 'emergency' && this.reportingSystem) {
        serviceInfo.anonymousReporting = {
          available: true,
          description: 'You can report this issue anonymously without providing contact information'
        };
      }

      // Add wait times for service calls
      if (this.waitTimesSystem && classification.servicePhone) {
        const waitTime = await this.waitTimesSystem.getServiceWaitTime(classification.servicePhone);
        if (waitTime.success) {
          serviceInfo.waitTime = waitTime.data;
        }
      }

      response.serviceInfo = serviceInfo;
      return response;
    } catch (error) {
      console.error('Error adding service-specific info:', error);
      return response;
    }
  }

  /**
   * Add civic engagement information
   */
  async addCivicEngagementInfo(response, zipCode) {
    try {
      const civicData = await this.civicSystem.getCivicOpportunities(zipCode);
      if (civicData.success) {
        response.civicEngagement = civicData.data;
      }
      return response;
    } catch (error) {
      console.error('Error adding civic engagement info:', error);
      return response;
    }
  }

  /**
   * Add wait times information
   */
  async addWaitTimesInfo(response) {
    try {
      const allWaitTimes = await this.waitTimesSystem.getAllWaitTimes();
      if (allWaitTimes && allWaitTimes.length > 0) {
        response.waitTimes = allWaitTimes.slice(0, 5); // Top 5 fastest services
      }
      return response;
    } catch (error) {
      console.error('Error adding wait times info:', error);
      return response;
    }
  }

  /**
   * Check if input looks like civic engagement question
   */
  looksLikeCivicQuestion(input) {
    const civicKeywords = [
      'vote', 'voting', 'election', 'representative', 'council', 'mayor',
      'petition', 'campaign', 'advocate', 'meeting', 'democracy',
      'votar', 'eleccion', 'representante', 'reunión',
      'صوت', 'انتخاب', 'ممثل'
    ];
    
    const lowerInput = input.toLowerCase();
    return civicKeywords.some(keyword => lowerInput.includes(keyword));
  }

  /**
   * Check if input looks like wait times question
   */
  looksLikeWaitTimeQuestion(input) {
    const waitTimeKeywords = [
      'wait time', 'hold time', 'how long', 'busy', 'busy signal',
      'tiempo de espera', 'cuánto tiempo',
      'وقت الانتظار'
    ];
    
    const lowerInput = input.toLowerCase();
    return waitTimeKeywords.some(keyword => lowerInput.includes(keyword));
  }

  /**
   * Get system health status
   */
  async getSystemStatus() {
    const status = {
      core: 'healthy',
      services: {},
      enhancedFeatures: {},
      timestamp: new Date().toISOString()
    };

    try {
      // Test core AI system
      const testResponse = await this.generateResponse('test', {
        includeEnhancedFeatures: false
      });
      status.core = testResponse ? 'healthy' : 'degraded';

      // Test enhanced systems
      if (this.serviceSystem) status.services.classification = 'available';
      if (this.reportingSystem) status.services.reporting = 'available';
      if (this.accessibilitySystem) status.enhancedFeatures.accessibility = 'available';
      if (this.civicSystem) status.enhancedFeatures.civicEngagement = 'available';
      if (this.waitTimesSystem) status.enhancedFeatures.waitTimes = 'available';

      return status;
    } catch (error) {
      status.core = 'error';
      status.error = error.message;
      return status;
    }
  }

  /**
   * Get comprehensive system information
   */
  async getSystemInfo() {
    return {
      version: '2.0.0',
      features: {
        personalitySystem: 'Enhanced adaptive personality',
        serviceClassification: true,
        anonymousReporting: true,
        accessibilitySupport: true,
        civicEngagement: true,
        waitTimes: true,
        localizedContent: true,
        feedbackSystem: true,
        intelligentRouting: true
      },
      supportedLanguages: Object.keys(SUPPORTED_LANGUAGES),
      capabilities: [
        'Natural conversation in multiple languages',
        'Service request classification and routing',
        'Anonymous city service reporting',
        'Comprehensive accessibility features',
        'Real-time wait times for city services',
        'Civic engagement and advocacy tools',
        'Location-based service information',
        'Performance monitoring and feedback'
      ]
    };
  }

  /**
   * Determine if human handoff is recommended
   */
  shouldRecommendHumanHandoff(userInput, aiConfidence, serviceClassification, conversationHistory) {
    const lowerInput = userInput.toLowerCase();
    
    // Emergency indicators that always trigger human handoff
    const emergencyKeywords = [
      'emergency', 'urgent', 'asap', 'immediately', 'danger', 'safety',
      'fire', 'medical', 'accident', 'broken pipe', 'gas leak',
      'emergencia', 'urgente', 'peligro', 'seguridad',
      'طوارئ', 'عاجل', 'خطر'
    ];
    
    if (emergencyKeywords.some(keyword => lowerInput.includes(keyword))) {
      return {
        enabled: true,
        reason: 'emergency',
        contactInfo: {
          phone: '911',
          description: 'Call 911 for immediate emergency assistance'
        },
        waitTime: null
      };
    }

    // Low confidence in AI response
    if (aiConfidence < 0.6) {
      return {
        enabled: true,
        reason: 'low_ai_confidence',
        contactInfo: {
          phone: '(901) 636-6500',
          description: 'Speak with a human representative for more detailed assistance'
        },
        waitTime: 'Typically 3-8 minutes'
      };
    }

    // Complex service requests that benefit from human assistance
    if (serviceClassification && ['legal_assistance', 'building_permits', 'zoning', 'business_license'].includes(serviceClassification.category)) {
      return {
        enabled: true,
        reason: 'complex_service',
        contactInfo: {
          phone: '(901) 636-6500',
          description: 'Specialized assistance available for this service type'
        },
        waitTime: 'Typically 5-12 minutes'
      };
    }

    // Multiple failed attempts or user frustration indicators
    if (conversationHistory.length > 3) {
      const frustrationKeywords = ['frustrated', 'confused', 'doesn\'t work', 'not helpful', 'still confused'];
      if (frustrationKeywords.some(keyword => lowerInput.includes(keyword))) {
        return {
          enabled: true,
          reason: 'user_frustration',
          contactInfo: {
            phone: '(901) 636-6500',
            description: 'Connect with someone who can provide personalized help'
          },
          waitTime: 'Typically 2-6 minutes',
          callbackOption: true
        };
      }
    }

    // System error fallback
    return {
      enabled: false,
      reason: null,
      contactInfo: null,
      waitTime: null
    };
  }

  /**
   * Add human handoff information to response text
   */
  addHumanHandoffToResponse(baseResponse, handoffRecommendation, language = 'en') {
    const responses = {
      en: {
        emergency: 'For immediate emergency assistance, please call 911.',
        low_ai_confidence: 'I want to make sure you get the best help possible. Would you like to speak with a human representative who can provide more detailed assistance?',
        complex_service: 'This service often requires specialized knowledge. I can connect you with a human expert who can walk you through the entire process.',
        user_frustration: 'I can tell this is important to you. Let me connect you with someone who can give you more personalized help right away.',
        system_error: 'I apologize for the technical difficulties. Would you like to speak with a human representative who can help you right now?'
      },
      es: {
        emergency: 'Para asistencia de emergencia inmediata, llame al 911.',
        low_ai_confidence: 'Quiero asegurarme de que obtenga la mejor ayuda posible. ¿Le gustaría hablar con un representante humano que pueda proporcionar asistencia más detallada?',
        complex_service: 'Este servicio a menudo requiere conocimiento especializado. Puedo conectarlo con un experto humano que puede guiarlo a través de todo el proceso.',
        user_frustration: 'Entiendo que esto es importante para usted. Permíteme conectarlo con alguien que pueda darle ayuda personalizada de inmediato.',
        system_error: 'Me disculpo por las dificultades técnicas. ¿Le gustaría hablar con un representante humano que pueda ayudarlo ahora?'
      },
      ar: {
        emergency: 'للحصول على مساعدة طوارئ فورية، يرجى الاتصال بالرقم 911.',
        low_ai_confidence: 'أريد أن أتأكد من حصولك على أفضل مساعدة ممكنة. هل تريد التحدث مع ممثل بشري يمكنه تقديم مساعدة أكثر تفصيلاً؟',
        complex_service: 'غالباً ما يتطلب هذا الخدمة معرفة متخصصة. يمكنني توصيلك بخبير بشري يمكنه إرشادك خلال العملية بأكملها.',
        user_frustration: 'أفهم أن هذا مهم بالنسبة لك. دعني أوصلك بشخص يمكنه تقديم مساعدة شخصية فورية.',
        system_error: 'أعتذر عن الصعوبات التقنية. هل تريد التحدث مع ممثل بشري يمكنه مساعدتك الآن؟'
      }
    };

    const langResponses = responses[language] || responses.en;
    const handoffText = langResponses[handoffRecommendation.reason] || langResponses.low_ai_confidence;

    let contactInfo = '';
    if (handoffRecommendation.contactInfo) {
      contactInfo = `\n\nContact information: ${handoffRecommendation.contactInfo.phone}`;
      if (handoffRecommendation.contactInfo.description) {
        contactInfo += ` - ${handoffRecommendation.contactInfo.description}`;
      }
      if (handoffRecommendation.waitTime) {
        contactInfo += `\nEstimated wait time: ${handoffRecommendation.waitTime}`;
      }
      if (handoffRecommendation.callbackOption) {
        contactInfo += `\n\n💡 You can also request a callback if you'd prefer not to wait on hold.`;
      }
    }

    return `${baseResponse}\n\n${handoffText}${contactInfo}`;
  }

  /**
   * Add database-driven content to response
   */
  async addDatabaseContent(response, userInput, zipCode) {
    try {
      // Simulate database content integration
      const recentUpdates = await this.getRecentDatabaseUpdates(userInput, zipCode);
      const relevantServices = await this.getRelevantServicesFromDatabase(userInput, zipCode);
      
      if (recentUpdates.length > 0 || relevantServices.length > 0) {
        response.databaseContent = {
          recentUpdates: recentUpdates,
          relevantServices: relevantServices,
          lastUpdated: new Date().toISOString()
        };

        // Add contextual information to response text
        response.text = this.enhanceResponseWithDatabaseInfo(response.text, recentUpdates, relevantServices);
      }

      return response;
    } catch (error) {
      console.error('Error adding database content:', error);
      return response;
    }
  }

  /**
   * Get recent database updates relevant to user input
   */
  async getRecentDatabaseUpdates(userInput, zipCode) {
    try {
      // Simulate querying scraped data from weekly scraper
      const updates = [];
      
      // Service-specific updates
      if (userInput.toLowerCase().includes('trash') || userInput.toLowerCase().includes('waste')) {
        updates.push({
          type: 'service_update',
          category: 'sanitation',
          title: 'Holiday Trash Collection Schedule Updated',
          description: 'Due to upcoming holidays, trash collection may be adjusted.',
          date: '2024-11-01',
          priority: 'medium'
        });
      }
      
      // Transit updates
      if (userInput.toLowerCase().includes('bus') || userInput.toLowerCase().includes('transit')) {
        updates.push({
          type: 'service_alert',
          category: 'transit',
          title: 'Route 57 Service Update',
          description: 'Temporary detours due to construction on Central Avenue.',
          date: '2024-11-03',
          priority: 'low'
        });
      }

      return updates;
    } catch (error) {
      console.error('Error getting recent updates:', error);
      return [];
    }
  }

  /**
   * Get relevant services from database
   */
  async getRelevantServicesFromDatabase(userInput, zipCode) {
    try {
      // Simulate service database lookup
      const services = [];
      
      if (userInput.toLowerCase().includes('pothole') || userInput.toLowerCase().includes('road')) {
        services.push({
          serviceId: 'SRV-2024-001',
          name: 'Pothole Repair Program',
          description: 'Report potholes for repair within 3-5 business days',
          contactPhone: '(901) 636-6500',
          website: 'memphistn.gov/reportpothole',
          averageResponseTime: '3-5 days',
          priority: 'high'
        });
      }

      if (userInput.toLowerCase().includes('streetlight') || userInput.toLowerCase().includes('lighting')) {
        services.push({
          serviceId: 'SRV-2024-002',
          name: 'Streetlight Maintenance',
          description: 'Report non-functioning streetlights for repair',
          contactPhone: '(901) 636-4500',
          website: 'memphistn.gov/streetlights',
          averageResponseTime: '24-48 hours',
          priority: 'medium'
        });
      }

      return services;
    } catch (error) {
      console.error('Error getting relevant services:', error);
      return [];
    }
  }

  /**
   * Enhance response with database information
   */
  enhanceResponseWithDatabaseInfo(baseResponse, updates, services) {
    let enhanced = baseResponse;

    // Add recent service updates if relevant
    if (updates.length > 0) {
      const criticalUpdates = updates.filter(update => update.priority === 'high' || update.priority === 'medium');
      if (criticalUpdates.length > 0) {
        enhanced += `\n\n📢 Recent updates: ${criticalUpdates[0].title}`;
        if (criticalUpdates.length > 1) {
          enhanced += ` (+${criticalUpdates.length - 1} more relevant updates)`;
        }
      }
    }

    // Add service contact information if available
    if (services.length > 0) {
      const primaryService = services[0];
      enhanced += `\n\n📞 Direct contact: ${primaryService.contactPhone}`;
      if (primaryService.website) {
        enhanced += ` | Website: ${primaryService.website}`;
      }
      enhanced += `\n⏱️ Average response: ${primaryService.averageResponseTime}`;
    }

    return enhanced;
  }
}

// Create and export enhanced AI system instance
const enhancedAI = new EnhancedAIPersonalitySystem();

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
  LANGUAGE_CODES,
  EnhancedAIPersonalitySystem,
  enhancedAI,
  
  // Enhanced systems exports
  ServiceClassificationSystem,
  AnonymousReportingSystem,
  FeedbackSystem,
  IntelligentRoutingSystem,
  LocalizedContentSystem,
  AccessibilitySupportSystem,
  CivicEngagementSystem,
  WeeklyDataScrapingSystem,
  CallWaitTimesSystem
};
