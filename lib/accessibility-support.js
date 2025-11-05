/**
 * Accessibility Support System
 * Comprehensive accessibility features for inclusive chatbot interaction
 */

import { TextDecoder } from 'util';

class AccessibilitySupportSystem {
  constructor() {
    this.voiceSettings = {
      rate: 1.0,
      pitch: 1.0,
      volume: 0.8,
      voice: null
    };

    this.readingPreferences = {
      sentenceReading: true,
      wordReading: false,
      characterReading: false,
      pauseAtPunctuation: true,
      speed: 'normal'
    };

    this.visualPreferences = {
      highContrast: false,
      largeText: false,
      colorBlindFriendly: false,
      reducedMotion: false,
      fontSize: 'medium',
      colorScheme: 'auto'
    };

    this.navigationPreferences = {
      keyboardOnly: false,
      screenReaderOptimized: false,
      focusIndicators: true,
      tabOrder: 'logical',
      skipLinks: true
    };

    this.cognitivePreferences = {
      simplifiedLanguage: false,
      stepByStep: true,
      extraExplanations: false,
      breakIntoChunks: true,
      keyPointsHighlighted: true
    };

    this.initializeAccessibilityFeatures();
  }

  /**
   * Initialize accessibility features
   */
  initializeAccessibilityFeatures() {
    this.setupSpeechRecognition();
    this.setupTextToSpeech();
    this.setupKeyboardNavigation();
    this.setupScreenReaderSupport();
  }

  /**
   * Configure speech recognition for accessibility
   */
  setupSpeechRecognition() {
    try {
      if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        this.speechRecognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        this.speechRecognition.continuous = false;
        this.speechRecognition.interimResults = true;
        this.speechRecognition.lang = 'en-US';
        
        this.speechRecognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
          this.handleSpeechInput(transcript);
        };

        this.speechRecognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          this.handleSpeechError(event.error);
        };
      }
    } catch (error) {
      console.log('Speech recognition not available in this environment');
    }
  }

  /**
   * Configure text-to-speech for accessibility
   */
  setupTextToSpeech() {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        this.speechSynthesis = window.speechSynthesis;
        
        // Load available voices
        const loadVoices = () => {
          const voices = this.speechSynthesis.getVoices();
          if (voices.length > 0) {
            this.voiceSettings.voice = voices.find(voice =>
              voice.lang.startsWith('en') && voice.name.includes('Female')
            ) || voices[0];
          }
        };

        loadVoices();
        
        if (this.speechSynthesis.onvoiceschanged !== undefined) {
          this.speechSynthesis.onvoiceschanged = loadVoices;
        }
      }
    } catch (error) {
      console.log('Text-to-speech not available in this environment');
    }
  }

  /**
   * Setup keyboard navigation support
   */
  setupKeyboardNavigation() {
    try {
      if (typeof document !== 'undefined') {
        document.addEventListener('keydown', (event) => {
          this.handleKeyboardInput(event);
        });

        // Set up focus management
        this.setupFocusManagement();
      }
    } catch (error) {
      console.log('Keyboard navigation not available in this environment');
    }
  }

  /**
   * Setup focus management for accessibility
   */
  setupFocusManagement() {
    try {
      if (typeof document !== 'undefined') {
        // Add skip link for keyboard users
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'sr-only focus:not-sr-only';
        skipLink.addEventListener('click', (event) => {
          event.preventDefault();
          const mainContent = document.getElementById('main-content');
          if (mainContent) {
            mainContent.focus();
          }
        });

        document.body.insertBefore(skipLink, document.body.firstChild);
      }
    } catch (error) {
      console.log('Focus management not available in this environment');
    }
  }

  /**
   * Setup screen reader support
   */
  setupScreenReaderSupport() {
    try {
      // Add ARIA attributes
      this.addAriaAttributes();
      
      // Set up live regions for dynamic updates
      this.setupLiveRegions();
    } catch (error) {
      console.log('Screen reader support not available in this environment');
    }
  }

  /**
   * Add ARIA attributes for screen readers
   */
  addAriaAttributes() {
    // Mark main content area
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer) {
      chatContainer.setAttribute('role', 'main');
      chatContainer.setAttribute('aria-label', 'Chat conversation with AI assistant');
    }

    // Mark input area
    const inputArea = document.querySelector('.input-area');
    if (inputArea) {
      inputArea.setAttribute('role', 'form');
      inputArea.setAttribute('aria-label', 'Chat message input');
    }
  }

  /**
   * Setup live regions for screen reader announcements
   */
  setupLiveRegions() {
    // Create polite live region for status updates
    const politeLiveRegion = document.createElement('div');
    politeLiveRegion.setAttribute('aria-live', 'polite');
    politeLiveRegion.setAttribute('aria-atomic', 'true');
    politeLiveRegion.setAttribute('class', 'sr-only');
    politeLiveRegion.id = 'polite-live-region';
    document.body.appendChild(politeLiveRegion);

    // Create assertive live region for urgent updates
    const assertiveLiveRegion = document.createElement('div');
    assertiveLiveRegion.setAttribute('aria-live', 'assertive');
    assertiveLiveRegion.setAttribute('aria-atomic', 'true');
    assertiveLiveRegion.setAttribute('class', 'sr-only');
    assertiveLiveRegion.id = 'assertive-live-region';
    document.body.appendChild(assertiveLiveRegion);
  }

  /**
   * Process user input with accessibility considerations
   */
  async processAccessibleInput(userInput, preferences = {}) {
    try {
      let processedInput = {
        text: userInput,
        accessibility: {
          voiceInput: preferences.voiceInput || false,
          speechMode: preferences.speechMode || 'text',
          cognitiveSupport: preferences.cognitiveSupport || false,
          readingAssistance: preferences.readingAssistance || false
        },
        timestamp: new Date().toISOString()
      };

      // Apply cognitive support if enabled
      if (preferences.cognitiveSupport) {
        processedInput = this.applyCognitiveSupport({...processedInput});
      }

      return processedInput;

    } catch (error) {
      console.error('Error processing accessible input:', error);
      throw error;
    }
  }

  /**
   * Apply cognitive accessibility support
   */
  applyCognitiveSupport(input) {
    // Break complex messages into simpler parts
    if (input.text.length > 100) {
      input.chunks = this.breakIntoChunks(input.text);
      input.originalText = input.text;
    }

    // Add simplified language markers
    input.simplifiedLanguage = this.simplifyLanguage(input.text);
    
    // Extract key points
    input.keyPoints = this.extractKeyPoints(input.text);

    return input;
  }

  /**
   * Break text into manageable chunks
   */
  breakIntoChunks(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chunks = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > 100) {
        if (currentChunk) {
          chunks.push(currentChunk.trim() + '.');
        }
        currentChunk = sentence;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim() + '.');
    }

    return chunks;
  }

  /**
   * Simplify complex language
   */
  simplifyLanguage(text) {
    // Simple word replacements for common complex terms
    const simplifications = {
      'utilize': 'use',
      'facilitate': 'help',
      'implement': 'start',
      'request': 'ask',
      'assistance': 'help',
      'regarding': 'about',
      'maintain': 'keep',
      'commence': 'start',
      'terminate': 'end',
      'additional': 'more',
      'currently': 'now',
      'previously': 'before'
    };

    let simplified = text;
    Object.entries(simplifications).forEach(([complex, simple]) => {
      const regex = new RegExp(complex, 'gi');
      simplified = simplified.replace(regex, simple);
    });

    return simplified;
  }

  /**
   * Extract key points from text
   */
  extractKeyPoints(text) {
    // Simple keyword extraction for key points
    const keywords = ['need', 'want', 'help', 'problem', 'issue', 'question', 'urgent', 'emergency'];
    const keyPoints = [];
    
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    for (const sentence of sentences) {
      const hasKeyword = keywords.some(keyword => 
        sentence.toLowerCase().includes(keyword)
      );
      if (hasKeyword) {
        keyPoints.push(sentence.trim());
      }
    }

    return keyPoints;
  }

  /**
   * Generate accessible response
   */
  async generateAccessibleResponse(responseData, preferences = {}) {
    try {
      let accessibleResponse = {
        text: responseData.text,
        metadata: {
          accessibility: true,
          timestamp: new Date().toISOString(),
          preferences: preferences
        }
      };

      // Apply reading assistance
      if (preferences.readingAssistance) {
        accessibleResponse = this.addReadingAssistance(accessibleResponse);
      }

      // Add cognitive support
      if (preferences.cognitiveSupport) {
        accessibleResponse = this.addCognitiveSupport(accessibleResponse);
      }

      // Add navigation hints
      if (preferences.navigationAssistance) {
        accessibleResponse.navigationHints = this.generateNavigationHints(responseData);
      }

      // Announce to screen readers
      this.announceToScreenReader(accessibleResponse.text, preferences.urgency || 'polite');

      return accessibleResponse;

    } catch (error) {
      console.error('Error generating accessible response:', error);
      throw error;
    }
  }

  /**
   * Add reading assistance features
   */
  addReadingAssistance(response) {
    // Add pronunciation guides for difficult words
    response.pronunciationGuides = this.addPronunciationGuides(response.text);
    
    // Highlight key terms
    response.highlightedText = this.highlightKeyTerms(response.text);
    
    // Add reading pace indicators
    response.readingPace = this.analyzeReadingPace(response.text);

    return response;
  }

  /**
   * Add pronunciation guides
   */
  addPronunciationGuides(text) {
    const difficultWords = {
      'receive': '/rɪˈsiːv/',
      'height': '/haɪt/',
      'through': '/θruː/',
      'rhythm': '/ˈrɪðəm/',
      'pronunciation': '/prəˌnʌnsiˈeɪʃən/',
      'restaurant': '/ˈrestərənt/',
      'comfortable': '/ˈkʌmftəbl/'
    };

    const guides = [];
    const words = text.split(/\s+/);
    
    words.forEach((word, index) => {
      const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
      if (difficultWords[cleanWord]) {
        guides.push({
          word: word,
          pronunciation: difficultWords[cleanWord],
          position: index
        });
      }
    });

    return guides;
  }

  /**
   * Highlight key terms for easier reading
   */
  highlightKeyTerms(text) {
    const keyTerms = ['emergency', 'urgent', 'important', 'required', 'deadline', 'contact', 'phone', 'address'];
    let highlightedText = text;

    keyTerms.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      highlightedText = highlightedText.replace(regex, `<mark class="key-term">$&</mark>`);
    });

    return highlightedText;
  }

  /**
   * Analyze reading pace for text
   */
  analyzeReadingPace(text) {
    const wordCount = text.split(/\s+/).length;
    const estimatedReadingTime = Math.ceil(wordCount / 200); // Average 200 WPM

    return {
      wordCount: wordCount,
      estimatedTime: `${estimatedReadingTime} minute${estimatedReadingTime !== 1 ? 's' : ''}`,
      difficulty: this.calculateTextDifficulty(text),
      recommendation: this.getReadingRecommendation(wordCount, estimatedReadingTime)
    };
  }

  /**
   * Calculate text difficulty
   */
  calculateTextDifficulty(text) {
    // Simple difficulty calculation based on sentence length and complex words
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/);
    
    const avgSentenceLength = words.length / sentences.length;
    const complexWords = words.filter(word => word.length > 6).length;
    const complexWordRatio = complexWords / words.length;

    if (avgSentenceLength < 10 && complexWordRatio < 0.1) return 'easy';
    if (avgSentenceLength < 20 && complexWordRatio < 0.2) return 'moderate';
    return 'complex';
  }

  /**
   * Get reading recommendation
   */
  getReadingRecommendation(wordCount, readingTime) {
    if (wordCount > 200) {
      return 'This text is quite long. Consider reading it in smaller sections.';
    }
    if (readingTime > 3) {
      return 'Take your time reading this information.';
    }
    return 'This should be a quick read.';
  }

  /**
   * Add cognitive support to response
   */
  addCognitiveSupport(response) {
    // Add step-by-step breakdown
    response.steps = this.breakIntoSteps(response.text);
    
    // Add summary
    response.summary = this.generateSummary(response.text);
    
    // Add action items
    response.actions = this.extractActionItems(response.text);

    return response;
  }

  /**
   * Break response into actionable steps
   */
  breakIntoSteps(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const steps = [];
    let stepNumber = 1;

    sentences.forEach(sentence => {
      const trimmed = sentence.trim();
      if (trimmed) {
        steps.push({
          number: stepNumber++,
          instruction: trimmed,
          completed: false
        });
      }
    });

    return steps;
  }

  /**
   * Generate summary of response
   */
  generateSummary(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length <= 1) return text;

    // Simple summary - first sentence or up to 25 words
    const firstSentence = sentences[0];
    const summaryWords = firstSentence.split(/\s+/);
    
    if (summaryWords.length <= 25) {
      return firstSentence;
    }
    
    return summaryWords.slice(0, 25).join(' ') + '...';
  }

  /**
   * Extract action items from response
   */
  extractActionItems(text) {
    const actionWords = ['call', 'visit', 'click', 'go', 'send', 'email', 'request', 'schedule'];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const actions = [];

    sentences.forEach(sentence => {
      const lowerSentence = sentence.toLowerCase();
      const hasActionWord = actionWords.some(word => lowerSentence.includes(word));
      
      if (hasActionWord) {
        actions.push({
          description: sentence.trim(),
          type: this.determineActionType(sentence),
          priority: this.determineActionPriority(sentence)
        });
      }
    });

    return actions;
  }

  /**
   * Determine action type
   */
  determineActionType(sentence) {
    const sentenceLower = sentence.toLowerCase();
    
    if (sentenceLower.includes('call') || sentenceLower.includes('phone')) return 'call';
    if (sentenceLower.includes('visit') || sentenceLower.includes('go to')) return 'visit';
    if (sentenceLower.includes('click') || sentenceLower.includes('website')) return 'website';
    if (sentenceLower.includes('email')) return 'email';
    
    return 'other';
  }

  /**
   * Determine action priority
   */
  determineActionPriority(sentence) {
    const sentenceLower = sentence.toLowerCase();
    
    if (sentenceLower.includes('urgent') || sentenceLower.includes('emergency')) return 'high';
    if (sentenceLower.includes('asap') || sentenceLower.includes('soon')) return 'medium';
    
    return 'low';
  }

  /**
   * Generate navigation hints for screen readers
   */
  generateNavigationHints(responseData) {
    const hints = [];

    if (responseData.actions && responseData.actions.length > 0) {
      hints.push('This response includes action items');
    }

    if (responseData.steps && responseData.steps.length > 0) {
      hints.push('Step-by-step instructions are provided');
    }

    if (responseData.links || responseData.contactInfo) {
      hints.push('Additional contact information is available');
    }

    return hints;
  }

  /**
   * Announce text to screen reader
   */
  announceToScreenReader(text, priority = 'polite') {
    try {
      if (typeof document !== 'undefined') {
        const liveRegion = document.getElementById(`${priority}-live-region`);
        if (liveRegion) {
          // Clear existing content first
          liveRegion.textContent = '';
          
          // Small delay before setting new content
          setTimeout(() => {
            liveRegion.textContent = text;
          }, 100);
        }
      }
    } catch (error) {
      console.log('Screen reader announcement not available in this environment');
    }
  }

  /**
   * Handle speech input
   */
  handleSpeechInput(transcript) {
    // Process speech input with accessibility context
    console.log('Speech input received:', transcript);
    
    // Announce to user
    this.announceToScreenReader('Voice input received', 'polite');
  }

  /**
   * Handle speech recognition errors
   */
  handleSpeechError(error) {
    const errorMessages = {
      'no-speech': 'No speech was detected. Please try again.',
      'audio-capture': 'Microphone access is required for voice input.',
      'not-allowed': 'Microphone access was denied. Please enable microphone permissions.',
      'network': 'Network error occurred during speech recognition.',
      'service-not-allowed': 'Speech recognition service is not available.'
    };

    const message = errorMessages[error] || 'Speech recognition error occurred.';
    this.announceToScreenReader(message, 'assertive');
  }

  /**
   * Handle keyboard navigation
   */
  handleKeyboardInput(event) {
    const { key, ctrlKey, altKey } = event;

    // Handle accessibility shortcuts
    if (altKey) {
      switch (key) {
        case '1':
          event.preventDefault();
          this.focusMainContent();
          break;
        case '2':
          event.preventDefault();
          this.focusInputArea();
          break;
        case '3':
          event.preventDefault();
          this.toggleSpeechInput();
          break;
      }
    }

    // Handle tab navigation improvements
    if (key === 'Tab' && !event.ctrlKey) {
      this.enhanceTabNavigation();
    }
  }

  /**
   * Focus main content area
   */
  focusMainContent() {
    const mainContent = document.querySelector('#main-content');
    if (mainContent) {
      mainContent.focus();
      this.announceToScreenReader('Focused on main content area', 'polite');
    }
  }

  /**
   * Focus input area
   */
  focusInputArea() {
    const inputArea = document.querySelector('input, textarea');
    if (inputArea) {
      inputArea.focus();
      this.announceToScreenReader('Focused on input area', 'polite');
    }
  }

  /**
   * Toggle speech input
   */
  toggleSpeechInput() {
    if (this.speechRecognition) {
      if (this.speechRecognition.running) {
        this.speechRecognition.stop();
        this.announceToScreenReader('Voice input stopped', 'polite');
      } else {
        this.speechRecognition.start();
        this.announceToScreenReader('Voice input started', 'polite');
      }
    }
  }

  /**
   * Enhance tab navigation
   */
  enhanceTabNavigation() {
    // Ensure proper focus indicators
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    focusableElements.forEach(element => {
      element.addEventListener('focus', () => {
        element.setAttribute('data-focused', 'true');
      });

      element.addEventListener('blur', () => {
        element.removeAttribute('data-focused');
      });
    });
  }

  /**
   * Text-to-speech functionality
   */
  speakText(text, options = {}) {
    if (!this.speechSynthesis) {
      return false;
    }

    // Cancel any ongoing speech
    this.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply voice settings
    if (this.voiceSettings.voice) {
      utterance.voice = this.voiceSettings.voice;
    }
    utterance.rate = options.rate || this.voiceSettings.rate;
    utterance.pitch = options.pitch || this.voiceSettings.pitch;
    utterance.volume = options.volume || this.voiceSettings.volume;

    // Event handlers
    utterance.onstart = () => {
      this.announceToScreenReader('Reading text aloud', 'polite');
    };

    utterance.onend = () => {
      this.announceToScreenReader('Finished reading', 'polite');
    };

    utterance.onerror = (event) => {
      console.error('Text-to-speech error:', event);
      this.announceToScreenReader('Text-to-speech error', 'assertive');
    };

    this.speechSynthesis.speak(utterance);
    return true;
  }

  /**
   * Stop text-to-speech
   */
  stopSpeaking() {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
      this.announceToScreenReader('Stopped reading', 'polite');
    }
  }

  /**
   * Update user preferences
   */
  updatePreferences(newPreferences) {
    Object.assign(this.visualPreferences, newPreferences.visual || {});
    Object.assign(this.readingPreferences, newPreferences.reading || {});
    Object.assign(this.cognitivePreferences, newPreferences.cognitive || {});
    Object.assign(this.navigationPreferences, newPreferences.navigation || {});
  }

  /**
   * Get accessibility recommendations
   */
  getAccessibilityRecommendations(userInput) {
    const recommendations = [];

    // Check text complexity
    if (userInput.length > 100) {
      recommendations.push('This message is quite long. Consider breaking it into smaller parts.');
    }

    // Check for technical terms
    const technicalTerms = ['API', 'system', 'protocol', 'algorithm', 'database'];
    const hasTechnicalTerms = technicalTerms.some(term => 
      userInput.toLowerCase().includes(term.toLowerCase())
    );
    
    if (hasTechnicalTerms) {
      recommendations.push('Consider explaining technical terms for better understanding.');
    }

    // Check for urgency indicators
    const urgencyWords = ['urgent', 'emergency', 'asap', 'critical'];
    const hasUrgency = urgencyWords.some(word => 
      userInput.toLowerCase().includes(word)
    );

    if (hasUrgency) {
      recommendations.push('This appears urgent. Ensure clear, immediate response.');
    }

    return recommendations;
  }
}

// CSS styles for accessibility features
const accessibilityStyles = `
/* Screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}

/* Focus indicators */
[data-focused="true"] {
  outline: 3px solid #0066cc !important;
  outline-offset: 2px !important;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .chat-message {
    border: 2px solid currentColor;
  }
  
  .input-area {
    border: 2px solid currentColor;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Key term highlighting */
.key-term {
  background-color: #ffff99;
  font-weight: bold;
  padding: 2px 4px;
  border-radius: 3px;
}

/* Large text support */
.large-text {
  font-size: 1.25em;
}

.extra-large-text {
  font-size: 1.5em;
}

/* Focus trap for modals */
.focus-trap {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

/* Skip link styles */
a.skip-link {
  position: absolute;
  left: -9999px;
  z-index: 9999;
  padding: 8px 16px;
  background: #000;
  color: #fff;
  text-decoration: none;
}

a.skip-link:focus {
  left: 6px;
  top: 7px;
}
`;

export {
  AccessibilitySupportSystem,
  accessibilityStyles
};