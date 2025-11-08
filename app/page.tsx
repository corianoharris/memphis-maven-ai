/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <explanation> */
/** biome-ignore-all lint/a11y/noSvgWithoutTitle: <explanation> */
/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <explanation> */
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import Filter from 'bad-words';
import OptimizedImage, { usePreloadCriticalImages } from '../components/OptimizedImage';

interface Message
{
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  relevantPages?: Array<{
    title: string;
    url: string;
    similarity: number;
  }>;
  attachedFiles?: Array<{
    name: string;
    size: number;
    type: string;
    preview?: string | null;
  }>;
  images?: Array<{
    url: string;
    alt?: string;
    caption?: string;
  }>;
}

interface ChatResponse
{
  answer: string;
  conversationId: string;
  language: string;
  languageCode: string;
  confidence: number;
  relevantPages: Array<{
    title: string;
    url: string;
    similarity: number;
  }>;
  timestamp: string;
}

export default function Home()
{
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [userId] = useState(() => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voiceCommand, setVoiceCommand] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showNotifications, setShowNotifications] = useState(true);
  const [quickAccessCollapsed, setQuickAccessCollapsed] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showTrashDropdown, setShowTrashDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [quickAccessData, setQuickAccessData] = useState<any>(null);
  const [quickAccessLoading, setQuickAccessLoading] = useState(false);
  const [expandedResources, setExpandedResources] = useState<{ [key: string]: boolean }>({});
  const [images, setImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageSlider, setShowImageSlider] = useState(false);
  const [formattedTimes, setFormattedTimes] = useState<{ [key: string]: string }>({});
  const [isClient, setIsClient] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<{ [key: string]: string }>({});
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState<string>('');
  const [imageLoadingStates, setImageLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'es' | 'ar'>('en');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inappropriateMessageCount, setInappropriateMessageCount] = useState(0);
  const [conversationEnded, setConversationEnded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const pendingMessageRef = useRef<string>(''); // Store message temporarily for voice

  // Initialize i18n hook after all state hooks
  const { t, i18n } = useTranslation();

  // Preload critical images for better performance
  usePreloadCriticalImages();

  // Enhanced fallback function that tries i18n first, then direct lookup
  const tFallback = (key: string) =>
  {
    // First try i18n if available and initialized
    if (i18n.isInitialized && t)
    {
      try
      {
        const result = t(key);
        if (result && result !== key) return result;
      } catch (e)
      {
        console.log('i18n error for key:', key, e);
      }
    }

    // If i18n fails, try language-specific fallbacks
    const fallbacks: { [key: string]: { [lang: string]: string } } = {
      'ui.reportIssuesHelp': {
        'en': 'Report issues and get help',
        'es': 'Reporta problemas y obtén ayuda',
        'ar': 'الإبلاغ عن المشاكل والحصول على المساعدة'
      },
      'ui.findCityServices': {
        'en': 'Find city services and resources',
        'es': 'Encuentra servicios y recursos de la ciudad',
        'ar': 'البحث عن خدمات وموارد المدينة'
      },
      'ui.clickToTryExample': {
        'en': 'Click to try this example',
        'es': 'Haz clic para probar este ejemplo',
        'ar': 'انقر لتجربة هذا المثال'
      },
      'ui.communityServices': {
        'en': 'Community Services',
        'es': 'Servicios Comunitarios',
        'ar': 'الخدمات المجتمعية'
      },
      'ui.cityServices': {
        'en': 'City Services',
        'es': 'Servicios de la Ciudad',
        'ar': 'خدمات المدينة'
      },
      'ui.emergency': {
        'en': 'Emergency',
        'es': 'Emergencia',
        'ar': 'طوارئ'
      },
      'ui.multilingualHelp': {
        'en': 'Get help in English, Spanish, or Arabic',
        'es': 'Obtén ayuda en inglés, español o árabe',
        'ar': 'احصل على مساعدة باللغة الإنجليزية أو الإسبانية أو العربية'
      }
    };

    return fallbacks[key]?.[selectedLanguage] || fallbacks[key]?.['en'] || key;
  };

  // Sync selectedLanguage with i18n language on initial load only
  useEffect(() =>
  {
    if (!i18n.isInitialized) return;

    // Set initial language based on i18n's detected/saved language
    let initialLang = i18n.language as 'en' | 'es' | 'ar';

    // Normalize the language code to handle variants like 'en-US' -> 'en'
    if (initialLang && initialLang.includes('-'))
    {
      initialLang = initialLang.split('-')[0] as 'en' | 'es' | 'ar';
    }

    // Ensure we only use supported languages, default to English
    if (!['en', 'es', 'ar'].includes(initialLang))
    {
      initialLang = 'en';
    }

    console.log('Initial language from i18n:', initialLang, 'Current selectedLanguage:', selectedLanguage);

    // Only update if different to avoid unnecessary updates
    if (selectedLanguage !== initialLang)
    {
      console.log('Syncing selectedLanguage with i18n initial language');
      setSelectedLanguage(initialLang);
    }
  }, [i18n.isInitialized]); // Only run when i18n is initialized

  // Close dropdowns when clicking outside
  useEffect(() =>
  {
    const handleClickOutside = (event: MouseEvent) =>
    {
      const target = event.target as HTMLElement;

      // Don't close if clicking on a dropdown button
      if (target.closest('button[data-language-toggle]') ||
        target.closest('div[data-language-selector]') ||
        target.closest('button[data-trash-toggle]') ||
        target.closest('button[data-menu-toggle]') ||
        target.closest('div[data-three-dots-dropdown]'))
      {
        return;
      }

      // Close all dropdowns if clicking outside
      setShowLanguageDropdown(false);
      setShowTrashDropdown(false);
      setShowDropdown(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Language change handler
  const changeLanguage = (lang: 'en' | 'es' | 'ar') =>
  {
    console.log('Changing language to:', lang);

    // Update local state first
    setSelectedLanguage(lang);

    // Manually save to localStorage to ensure it's persisted
    try
    {
      localStorage.setItem('i18nextLng', lang);
      console.log('Saved to localStorage:', lang);
    } catch (e)
    {
      console.error('Error saving to localStorage:', e);
    }

    // Then update i18n (this should also save to localStorage)
    i18n.changeLanguage(lang).then(() =>
    {
      console.log('Language changed successfully to:', lang);
      console.log('i18n.language is now:', i18n.language);
      console.log('localStorage i18nextLng:', localStorage.getItem('i18nextLng'));
    }).catch((err) =>
    {
      console.error('Error changing language:', err);
    });

    setInput(''); // Clear input when language changes
  };

  // Function to generate dynamic thinking message based on user input
  const getThinkingMessage = (): string =>
  {
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.text.trim();

    if (!lastUserMessage)
    {
      return selectedLanguage === 'es' ? 'Beale está preparando algo genial...' :
        selectedLanguage === 'ar' ? 'بيل يستعد لعمل شيء رائع...' :
          "Beale's getting ready to help...";
    }

    // Beale's personality: helpful, professional, knowledgeable
    const thinkingMessages: { [key: string]: string } = {
      // Greetings
      'hello': selectedLanguage === 'es' ? 'Hola, estoy revisando tu mensaje...' :
        selectedLanguage === 'ar' ? 'مرحباً، أراجع رسالتك...' :
          "Hello, I'm reviewing your message...",
      'hi': selectedLanguage === 'es' ? 'Hola, revisando tu pregunta...' :
        selectedLanguage === 'ar' ? 'مرحباً، أراجع سؤالك...' :
          "Hi, reviewing your question...",
      'hey': selectedLanguage === 'es' ? 'Hola, revisando tu consulta...' :
        selectedLanguage === 'ar' ? 'مرحباً، أراجع استفسارك...' :
          "Hey, reviewing your inquiry...",

      // Assistance requests
      'i need': selectedLanguage === 'es' ? 'Entiendo, voy a buscar la información...' :
        selectedLanguage === 'ar' ? 'أفهم، سأبحث عن المعلومات...' :
          "I understand, let me find that information...",
      'i want': selectedLanguage === 'es' ? 'Perfecto, voy a ayudarte...' :
        selectedLanguage === 'ar' ? 'ممتاز، سأساعدك...' :
          "Perfect, let me help you with that...",
      'can you': selectedLanguage === 'es' ? 'Por supuesto, voy a revisar...' :
        selectedLanguage === 'ar' ? 'بالطبع، سأراجع...' :
          "Of course, let me check that...",
      'help me': selectedLanguage === 'es' ? 'Voy a ayudarte ahora...' :
        selectedLanguage === 'ar' ? 'سأساعدك الآن...' :
          "Let me help you with that...",

      // Information requests
      'how do': selectedLanguage === 'es' ? 'Voy a explicarte el proceso...' :
        selectedLanguage === 'ar' ? 'سأشرح لك العملية...' :
          "Let me explain the process...",
      'what': selectedLanguage === 'es' ? 'Buscando esa información...' :
        selectedLanguage === 'ar' ? 'أبحث عن تلك المعلومات...' :
          "Looking up that information...",
      'where': selectedLanguage === 'es' ? 'Encontrando la ubicación...' :
        selectedLanguage === 'ar' ? 'أجد الموقع...' :
          "Finding that location...",
      'when': selectedLanguage === 'es' ? 'Verificando los horarios...' :
        selectedLanguage === 'ar' ? 'أتحقق من المواعيد...' :
          "Checking the schedule...",
      'why': selectedLanguage === 'es' ? 'Voy a explicarte el porqué...' :
        selectedLanguage === 'ar' ? 'سأشرح السبب...' :
          "Let me explain the reason...",

      // Gratitude
      'thank': selectedLanguage === 'es' ? 'De nada, ¿algo más en lo que pueda ayudar?' :
        selectedLanguage === 'ar' ? 'على الرحب، هل يمكنني مساعدتك في شيء آخر؟' :
          "You're welcome, anything else I can help with?",

      // Reporting
      'report': selectedLanguage === 'es' ? 'Te ayudo con el reporte...' :
        selectedLanguage === 'ar' ? 'أساعدك في الإبلاغ...' :
          "I'll help you with the reporting...",
      'there is': selectedLanguage === 'es' ? 'Entiendo, voy a ayudar con eso...' :
        selectedLanguage === 'ar' ? 'أفهم، سأساعد في ذلك...' :
          "I understand, let me help with that...",

      // Emergency
      'emergency': selectedLanguage === 'es' ? 'Emergencia detectada, voy a responder inmediatamente...' :
        selectedLanguage === 'ar' ? 'تم اكتشاف طوارئ، سأرد فوراً...' :
          "Emergency detected, responding immediately...",
      'urgent': selectedLanguage === 'es' ? 'Entendido, voy a atender esto con prioridad...' :
        selectedLanguage === 'ar' ? 'فهمت، سأعالج هذا بأولوية...' :
          "Understood, addressing this with priority...",

      // Problems
      'problem': selectedLanguage === 'es' ? 'No te preocupes, voy a resolver esto...' :
        selectedLanguage === 'ar' ? 'لا تقلق، سأحل هذا...' :
          "No worries, let me resolve this...",
      'issue': selectedLanguage === 'es' ? 'Voy a identificar y resolver el problema...' :
        selectedLanguage === 'ar' ? 'سأحدد وأحل المشكلة...' :
          "Let me identify and resolve this issue...",
    };

    // Check for specific patterns first (full message)
    const fullMessageLower = lastUserMessage.toLowerCase();

    // Check for emergency patterns first
    if (fullMessageLower.includes('emergency') || fullMessageLower.includes('urgent'))
    {
      return thinkingMessages['emergency'];
    }

    // Check for problem/issue patterns
    if (fullMessageLower.includes('problem') || fullMessageLower.includes('issue'))
    {
      return thinkingMessages['problem'];
    }

    // Check other patterns
    for (const [pattern, message] of Object.entries(thinkingMessages))
    {
      if (fullMessageLower.includes(pattern))
      {
        return message;
      }
    }

    // Generate dynamic message based on first few words with personality
    const words = lastUserMessage.split(' ').slice(0, 2);
    const firstWord = words[0].toLowerCase();

    // Question words get Beale\'s analytical personality
    if (firstWord === 'how' || firstWord === 'what' || firstWord === 'where' || firstWord === 'when' || firstWord === 'why')
    {
      return selectedLanguage === 'es'
        ? `Beale analiza "${words.join(' ')}" 🎯`
        : selectedLanguage === 'ar'
          ? `بيل يحلل "${words.join(' ')}" 🎯`
          : `Beale\'s analyzing "${words.join(' ')}" 🎯`;
    }

    // Default professional message
    const defaultMessages = [
      selectedLanguage === 'es' ? 'Estoy revisando la información...' :
        selectedLanguage === 'ar' ? 'أراجع المعلومات...' :
          'I\'m reviewing the information...',

      selectedLanguage === 'es' ? 'Buscando en la base de conocimiento...' :
        selectedLanguage === 'ar' ? 'أبحث في قاعدة المعرفة...' :
          'Searching the knowledge base...',

      selectedLanguage === 'es' ? 'Preparando una respuesta...' :
        selectedLanguage === 'ar' ? 'أجهز الرد...' :
          'Preparing a response...',
    ];

    return defaultMessages[Math.floor(Math.random() * defaultMessages.length)];
  };

  // Close dropdown when clicking outside
  useEffect(() =>
  {
    const handleClickOutside = (event: MouseEvent) =>
    {
      const target = event.target as HTMLElement;
      const languageSelector = document.querySelector('[data-language-selector]');
      const languageToggle = document.querySelector('[data-language-toggle]');

      if (
        showLanguageSelector &&
        languageSelector &&
        !languageSelector.contains(target) &&
        languageToggle &&
        !languageToggle.contains(target)
      )
      {
        setShowLanguageSelector(false);
      }
    };

    if (showLanguageSelector)
    {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showLanguageSelector]);


  // Function to translate resource titles with automatic key generation
  const translateResourceTitle = (title: string) =>
  {
    // Try different key patterns to find a match
    const patterns = [
      // Pattern with triple underscores for " - "
      title.replace(/\s*-\s*/g, '___'),
      // Pattern with single underscores
      title.replace(/[^a-zA-Z0-9]/g, '_'),
      // Pattern with double underscores for spaces
      title.replace(/\s+/g, '__')
    ];

    // Try each pattern to find a translation
    for (const pattern of patterns)
    {
      const key = `resources.${pattern}`;
      const translatedTitle = tFallback(key);
      if (translatedTitle !== key)
      {
        return translatedTitle;
      }
    }

    // If no translation found, return the original title
    return title;
  };

  const scrollToNewMessage = () =>
  {
    // Small delay to ensure DOM has updated and animations have started
    setTimeout(() =>
    {
      const messageElements = document.querySelectorAll('[data-message-id]');
      if (messageElements.length > 0)
      {
        const lastMessage = messageElements[messageElements.length - 1] as HTMLElement;
        lastMessage.scrollIntoView({
          behavior: 'smooth',
          block: 'start', // This ensures the top of the message (including avatar) is visible
          inline: 'nearest'
        });
      }
    }, 100); // Small delay to allow for DOM updates and animation start
  };

  useEffect(() =>
  {
    scrollToNewMessage();
  }, [messages]);

  // Set client flag after hydration
  useEffect(() =>
  {
    setIsClient(true);
  }, []);

  // Fetch Quick Access data
  useEffect(() =>
  {
    const fetchQuickAccessData = async () =>
    {
      setQuickAccessLoading(true);
      try
      {
        const response = await fetch(`/api/quick-access?lang=${selectedLanguage}`);
        const data = await response.json();
        if (data.success)
        {
          setQuickAccessData(data.data);
        }
      } catch (error)
      {
        console.error('Failed to fetch Quick Access data:', error);
      } finally
      {
        setQuickAccessLoading(false);
      }
    };

    fetchQuickAccessData();

    // Refresh data every 5 minutes
    const interval = setInterval(fetchQuickAccessData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedLanguage]);

  // Format times on client side to avoid hydration mismatch
  useEffect(() =>
  {
    if (!isClient) return;

    const times: { [key: string]: string } = {};
    messages.forEach(message =>
    {
      // Use a more stable time format that's consistent
      const date = new Date(message.timestamp);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes.toString().padStart(2, '0');
      times[message.id] = `${displayHours}:${displayMinutes} ${ampm}`;
    });
    setFormattedTimes(times);
  }, [messages, isClient]);

  // Auto-reset to initial state when conversation ends
  useEffect(() =>
  {
    if (conversationEnded)
    {
      const timer = setTimeout(() =>
      {
        setMessages([]);
        setConversationEnded(false);
        setInappropriateMessageCount(0);
        setConversationId(null);
        setInput('');
        setIsLoading(false);
      }, 3000); // Wait 3 seconds to show the ending message

      return () => clearTimeout(timer);
    }
  }, [conversationEnded]);

  // Initialize speech recognition
  useEffect(() =>
  {
    if (typeof window !== 'undefined')
    {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition)
      {
        setIsSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        // Set language based on selected language
        const langMap: { [key: string]: string } = {
          'en': 'en-US',
          'es': 'es-ES',
          'ar': 'ar-SA'
        };
        recognition.lang = langMap[selectedLanguage] || 'en-US';
        console.log('Speech recognition language set to:', recognition.lang);

        recognition.onstart = () =>
        {
          console.log('Recognition started - setting isVoiceMode to true');
          setIsListening(true);
          setIsVoiceMode(true); // Enable text-to-speech for responses
        };

        recognition.onresult = (event) =>
        {
          console.log('Recognition result received:', event.results);
          const transcript = event.results[0][0].transcript.trim();
          const lowerTranscript = transcript.toLowerCase();
          console.log('Transcript:', transcript);

          // Check for attachment command
          const attachmentCommands = ['attachment', 'attach', 'attach file', 'add file', 'upload', 'upload file'];
          const isAttachmentCommand = attachmentCommands.some(cmd =>
            lowerTranscript.includes(cmd)
          );

          // Check for emoji command
          const emojiCommands = ['emoji', 'add emoji', 'emoji picker', 'show emoji'];
          const isEmojiCommand = emojiCommands.some(cmd =>
            lowerTranscript.includes(cmd)
          );

          // Check if user said a send command
          const sendCommands = ['send', 'send message', 'go', 'submit', 'enter'];
          const isSendCommand = sendCommands.some(cmd =>
            lowerTranscript.includes(cmd)
          );

          console.log('Command check:', {
            transcript,
            lowerTranscript,
            isAttachmentCommand,
            isEmojiCommand,
            isSendCommand
          });

          // Handle attachment command
          if (isAttachmentCommand)
          {
            setIsListening(false);
            setVoiceCommand('Opening file explorer... 📁');
            setInput(''); // Clear any text
            setTimeout(() =>
            {
              triggerFileInput();
              setVoiceCommand(null);
            }, 300);
            return;
          }

          // Handle emoji command
          if (isEmojiCommand)
          {
            setIsListening(false);
            setVoiceCommand('Opening emoji selection... 😊');
            setInput(''); // Clear any text
            setTimeout(() =>
            {
              setShowEmojiPicker(true);
              setVoiceCommand(null);
            }, 300);
            return;
          }

          // Handle send command
          if (isSendCommand)
          {
            console.log('Processing send command...');
            setVoiceCommand('Sending your message... 💬');

            // Extract text before the send command
            const cleanedText = transcript
              .replace(/\b(send|send message|go|submit|enter)\b/gi, '')
              .trim();

            console.log('Cleaned text:', cleanedText);

            // Pass the text directly to sendMessage to bypass state delay
            if (cleanedText)
            {
              setInput(cleanedText); // Still update input for UI display

              // Pass text directly to sendMessage immediately with fromVoice flag
              console.log('Calling sendMessage with text:', cleanedText, 'isVoiceMode:', isVoiceMode, 'fromVoice: true');
              sendMessage(cleanedText, true);

              // Only set listening to false if not in voice mode
              if (!isVoiceMode)
              {
                setIsListening(false);
                setVoiceCommand(null);
              } else
              {
                // Keep listening in voice mode, just clear the command feedback
                setTimeout(() => setVoiceCommand(null), 1000);
              }
            }
            return;
          }

          // Regular speech - set input and auto-send after delay
          setInput(transcript);

          // Only set listening to false if not in voice mode
          if (!isVoiceMode)
          {
            setIsListening(false);
          }

          // Pass transcript directly to sendMessage to bypass state delay
          setTimeout(() =>
          {
            if (transcript.trim())
            {
              console.log('Auto-sending message with text:', transcript, 'isVoiceMode:', isVoiceMode, 'fromVoice: true');
              sendMessage(transcript, true);
            }
          }, 1000); // Reduced delay since we're passing text directly
        };

        recognition.onerror = (event) =>
        {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);

          // Provide user-friendly error messages
          if (event.error === 'no-speech')
          {
            console.log('No speech detected. Please check your microphone and try again.');
            setVoiceCommand('No speech detected. Please check your microphone.');
          } else if (event.error === 'not-allowed')
          {
            console.log('Microphone permission denied. Please allow microphone access.');
            setVoiceCommand('Microphone permission denied. Please allow access in your browser settings.');
          } else if (event.error === 'audio-capture')
          {
            console.log('No microphone found. Please check your audio devices.');
            setVoiceCommand('No microphone found.');
          }

          // Clear the error message after a delay
          setTimeout(() =>
          {
            setVoiceCommand(null);
          }, 3000);
        };

        recognition.onend = () =>
        {
          console.log('Recognition ended');
          // Only set listening to false if not in voice mode
          // In voice mode, we want to restart listening after Beale's response
          if (!isVoiceMode)
          {
            setIsListening(false);
          } else
          {
            // Keep the UI showing as listening since we're in voice mode
            console.log('Voice mode active, will restart listening after response');
            // Don't immediately restart here - let the response finish first
            // The listening will resume after the response is spoken
          }
        };

        recognitionRef.current = recognition;
      }
    }
  }, [selectedLanguage, isVoiceMode]); // Re-initialize when language changes or dependencies change

  const sendMessage = async (messageText?: string, fromVoice: boolean = false) =>
  {
    // Don't allow sending if conversation has ended
    if (conversationEnded)
    {
      console.log('Conversation has ended due to inappropriate language');
      return;
    }

    // Don't allow sending if already loading
    if (isLoading)
    {
      console.log('Already loading, ignoring request');
      return;
    }

    // Use the provided message text or fall back to input state
    const textToSend = messageText || input;

    // Check for profanity and hate speech FIRST before any processing
    if (textToSend && textToSend.trim())
    {
      const filter = new Filter();
      const hasProfanity = filter.isProfane(textToSend);

      // Check for hate speech patterns (case-insensitive)
      const lowerText = textToSend.toLowerCase();
      const hatePatterns = [
        /i hate (.*)?(?:mexican|asian|black|white|hispanic|latino|arab|muslim|jew|jewish|gay|lesbian|trans|disabled|retard|autistic|autist)/i,
        /(?:fuck|screw|kill) (.*)?(?:mexican|asian|black|white|hispanic|latino|arab|muslim|jew|jewish|gay|lesbian|trans|disabled|retard)/i,
        /(?:all|every) (.*)?(?:mexican|asian|black|white|hispanic|latino|arab|muslim|jew|jewish|gay|lesbian|trans|disabled|retard) (?:are|is) (?:stupid|ugly|dumb|bad|evil|disgusting)/i,
        /you are (?:a|an) (?:stupid|dumb|idiot) (?:mexican|asian|black|white|hispanic|latino|arab|muslim|jew|jewish|gay|lesbian|trans|disabled|retard)/i
      ];

      const hasHateSpeech = hatePatterns.some(pattern => pattern.test(textToSend));

      if (hasProfanity || hasHateSpeech)
      {
        console.log('Inappropriate content detected - rejecting immediately', { hasProfanity, hasHateSpeech });

        // Increment the inappropriate message count
        const newCount = inappropriateMessageCount + 1;
        setInappropriateMessageCount(newCount);

        let errorMessage: Message;

        if (newCount >= 2)
        {
          // Second inappropriate message - end the conversation
          setConversationEnded(true);
          setIsLoading(false); // Make sure we're not in loading state
          errorMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            text: "I apologize, but I cannot continue this conversation due to repeated inappropriate language. For assistance with Memphis city services, please call 311 at (901) 636-6500 or visit memphistn.gov. Thank you for understanding.",
            timestamp: new Date().toISOString()
          };
        } else
        {
          // First inappropriate message - give a warning
          errorMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            text: "I'm here to help you with Memphis city services in a respectful and professional manner. Please keep our conversation respectful and appropriate. How can I help you with city services today?",
            timestamp: new Date().toISOString()
          };
        }

        setMessages(prev => [...prev, errorMessage]);
        setInput(''); // Clear the input
        return; // Exit immediately without processing
      }
    }

    // Capture isVoiceMode at the start to avoid stale closure issues
    // Also use the fromVoice parameter as a fallback
    const voiceMode = fromVoice || isVoiceMode;

    console.log('sendMessage called', {
      input: input,
      messageText: messageText,
      textToSend: textToSend,
      inputTrimmed: textToSend.trim(),
      inputLength: textToSend.trim().length,
      attachedFilesLength: attachedFiles.length,
      isLoading: isLoading,
      isVoiceMode: isVoiceMode,
      fromVoice: fromVoice,
      voiceMode: voiceMode // Final value used for speaking
    });

    // Now check if we have content to send
    if (!textToSend.trim() && attachedFiles.length === 0)
    {
      console.log('Early return in sendMessage - no content');
      return;
    }

    // Ensure we have either text input or attached files
    const hasTextInput = textToSend.trim().length > 0;
    const hasFiles = attachedFiles.length > 0;

    console.log('Has text input:', hasTextInput, 'Has files:', hasFiles);

    if (!hasTextInput && !hasFiles)
    {
      console.log('No text input or files, returning');
      return;
    }

    // Check if any images are still loading or don't have previews
    const imageFiles = attachedFiles.filter(f => f.type.startsWith('image/'));
    const stillLoading = imageFiles.filter(f => loadingImages.has(f.name));
    const missingPreviews = imageFiles.filter(f => !filePreviews[f.name]);

    if (stillLoading.length > 0 || missingPreviews.length > 0)
    {
      console.log('Waiting for image previews to load...', { stillLoading, missingPreviews });
      return;
    }

    console.log('Sending message with attached files:', attachedFiles);
    console.log('File previews:', filePreviews);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend.trim() || (attachedFiles.length > 0 ? '' : ''),
      timestamp: new Date().toISOString(),
      attachedFiles: attachedFiles.length > 0 ? attachedFiles.map(f =>
      {
        console.log('Mapping file:', f.name, 'Preview available:', !!filePreviews[f.name], 'Preview data:', filePreviews[f.name]?.substring(0, 50) + '...');
        return {
          name: f.name,
          size: f.size,
          type: f.type,
          preview: filePreviews[f.name] || null
        };
      }) : []
    };

    console.log('User message with attached files:', userMessage);

    console.log('User message created:', userMessage);

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachedFiles([]); // Clear attached files after sending
    setFilePreviews({}); // Clear file previews after sending
    setLoadingImages(new Set()); // Clear loading state after sending
    setImageLoadingStates({}); // Clear image loading states after sending
    setIsLoading(true);

    try
    {
      // Determine the question to send
      let questionToSend = textToSend.trim();
      if (!questionToSend && attachedFiles.length > 0)
      {
        questionToSend = 'I have shared some files that need to be analyzed. Please help me understand what they contain and how they relate to Memphis city services.';
      }

      if (!questionToSend)
      {
        console.error('No question or files to send');
        setIsLoading(false);
        return;
      }

      const requestBody = {
        userId,
        question: questionToSend,
        conversationId,
        language: selectedLanguage
      };

      console.log('Sending request to /api/chat:', requestBody);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok)
      {
        const errorData = await response.text();
        console.error('API Error Response:', response.status, errorData);
        throw new Error(`Failed to send message: ${response.status} - ${errorData}`);
      }

      const data: ChatResponse = await response.json();

      // Auto-analyze any images that were attached to the user message
      let enhancedAnswer = data.answer;
      let assistantAttachedFiles: Array<{ name: string; size: number; type: string; preview?: string | null }> = [];
      if (userMessage.attachedFiles && userMessage.attachedFiles.length > 0)
      {
        const imageFiles = userMessage.attachedFiles.filter(file => file.type.startsWith('image/'));

        // If there are images, analyze them and include in response
        if (imageFiles.length > 0)
        {
          try
          {
            let allAnalysisResults = '';

            for (const file of imageFiles)
            {
              if (file.preview)
              {
                const analysisResult = await analyzeImageDirect(file.preview, file.name);
                allAnalysisResults += `\n\n**Image Analysis for "${file.name}":**\n${analysisResult.analysis}\n\n**Recommendations:**\n${analysisResult.recommendations}\n\n**Next steps:**\n${analysisResult.nextSteps}`;

                // Add the user's image to the assistant's response for context
                assistantAttachedFiles.push({
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  preview: file.preview
                });
              }
            }

            // Add all analysis results to the enhanced answer
            enhancedAnswer += allAnalysisResults;
          }
          catch (error)
          {
            console.error('Error analyzing images:', error);
            // Continue without analysis if there's an error
          }
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: enhancedAnswer,
        timestamp: data.timestamp,
        relevantPages: data.relevantPages,
        attachedFiles: assistantAttachedFiles
      };

      setMessages(prev => [...prev, assistantMessage]);
      setConversationId(data.conversationId);

      // Speak Beale's response if in voice mode
      // Use the captured value to avoid stale closure issues
      console.log('isVoiceMode (current):', isVoiceMode, 'voiceMode (captured):', voiceMode, 'answer length:', enhancedAnswer?.length);
      if (voiceMode)
      {
        console.log('Speaking Beale\'s response...');
        // Add a delay to let the thinking message disappear and response appear
        setTimeout(() =>
        {
          speakText(enhancedAnswer);
        }, 1000); // Increased delay for better UX
      } else
      {
        console.log('Not speaking - not in voice mode');
      }
    } catch (error)
    {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: 'Sorry, I encountered an error. Please try again or call Memphis 311 at (901)636-6500.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally
    {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) =>
  {
    if (e.key === 'Enter' && !e.shiftKey)
    {
      e.preventDefault();
      sendMessage();
    }
  };

  // Text-to-speech function
  const speakText = (text: string) =>
  {
    console.log('speakText called with text:', text?.substring(0, 100));

    if (!('speechSynthesis' in window))
    {
      console.log('Speech synthesis not supported');
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    // Clean the text for better speech (remove markdown formatting)
    const cleanText = text
      .replace(/[#*_~`]/g, '') // Remove markdown formatting
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();

    console.log('Cleaned text for speech:', cleanText?.substring(0, 100));

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Set language based on selectedLanguage
    const langMap: { [key: string]: string } = {
      'en': 'en-US',
      'es': 'es-ES',
      'ar': 'ar-SA'
    };
    utterance.lang = langMap[selectedLanguage] || 'en-US';

    // Set rate and pitch for more natural speech
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 0.9;

    // Event handlers
    utterance.onstart = () =>
    {
      console.log('Speech started');
      setIsSpeaking(true);
    };

    utterance.onend = () =>
    {
      console.log('Speech ended');
      setIsSpeaking(false);

      // If in voice mode, restart listening after Beale finishes speaking
      if (isVoiceMode && recognitionRef.current)
      {
        console.log('Voice mode active, restarting speech recognition...');
        setTimeout(() =>
        {
          if (recognitionRef.current && !isLoading)
          {
            try
            {
              recognitionRef.current.start();
              console.log('Speech recognition restarted successfully');
            } catch (error)
            {
              console.log('Could not restart speech recognition (may already be active):', error);
            }
          }
        }, 500); // Small delay to ensure speech is fully finished
      }
    };

    utterance.onerror = (event) =>
    {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
    };

    // Store reference and speak
    speechSynthesisRef.current = utterance;
    console.log('Calling window.speechSynthesis.speak()');
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = async () =>
  {
    console.log('toggleListening called', {
      hasRecognition: !!recognitionRef.current,
      isListening,
      isLoading,
      recognitionRef: recognitionRef.current
    });

    if (!recognitionRef.current)
    {
      console.error('No recognition ref available');
      return;
    }

    if (isLoading)
    {
      console.log('Currently loading, cannot toggle');
      return;
    }

    if (isListening)
    {
      console.log('Currently listening, stopping...');
      try
      {
        recognitionRef.current.stop();
        // Give the browser a moment to process the stop
        await new Promise(resolve => setTimeout(resolve, 100));
        setIsListening(false);
        setIsVoiceMode(false);
      } catch (error)
      {
        console.error('Error stopping speech recognition:', error);
        // Force reset state if stop fails
        setIsListening(false);
        setIsVoiceMode(false);
      }
    } else
    {
      console.log('Not listening, starting...');
      try
      {
        setIsVoiceMode(true);
        recognitionRef.current.start();
        console.log('Recognition started successfully');
      } catch (error)
      {
        console.error('Error starting speech recognition:', error);
        // Reset states on error
        setIsListening(false);
        setIsVoiceMode(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
  {
    setInput(e.target.value);
    // Don't reset voice mode on typing - it should persist until message is sent
  };

  const startListening = () =>
  {
    if (!isListening && !isLoading)
    {
      console.log('Direct startListening call');
      setIsVoiceMode(true);
      try
      {
        recognitionRef.current?.start();
      } catch (error)
      {
        console.error('Error in direct startListening:', error);
        setIsListening(false);
        setIsVoiceMode(false);
      }
    }
  };

  const stopListening = () =>
  {
    if (isListening)
    {
      console.log('Direct stopListening call');
      try
      {
        recognitionRef.current?.stop();
        setIsListening(false);
        setIsVoiceMode(false);
      } catch (error)
      {
        console.error('Error in direct stopListening:', error);
        setIsListening(false);
        setIsVoiceMode(false);
      }
    }
  };

  const stopSpeaking = () =>
  {
    if ('speechSynthesis' in window)
    {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const clearMessages = () =>
  {
    console.log('Starting clearMessages process...');

    try
    {
      // First, stop all active processes immediately
      console.log('Stopping speech recognition...');
      if (recognitionRef.current)
      {
        try
        {
          recognitionRef.current.stop();
        } catch (error)
        {
          console.log('Error stopping recognition during clear:', error);
        }
      }

      console.log('Stopping speech synthesis...');
      if (typeof window !== 'undefined' && window.speechSynthesis)
      {
        try
        {
          window.speechSynthesis.cancel();
        } catch (error)
        {
          console.log('Error stopping speech synthesis during clear:', error);
        }
      }

      // Clear messages and conversation state, but keep chat interface open
      setMessages([]); // Clear message history
      setConversationId(null); // Start new conversation
      setInput(''); // Clear input field
      setAttachedFiles([]); // Clear attached files
      setFilePreviews({}); // Clear file previews
      setLoadingImages(new Set()); // Clear loading states
      setImageLoadingStates({}); // Clear image states
      setIsListening(false); // Stop listening if active
      setIsVoiceMode(false); // Reset voice mode
      setIsSpeaking(false); // Stop speaking
      setVoiceCommand(null); // Clear voice commands
      setIsLoading(false); // Stop loading state
      setInappropriateMessageCount(0); // Reset counter
      setConversationEnded(false); // Reset conversation ended state

      // Close any open dropdowns
      setShowTrashDropdown(false);
      setShowDropdown(false);
      setShowLanguageDropdown(false);
      setShowMenu(false);

      // Reset emoji picker and image modal if open
      setShowEmojiPicker(false);
      setShowImageModal(false);

      // Clear expanded resources state
      setExpandedResources({});

      console.log('ClearMessages completed - ready for fresh conversation');

    } catch (error)
    {
      console.error('Error during clearMessages:', error);
      // Even if there's an error, try to clear main states
      setMessages([]);
      setConversationId(null);
      setInput('');
      setIsListening(false);
      setIsVoiceMode(false);
      setIsSpeaking(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) =>
  {
    const files = event.target.files;
    if (files)
    {
      Array.from(files).forEach(file =>
      {
        if (file.type.startsWith('image/'))
        {
          const reader = new FileReader();
          reader.onload = (e) =>
          {
            const result = e.target?.result as string;
            setImages(prev => [...prev, result]);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  const openImageSlider = (index: number) =>
  {
    setCurrentImageIndex(index);
    setShowImageSlider(true);
  };

  const nextImage = () =>
  {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () =>
  {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const closeImageSlider = () =>
  {
    setShowImageSlider(false);
  };

  const toggleMenu = () =>
  {
    setShowMenu(!showMenu);
  };

  // Emoji picker functionality
  const toggleEmojiPicker = () =>
  {
    if (isLoading) return; // Don't open emoji picker when loading
    setShowEmojiPicker(!showEmojiPicker);
  };

  const insertEmoji = (emoji: string) =>
  {
    setInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // File attachment functionality
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) =>
  {
    const files = Array.from(event.target.files || []);
    console.log('Files selected:', files);
    const maxSize = 10 * 1024 * 1024; // 10MB

    const validFiles = files.filter(file =>
    {
      if (file.size > maxSize)
      {
        alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    console.log('Valid files:', validFiles);

    // Create previews for image files first
    const imageFiles = validFiles.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length > 0)
    {
      // Add files immediately but mark images as loading
      setAttachedFiles(prev =>
      {
        const newFiles = [...prev, ...validFiles];
        console.log('Updated attached files (with loading images):', newFiles);
        return newFiles;
      });

      // Track loading state for each image
      imageFiles.forEach(file =>
      {
        setLoadingImages(prev => new Set([...prev, file.name]));

        const reader = new FileReader();
        reader.onload = (e) =>
        {
          console.log('Preview created for:', file.name, 'Result:', e.target?.result);
          setFilePreviews(prev => ({
            ...prev,
            [file.name]: e.target?.result as string
          }));

          // Remove from loading state
          setLoadingImages(prev =>
          {
            const newSet = new Set(prev);
            newSet.delete(file.name);
            return newSet;
          });
        };
        reader.readAsDataURL(file);
      });
    } else
    {
      // No images, just add files immediately
      setAttachedFiles(prev =>
      {
        const newFiles = [...prev, ...validFiles];
        console.log('Updated attached files (no images):', newFiles);
        return newFiles;
      });
    }
  };

  const removeFile = (index: number) =>
  {
    const fileToRemove = attachedFiles[index];
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));

    // Remove preview if it exists
    if (fileToRemove && filePreviews[fileToRemove.name])
    {
      setFilePreviews(prev =>
      {
        const newPreviews = { ...prev };
        delete newPreviews[fileToRemove.name];
        return newPreviews;
      });
    }

    // Remove from loading state
    if (fileToRemove)
    {
      setLoadingImages(prev =>
      {
        const newSet = new Set(prev);
        newSet.delete(fileToRemove.name);
        return newSet;
      });
    }
  };

  const triggerFileInput = useCallback(() =>
  {
    if (isLoading) return; // Don't open file input when loading
    console.log('Triggering file input, ref:', fileInputRef.current);
    fileInputRef.current?.click();
  }, [isLoading]);

  // Image expansion and modal functions
  const toggleImageExpansion = (imageSrc: string) =>
  {
    if (expandedImage === imageSrc)
    {
      setExpandedImage(null);
    } else
    {
      setExpandedImage(imageSrc);
    }
  };

  const openImageModal = (imageSrc: string) =>
  {
    setModalImageSrc(imageSrc);
    setShowImageModal(true);
  };

  const closeImageModal = () =>
  {
    setShowImageModal(false);
    setModalImageSrc('');
  };

  // Helper function to analyze image without modifying UI state
  const analyzeImageDirect = async (imageSrc: string, fileName: string) =>
  {
    try
    {
      // Convert data URL to base64 for API
      const base64Data = imageSrc.split(',')[1];

      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Data,
          fileName: fileName,
          context: 'Memphis city services and community assistance'
        }),
      });

      if (!response.ok)
      {
        throw new Error('Failed to analyze image');
      }

      return await response.json();
    } catch (error)
    {
      console.error('Error analyzing image:', error);
      return {
        analysis: `Sorry, I couldn't analyze the image "${fileName}" right now.`,
        recommendations: "Please try again or describe what you need help with regarding this image.",
        nextSteps: "You can still describe the issue and I'll do my best to help with Memphis city services.",
        relatedImages: []
      };
    }
  };

  // Remove automatic emoji picker closing - it's now a toggle
  // Users can click the emoji button again to close it

  // Debug attached files
  useEffect(() =>
  {
    console.log('Attached files updated:', attachedFiles);
  }, [attachedFiles]);

  // Close emoji picker when Memphis Maven starts thinking
  useEffect(() =>
  {
    if (isLoading)
    {
      setShowEmojiPicker(false);
    }
  }, [isLoading]);

  // Set initial loading state for images when they're first displayed
  useEffect(() =>
  {
    messages.forEach(message =>
    {
      if (message.attachedFiles)
      {
        message.attachedFiles.forEach(file =>
        {
          if (file.type.startsWith('image/') && file.preview && !(file.name in imageLoadingStates))
          {
            console.log('Setting loading state for image in conversation:', file.name, 'Preview length:', file.preview.length);
            setImageLoadingStates(prev => ({
              ...prev,
              [file.name]: true
            }));
          }
        });
      }
      if (message.images)
      {
        message.images.forEach(image =>
        {
          if (!(image.url in imageLoadingStates))
          {
            setImageLoadingStates(prev => ({
              ...prev,
              [image.url]: true
            }));
          }
        });
      }
    });
  }, [messages]); // Removed imageLoadingStates dependency to prevent infinite loop



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Chatbox Container */}
      <div className="w-full max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto">
        {!showChat ? (
          /* Initial Greeting Screen */
          <div className="bg-transparent overflow-hidden">
            {/* Main Welcome Section */}
            <div className="bg-transparent p-8 text-center relative h-96 flex flex-col items-center justify-center">
              {/* Decorative Elements */}
              {/* <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 left-8 w-16 h-16 bg-white rounded-full"></div>
                <div className="absolute top-12 right-12 w-8 h-8 bg-white rounded-full"></div>
                <div className="absolute bottom-6 left-16 w-12 h-12 bg-white rounded-full"></div>
              </div> */}

              {/* Beale Brand Section - Text Above, Image Below and Right */}
              <div className=" flex flex-col items-center w-full">
                {/* Remove title and description from above - will place under image */}

                {/* Beale Sunset Image - Centered with responsive sizing */}
                <div className="w-full flex flex-col items-center justify-center">
                  <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 mb-4 sm:mb-6">
                    <OptimizedImage
                      src="/beale_no_background_sunset.png"
                      alt="Beale"
                      fill
                      className="object-contain drop-shadow-2xl"
                      sizes="(max-width: 640px) 192px, (max-width: 768px) 224px, 256px"
                      preloadPriority={true}
                      showLoadingState={false}
                      priority={true}
                      placeholder="blur"
                      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGZpbHRlciBpZD0iYmx1ciI+PGZlR2F1c2lhbkJsdXIgc3RkRGV2aWF0ZT0iOCIvPjwvZmlsdGVyPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjNGNEY2IiBmaWx0ZXI9InVybCgjYmx1cikiLz48L3N2Zz4="
                    />
                  </div>


                </div>

              </div>

            </div>

            {/* Title and Description Under Image */}
            <div className="text-center max-w-[500px] mx-auto px-6 mb-6">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-800 mb-2 tracking-tight">Your AI Assistant for Memphis Services</h1>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                Get instant help with Memphis city services, report issues, or find community resources. I'm here to make your experience easier.
              </p>
            </div>

            {/* Action Area */}
            <div className="p-8 text-center bg-transparent relative z-10">
              <button
                type="button"
                onClick={() => setShowChat(true)}
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95"
                title="Start chatting with Beale, your Memphis AI assistant"
              >
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>

                {/* Button Content */}
                <div className="relative flex items-center space-x-2">
                  <svg className="w-5 h-5 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Start chatting">
                    <title>Start chatting</title>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Start Chatting</span>
                </div>
              </button>

              {/* Feature Highlights */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center justify-center space-x-2 text-gray-500">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>24/7 Available</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-gray-500">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span>Multilingual Support</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-gray-500">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span>Voice Enabled</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Chat Interface */
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300">
            {/* <div className="px-6 py-2 bg-transparent border-b border-gray-300 h-36">
              <div className="flex items-center justify-center p-1">
                <div className="flex flex-col items-center justify-center p-1 w-42 h-42">
                  <div
                    className="w-full h-full rounded-lg p-1 bg-transparent overflow-visible cursor-help relative group"
                    title="Beale - Help and harmony straight from Beale"
                    onMouseEnter={() => console.log('Hovering over avatar')}
                  >
                    <img
                      src="/Beale_blue.png"
                      alt="Beale Avatar"
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        // Try SVG fallback
                        const fallback = target.parentElement?.querySelector('.fallback-svg') as HTMLImageElement;
                        if (fallback) {
                          fallback.style.display = 'block';
                        } else {
                          // Ultimate fallback to letter
                          const letterFallback = target.parentElement?.querySelector('.letter-fallback') as HTMLElement;
                          if (letterFallback) {
                            letterFallback.classList.remove('hidden');
                            letterFallback.classList.add('flex');
                          }
                        }
                      }}
                    />
                  </div>
                  <div>
                    <h2 className="text-gray-900 font-bold text-4xl tracking-wide pt-[-30px]">Beale</h2>
                  </div>
                </div>
              </div>
            </div> */}
            {/* Enhanced Header */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-6 py-4 border-b border-blue-200 border-t shadow-lg">
              <div className="flex flex-col items-center justify-between gap-2 sm:flex-row sm:space-y-0">
                {/* Left Section - Beale Info */}
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center overflow-hidden">
                      <OptimizedImage
                        src="/Beale_blue.png"
                        alt="Beale Avatar"
                        fill
                        className="object-cover"
                        sizes="32px"
                        preloadPriority={true}
                        showLoadingState={false}
                        priority={true}
                        placeholder="blur"
                        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0U1RUY1RiIvPjwvc3ZnPg=="
                      />
                    </div>
                    {/* Online Status Indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border border-white"></div>
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-base">Beale</h2>
                    <div className="flex items-center space-x-1 text-white text-xs">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      <span>Online • Ready to help</span>
                    </div>
                  </div>
                </div>

                {/* Right Section - Controls */}
                <div className="flex items-center space-x-3 sm:flex-row">
                  {/* Language Selector */}
                  <div className="relative group z-[99999]">
                    <button
                      type="button"
                      data-language-toggle
                      onClick={() =>
                      {
                        if (!isLoading)
                        {
                          setShowLanguageDropdown(!showLanguageDropdown);
                          setShowTrashDropdown(false);
                          setShowDropdown(false);
                        }
                      }}
                      disabled={isLoading}
                      title="Language Selector"
                      aria-label="Language Selector"
                      className={`p-2.5 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 flex items-center space-x-2 shadow-lg ${isLoading
                        ? 'text-white/50 cursor-not-allowed'
                        : showLanguageDropdown
                          ? 'text-blue-600 bg-white shadow-xl'
                          : 'text-white hover:text-white hover:bg-white/10'
                        }`}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-label="Language selector">
                        <title>Language selector</title>
                        <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
                      </svg>
                      <span className="text-xs font-semibold">
                        {selectedLanguage === 'en' ? 'EN' : selectedLanguage === 'es' ? 'ES' : 'AR'}
                      </span>
                    </button>

                    {/* Language Dropdown */}
                    {showLanguageDropdown && (
                      <div data-language-selector className="absolute right-0 top-full mt-2 w-36 bg-white rounded-xl shadow-2xl border border-gray-200 z-[999999] overflow-hidden">
                        <div className="p-1">
                          <button
                            onClick={() =>
                            {
                              changeLanguage('en');
                              setShowLanguageDropdown(false);
                            }}
                            title="Select English"
                            aria-label="Select English"
                            className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all duration-150 ${selectedLanguage === 'en'
                              ? 'bg-blue-50 text-blue-600 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                              }`}
                          >
                            🇺🇸 English
                          </button>
                          <button
                            onClick={() =>
                            {
                              changeLanguage('es');
                              setShowLanguageDropdown(false);
                            }}
                            title="Select Spanish"
                            aria-label="Select Spanish"
                            className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all duration-150 ${selectedLanguage === 'es'
                              ? 'bg-blue-50 text-blue-600 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                              }`}
                          >
                            🇪🇸 Español
                          </button>
                          <button
                            onClick={() =>
                            {
                              changeLanguage('ar');
                              setShowLanguageDropdown(false);
                            }}
                            title="Select Arabic"
                            aria-label="Select Arabic"
                            className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all duration-150 ${selectedLanguage === 'ar'
                              ? 'bg-blue-50 text-blue-600 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                              }`}
                          >
                            🇸🇦 العربية
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Clear Button - Separate from dropdown */}
                  <button
                    onClick={(e) =>
                    {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Clear button clicked!');
                      console.log('Current messages:', messages.length);
                      clearMessages();
                    }}
                    disabled={isLoading}
                    aria-label="Clear conversation and start fresh"
                    title="Clear conversation and start fresh"
                    className={`p-2.5 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg ${isLoading
                      ? 'text-white/50 cursor-not-allowed'
                      : 'text-white hover:text-white hover:bg-white/10'
                      }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Clear conversation">
                      <title>Clear conversation</title>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>

                  {/* Settings Menu */}
                  <div className="relative">
                    <button
                      data-menu-toggle
                      onClick={(e) =>
                      {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Three dots clicked, current showDropdown:', showDropdown);
                        setShowDropdown(!showDropdown);
                        setShowTrashDropdown(false);
                        setShowLanguageDropdown(false);
                      }}
                      title="Open settings menu"
                      aria-label="Open settings menu"
                      className={`p-2.5 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg ${showDropdown
                        ? 'text-blue-600 bg-white shadow-xl'
                        : 'text-white hover:text-white hover:bg-white/10'
                        }`}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-label="Settings menu">
                        <title>Settings menu</title>
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {showDropdown && (
                      <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999999]" style={{ pointerEvents: 'auto' }}>
                        <div className="p-6">
                          <div className="font-bold text-lg mb-3 text-blue-600">{tFallback('ui.howToUse')}</div>
                          <div className="font-semibold text-base mb-4 text-gray-800">{tFallback('ui.howToUseMemphis')}</div>
                          <div className="text-sm space-y-3 mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                              <span className="font-medium text-gray-800">211 {tFallback('ui.communityServices')}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <span className="text-gray-800">311 {tFallback('ui.cityServices')}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              <span className="text-gray-800">911 {tFallback('ui.emergency')} Services</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span className="text-gray-800">{tFallback('ui.multilingualHelp')}</span>
                            </div>
                          </div>


                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Access Section */}
            {showNotifications && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-200 px-6 py-4 border-t shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Lightning bolt">
                        <title>Lightning bolt</title>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-bold text-gray-800 tracking-wide">{tFallback('ui.quickAccess')}</h3>
                  </div>
                  <button
                    onClick={() => setQuickAccessCollapsed(!quickAccessCollapsed)}
                    className="p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 text-gray-600 hover:text-gray-800 hover:bg-white/50"
                    title={quickAccessCollapsed ? "Expand quick access cards" : "Collapse quick access cards"}
                  >
                    <svg className="w-4 h-4 transition-transform duration-300" style={{ transform: quickAccessCollapsed ? 'rotate(0deg)' : 'rotate(180deg)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Expand/collapse">
                      <title>Expand/collapse</title>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {!quickAccessCollapsed && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                      {quickAccessLoading ? (
                        <>
                          {/* Skeleton Loader for 211 */}
                          <div className="px-3 py-2 md:px-4 md:py-3 rounded-lg text-center text-sm md:text-base font-medium transition-colors shadow-md bg-gray-100 animate-pulse">
                            <div className="h-5 bg-gray-300 rounded mb-2"></div>
                            <div className="h-3 bg-gray-300 rounded mb-2"></div>
                            <div className="h-3 bg-gray-300 rounded"></div>
                          </div>
                          {/* Skeleton Loader for 311 */}
                          <div className="px-3 py-2 md:px-4 md:py-3 rounded-lg text-center text-sm md:text-base font-medium transition-colors shadow-md bg-gray-100 animate-pulse">
                            <div className="h-5 bg-gray-300 rounded mb-2"></div>
                            <div className="h-3 bg-gray-300 rounded mb-2"></div>
                            <div className="h-3 bg-gray-300 rounded"></div>
                          </div>
                          {/* Skeleton Loader for 911 */}
                          <div className="px-3 py-2 md:px-4 md:py-3 rounded-lg text-center text-sm md:text-base font-medium transition-colors shadow-md bg-gray-100 animate-pulse">
                            <div className="h-5 bg-gray-300 rounded mb-2"></div>
                            <div className="h-3 bg-gray-300 rounded mb-2"></div>
                            <div className="h-3 bg-gray-300 rounded"></div>
                          </div>
                        </>
                      ) : (
                        <>
                          <a
                            href={`tel:${quickAccessData?.services?.['211']?.phone || '211'}`}
                            className="flex items-start space-x-3 text-purple-800 transition-all p-2"
                          >
                            <div className="flex flex-col items-center flex-shrink-0">
                              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-purple-600 flex items-center justify-center">
                                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <title>Phone</title>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                              </div>
                              <div className="font-bold tracking-wide text-sm md:text-base mt-1">211</div>
                            </div>
                            <div className="flex-1 min-w-0 border border-purple-200 rounded-lg px-3 py-3 hover:shadow-lg transition-shadow">
                              <div className="text-sm font-semibold tracking-wide">{tFallback('ui.communityServices')}</div>
                              <div className="text-xs opacity-70 tracking-wide">
                                {quickAccessData?.services?.['211']?.waitTime === 'Call for current wait time' ? tFallback('ui.callForWaitTime') :
                                  quickAccessData?.services?.['211']?.waitTime === 'Immediate' ? tFallback('ui.immediate') :
                                    quickAccessData?.services?.['211']?.waitTime || tFallback('ui.callForWaitTime')}
                              </div>
                            </div>
                          </a>

                          <a
                            href={`tel:${quickAccessData?.services?.['311']?.phone || '901-636-6500'}`}
                            className="flex items-start space-x-3 text-blue-800 transition-all p-2"
                          >
                            <div className="flex flex-col items-center flex-shrink-0">
                              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-blue-600 flex items-center justify-center">
                                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <title>City Services</title>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                              </div>
                              <div className="font-bold tracking-wide text-sm md:text-base mt-1">311</div>
                            </div>
                            <div className="flex-1 min-w-0 border border-blue-200 rounded-lg px-3 py-3 hover:shadow-lg transition-shadow">
                              <div className="text-sm font-semibold tracking-wide">{tFallback('ui.cityServices')}</div>
                              <div className="text-xs opacity-70 tracking-wide">
                                {quickAccessData?.services?.['311']?.waitTime === 'Call for current wait time' ? tFallback('ui.callForWaitTime') :
                                  quickAccessData?.services?.['311']?.waitTime === 'Immediate' ? tFallback('ui.immediate') :
                                    quickAccessData?.services?.['311']?.waitTime || tFallback('ui.callForWaitTime')}
                              </div>
                            </div>
                          </a>

                          <a
                            href={`tel:${quickAccessData?.services?.['911']?.phone || '911'}`}
                            className="flex items-start space-x-3 text-red-800 transition-all p-2"
                          >
                            <div className="flex flex-col items-center flex-shrink-0">
                              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-red-600 flex items-center justify-center">
                                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <title>Emergency Services</title>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                              </div>
                              <div className="font-bold tracking-wide text-sm md:text-base mt-1">911</div>
                            </div>
                            <div className="flex-1 min-w-0 border border-red-200 rounded-lg px-3 py-3 hover:shadow-lg transition-shadow">
                              <div className="text-sm font-semibold tracking-wide">{tFallback('ui.emergency')}</div>
                              <div className="text-xs opacity-70 tracking-wide">
                                {quickAccessData?.services?.['911']?.waitTime === 'Call for current wait time' ? tFallback('ui.callForWaitTime') :
                                  quickAccessData?.services?.['911']?.waitTime === 'Immediate' ? tFallback('ui.immediate') :
                                    quickAccessData?.services?.['911']?.waitTime || tFallback('ui.immediate')}
                              </div>
                            </div>
                          </a>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}


            <div className="px-6 py-2 bg-white/80 backdrop-blur-md h-8 border-t shadow-lg">
              {/* <div className="flex items-center justify-center p-1">
                <div className="flex items-center rounded-2xl shadow-md p-1">
                  <div
                    className="w-12 h-12 rounded-lg p-1 bg-transparent flex items-center justify-center overflow-visible cursor-help relative group"
                    title="Beale - Help and harmony straight from Beale"
                    onMouseEnter={() => console.log('Hovering over avatar')}
                  >
                    <Image
                      src="/Beale_blue.png"
                      alt="Beale Avatar"
                      fill
                      className="object-cover rounded-lg"
                      sizes="48px"
                    />
                  </div>

                  <div>
                    <h2 className="text-gray-900 font-bold text-xl tracking-wide">Beale</h2>
                  </div>
                </div>
              </div> */}
            </div>

            {/* Enhanced Messages Area */}
            <div className="h-96 overflow-y-auto bg-gradient-to-b from-slate-50 to-white">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 mt-8">
                  {/* Welcome Content */}
                  <div className="text-center max-w-md">
                    {/* <div className="mb-6">
                      <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                    </div> */}

                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      {tFallback('ui.welcomeGreeting')}
                    </h3>

                    <p className="text-gray-600 mb-8 leading-relaxed">
                      {tFallback('ui.welcomeDescription')}
                    </p>

                    {/* Quick Action Buttons */}
                    <div className="space-y-3">
                      <button
                        onClick={() => setInput(tFallback('ui.examplePotholeSlider'))}
                        className="group w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl border border-blue-200 hover:border-blue-300 transition-all duration-200 text-left"
                        title="Try an example message about reporting a pothole"
                      >
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{tFallback('ui.examplePotholeSlider')}</div>
                          <div className="text-sm text-gray-500">{tFallback('ui.clickToTryExample')}</div>
                        </div>
                      </button>
                    </div>

                    {/* Feature Highlights */}
                    <div className="mt-8 grid grid-cols-1 gap-3">
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{tFallback('ui.reportIssuesHelp')}</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{tFallback('ui.findCityServices')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      data-message-id={message.id}
                      className={`flex ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-4 ${message.role === 'assistant' ? 'animate-fade-in-slow' : ''
                        }`}
                    >
                      {/* Enhanced Avatar */}
                      {message.role === 'assistant' ? (
                        <div className="flex-shrink-0 relative">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 p-0.5 shadow-md">
                            <div className="w-full h-full rounded-md bg-white overflow-hidden">
                              <OptimizedImage
                                src="/Beale_blue.png"
                                alt="Beale Avatar"
                                fill
                                className="object-cover"
                                sizes="32px"
                                preloadPriority={true}
                                showLoadingState={false}
                                priority={true}
                                placeholder="blur"
                                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0U1RUY1RiIvPjwvc3ZnPg=="
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center shadow-md">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}

                      {/* Enhanced Message bubble */}
                      <div
                        className={`flex flex-col justify-end flex-1 max-w-full ${message.role === 'user' ? 'mr-0 md:mr-8' : 'ml-0'
                          }`}
                      >
                        <div
                          className={`relative p-3 md:p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 max-w-[85%] ${message.role === 'user'
                            ? 'bg-gradient-to-r from-blue-200 to-blue-300 text-white rounded-br-md ml-auto'
                            : 'bg-white border border-gray-200 rounded-bl-md hover:border-gray-300 mr-auto'
                            }`}
                        >
                          <div className={`markdown-content ${message.role === 'user'
                            ? 'text-white [&_*]:text-white [&_p]:text-white [&_strong]:text-white [&_em]:text-white [&_a]:text-white'
                            : 'text-gray-800 [&_*]:text-gray-800 [&_p]:text-gray-800 [&_strong]:text-gray-800 [&_em]:text-gray-800 [&_a]:text-gray-800'
                            }`}>
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeRaw, rehypeHighlight]}
                            >
                              {message.text}
                            </ReactMarkdown>
                          </div>

                          {/* Attached files for user messages - INSIDE the bubble */}
                          {message.attachedFiles && message.attachedFiles.length > 0 && (
                            <div className="mt-3 space-y-3">
                              {message.attachedFiles.map((file, index) => (
                                <div key={`${message.id}-attached-${file.name}-${index}`} className="space-y-2">
                                  {/* Image preview for image files */}
                                  {file.type.startsWith('image/') && file.preview && (
                                    <div
                                      className="relative group cursor-pointer"
                                      onClick={(e) =>
                                      {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        console.log('Image preview clicked for modal:', file.name);
                                        file.preview && openImageModal(file.preview);
                                      }}
                                    >
                                      <div className={`relative rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 ${expandedImage === file.preview
                                        ? 'w-48 h-48'
                                        : 'w-32 h-32'
                                        }`}>
                                        <OptimizedImage
                                          src={file.preview}
                                          alt={file.name}
                                          fill
                                          className="object-cover rounded-xl"
                                          sizes="(max-width: 768px) 128px, 192px"
                                          preloadPriority={false}
                                          showLoadingState={false}
                                          placeholder="blur"
                                          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjNGNEY2Ii8+PC9zdmc+"
                                          onClick={() => file.preview && toggleImageExpansion(file.preview)}
                                        />
                                      </div>

                                      {/* Hover overlay */}
                                      <div className={`absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 ${expandedImage === file.preview
                                        ? 'w-48 h-48'
                                        : 'w-32 h-32'
                                        }`}>
                                        <div className="flex space-x-2">
                                          <button
                                            onClick={(e) =>
                                            {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              console.log('Expand button clicked for:', file.name);
                                              file.preview && toggleImageExpansion(file.preview);
                                            }}
                                            className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all"
                                            title={expandedImage === file.preview ? "Collapse" : "Expand"}
                                          >
                                            <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              {expandedImage === file.preview ? (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5M15 9h4.5M15 9V4.5M15 9l5.5-5.5M9 15v4.5M9 15H4.5M9 15l-5.5 5.5M15 15h4.5M15 15v4.5M15 15l5.5 5.5" />
                                              ) : (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                              )}
                                            </svg>
                                          </button>
                                          {/* Image modal button removed for now */}
                                          {/* <button
                                            onClick={(e) =>
                                            {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              console.log('Modal button clicked for:', file.name);
                                              file.preview && openImageModal(file.preview);
                                            }}
                                            className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all"
                                            title="View full size"
                                          >
                                            <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                            </svg>
                                          </button> */}
                                        </div>
                                      </div>

                                    </div>
                                  )}

                                  {/* File info for non-image files */}
                                  {!file.type.startsWith('image/') && (
                                    <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
                                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-gray-800 truncate">{file.name}</div>
                                        <div className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* AI-generated images - INSIDE the bubble */}
                          {message.images && message.images.length > 0 && (
                            <div className="mt-3 grid grid-cols-2 gap-3">
                              {message.images.map((image, index) => (
                                <div key={`${message.id}-image-${image.url}-${index}`} className="relative group cursor-pointer">
                                  <div className="w-full h-32 rounded-xl overflow-hidden border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
                                    <OptimizedImage
                                      src={image.url}
                                      alt={image.alt || 'AI generated image'}
                                      fill
                                      className="object-cover"
                                      sizes="(max-width: 768px) 50vw, 25vw"
                                      preloadPriority={false}
                                      showLoadingState={false}
                                      placeholder="blur"
                                      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjNGNEY2Ii8+PC9zdmc+"
                                      onLoad={() =>
                                      {
                                        setImageLoadingStates(prev => ({
                                          ...prev,
                                          [image.url]: false
                                        }));
                                      }}
                                      onError={() =>
                                      {
                                        setImageLoadingStates(prev => ({
                                          ...prev,
                                          [image.url]: false
                                        }));
                                      }}
                                    />
                                  </div>
                                  {image.caption && (
                                    <div className="text-xs text-gray-600 italic mt-1 text-center">
                                      {image.caption}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Timestamp */}
                          {isClient && (
                            <div className="mt-2">
                              <span className={`text-xs ${message.role === 'user'
                                ? 'text-gray-800/80'
                                : 'text-gray-400'
                                }`}>
                                {formattedTimes[message.id] || '...'}
                              </span>
                            </div>
                          )}
                        </div>



                        {/* Relevant pages for assistant messages */}
                        {message.role === 'assistant' && message.relevantPages && message.relevantPages.length > 0 && (
                          <div className="mt-4 space-y-3 max-w-[85%]">
                            <div className="border-t border-gray-200 pt-3">
                              <div className="flex items-center space-x-1 mb-3">
                                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="text-sm font-semibold text-gray-700">
                                  {tFallback('ui.relevantResources')} ({message.relevantPages.length}):
                                </span>
                              </div>

                              <div className="space-y-2">
                                {(expandedResources[message.id] ? message.relevantPages : message.relevantPages.slice(0, 3)).map((page, index) => (
                                  <div key={`${message.id}-page-${page.url}-${index}`} className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:bg-gray-100 transition-colors">
                                    <a
                                      href={page.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block"
                                    >
                                      <div className="font-medium text-blue-700 hover:text-blue-800 text-sm mb-1 line-clamp-2">
                                        {translateResourceTitle(page.title)}
                                      </div>
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500 truncate">{page.url}</span>
                                        <span className={`px-2 py-1 rounded-full ${page.similarity > 0.7 ? 'bg-green-100 text-green-700' :
                                          page.similarity > 0.5 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                                          }`}>
                                          {Math.round(page.similarity * 100)}% match
                                        </span>
                                      </div>
                                    </a>
                                  </div>
                                ))}

                                {message.relevantPages.length > 3 && (
                                  <button
                                    onClick={() => setExpandedResources(prev => ({
                                      ...prev,
                                      [message.id]: !prev[message.id]
                                    }))}
                                    className="w-full text-sm text-blue-600 hover:text-blue-800 py-2 text-center hover:bg-blue-50 rounded-lg transition-colors font-medium"
                                    title={expandedResources[message.id] ? "Show fewer resources" : "Show more resources"}
                                  >
                                    {expandedResources[message.id]
                                      ? `Show Less (${message.relevantPages.length - 3} hidden)`
                                      : `Show More (${message.relevantPages.length - 3} more resources)`
                                    }
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Enhanced Loading State */}
                  {isLoading && !conversationEnded && (
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 relative">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 p-0.5 shadow-md">
                          <div className="w-full h-full rounded-md bg-white overflow-hidden">
                            <OptimizedImage
                              src="/Beale_blue.png"
                              alt="Beale Avatar"
                              fill
                              className="object-cover"
                              sizes="32px"
                              preloadPriority={true}
                              showLoadingState={false}
                              priority={true}
                              placeholder="blur"
                              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0U1RUY1RiIvPjwvc3ZnPg=="
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col justify-start flex-1 max-w-[85%]">
                        <div className="bg-white border border-gray-200 rounded-bl-md rounded-2xl shadow-sm p-3 md:p-4 max-w-[85%] mr-auto">
                          <div className="flex items-center space-x-3">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            <span className="text-sm font-medium text-gray-800">{getThinkingMessage()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Enhanced Input Area */}
            <div className="border-t border-gray-200 bg-white/95 backdrop-blur-sm p-6 shadow-lg">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />

              <div className="max-w-4xl mx-auto">
                {/* Attached Files Preview */}
                {attachedFiles.length > 0 && (
                  <div className="mb-4 space-y-3">
                    <div className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Attached files">
                        <title>Attached files</title>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <span>Attached Files ({attachedFiles.length})</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {attachedFiles.map((file, index) => (
                        <div key={`attached-${file.name}-${index}`} className="flex items-center justify-between bg-gray-50 rounded-xl p-3 border border-gray-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              {file.type.startsWith('image/') ? (
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-800 truncate">{file.name}</div>
                              <div className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</div>
                              {loadingImages.has(file.name) && (
                                <div className="text-xs text-blue-600 font-medium flex items-center space-x-1">
                                  <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                  <span>Processing...</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="ml-3 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title={`Remove ${attachedFiles[index]?.name || 'file'}`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Container */}
                <div className="flex flex-col w-full items-center justify-between gap-3 sm:flex-row sm:gap-2">
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {/* Voice Button */}
                    {isSupported && (
                      <button
                        onClick={toggleListening}
                        disabled={isLoading || conversationEnded}
                        className={`p-3 rounded-xl transition-all duration-200 ${isListening
                          ? 'bg-red-500 text-white shadow-lg scale-105'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                          } ${(isLoading || conversationEnded) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={isLoading ? tFallback('ui.bealeThinking') : (isListening ? 'Stop listening' : 'Start voice input')}
                      >
                        {isListening ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 6h12v12H6z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                        )}
                      </button>
                    )}

                    {/* Attachment Button */}
                    <button
                      onClick={triggerFileInput}
                      disabled={isLoading || conversationEnded}
                      className="p-3 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={(isLoading || conversationEnded) ? tFallback('ui.bealeThinking') : 'Upload files (max 10MB)'}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    </button>

                    {/* Emoji Button */}
                    <button
                      onClick={(e) =>
                      {
                        e.stopPropagation();
                        if (showEmojiPicker)
                        {
                          setShowEmojiPicker(false);
                        } else
                        {
                          setShowEmojiPicker(true);
                        }
                      }}
                      disabled={isLoading && !isListening}
                      className={`p-3 rounded-xl transition-all duration-200 ${showEmojiPicker
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                        } ${(isLoading && !isListening) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title={(isLoading && !isListening) ? tFallback('ui.bealeThinking') : (showEmojiPicker ? 'Close emoji picker' : 'Add emoji')}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <circle cx="12" cy="12" r="10" />
                        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                        <line x1="9" y1="9" x2="9.01" y2="9" />
                        <line x1="15" y1="9" x2="15.01" y2="9" />
                      </svg>
                    </button>
                  </div>

                  {/* Text Input */}
                  <div className="flex items-center w-full gap-2">
                    <div className="flex-1 relative">
                      <textarea
                        rows={1}
                        value={input}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        onInput={(e) =>
                        {
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = 'auto'; // reset height
                          target.style.height = target.scrollHeight + 'px'; // expand to fit content
                        }}
                        placeholder={
                          conversationEnded
                            ? selectedLanguage === 'es'
                              ? "Conversación terminada"
                              : selectedLanguage === 'ar'
                                ? "انتهت المحادثة"
                                : "Conversation ended"
                            : tFallback('ui.enterMessage')
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-800 placeholder-gray-500 shadow-sm resize-none overflow-hidden"
                        disabled={isLoading || conversationEnded}
                      />

                      {input && (
                        <button
                          onClick={() => setInput('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          type="button"
                        >
                          ✕
                        </button>
                      )}


                      {/* Stop Speaking Button - Inline */}
                      {isSpeaking && (
                        <button
                          onClick={stopSpeaking}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg border border-red-200 text-xs font-medium transition-colors"
                          title="Stop Beale from speaking"
                        >
                          <svg className="w-3 h-3 mr-1 inline" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 6h12v12H6z" />
                          </svg>
                          Stop
                        </button>
                      )}
                    </div>

                    {/* Send Button */}
                    <button
                      onClick={() => sendMessage()}
                      disabled={(() =>
                      {
                        if (conversationEnded) return true;
                        if (isLoading) return true;
                        if (!input.trim() && attachedFiles.length === 0) return true;

                        // Check if any images are still loading or missing previews
                        const imageFiles = attachedFiles.filter(f => f.type.startsWith('image/'));
                        const stillLoading = imageFiles.filter(f => loadingImages.has(f.name));
                        const missingPreviews = imageFiles.filter(f => !filePreviews[f.name]);
                        return stillLoading.length > 0 || missingPreviews.length > 0;
                      })()}
                      className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:scale-100 active:scale-95"
                      title={conversationEnded ? "Conversation ended" : "Send message"}
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Enhanced Status Indicators */}
                <div className="mt-3 space-y-2">
                  {/* Voice input status */}
                  {isListening && (
                    <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl p-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                        <span className="font-medium text-red-700">Listening... Speak now</span>
                      </div>
                      <button
                        onClick={toggleListening}
                        className="px-3 py-1 bg-red-500 text-white text-xs rounded-full hover:bg-red-600 transition-colors font-medium"
                      >
                        Stop
                      </button>
                    </div>
                  )}

                  {/* Voice command feedback */}
                  {voiceCommand && (
                    <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">{voiceCommand}</span>
                    </div>
                  )}

                  {/* Speaking status with stop instructions */}
                  {isSpeaking && (
                    <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl p-3">
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                        </svg>
                        <span className="font-medium text-orange-700">Beale is speaking...</span>
                      </div>
                      <button
                        onClick={stopSpeaking}
                        className="px-3 py-1 bg-orange-500 text-white text-xs rounded-full hover:bg-orange-600 transition-colors font-medium"
                      >
                        Stop Speaking
                      </button>
                    </div>
                  )}

                  {/* Speech support notice */}
                  {!isSupported && (
                    <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-2">
                      💡 Voice input not supported in this browser. Please use Chrome, Edge, or Safari.
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Emoji Picker */}
              {showEmojiPicker && (
                <div className="emoji-picker absolute bottom-24 right-8 bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 z-50 max-w-sm">
                  <div className="text-sm font-medium text-gray-700 mb-3">Choose an emoji</div>
                  <div className="grid grid-cols-8 gap-2">
                    {['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => insertEmoji(emoji)}
                        className="text-2xl hover:bg-gray-100 rounded-lg p-2 transition-colors"
                        title={`Insert ${emoji} emoji`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Footer */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 border-t border-gray-200 px-6 py-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2 md:mb-0">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>{tFallback('ui.poweredBy')}</span>
                    <span className="font-semibold text-blue-600">Coriano Harris</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <a
                      href="mailto:me@corianoharris.com"
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors flex items-center space-x-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>me@corianoharris.com</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4"
          style={{ zIndex: 9999999 }}
          onClick={closeImageModal}
        >
          <div className="relative w-full max-w-4xl max-h-[90vh]">
            <button
              onClick={closeImageModal}
              className="absolute top-2 right-2 z-10 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all"
              title="Close"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div
              className="relative w-full h-full bg-white rounded-lg shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              style={{ maxHeight: 'calc(90vh - 2rem)' }}
            >
              <Image
                src={modalImageSrc}
                alt="Full size image"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 95vw, 90vw"
                style={{ objectFit: 'contain' }}
                priority={true}
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgZmlsbD0iI0YzRjRGNiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjNGNEY2Ii8+PC9zdmc+"
                onError={(e) =>
                {
                  console.error('Modal image failed to load:', modalImageSrc);
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
                onLoad={() =>
                {
                  console.log('Modal image loaded successfully:', modalImageSrc);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
