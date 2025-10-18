'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  relevantPages?: Array<{
    title: string;
    url: string;
    similarity: number;
  }>;
}

interface ChatResponse {
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

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [userId] = useState(() => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voiceCommand, setVoiceCommand] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onstart = () => {
          setIsListening(true);
        };
        
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
          
          // Check if user said a send command
          const sendCommands = ['send', 'send message', 'go', 'submit', 'enter'];
          const shouldAutoSend = sendCommands.some(cmd => 
            transcript.toLowerCase().includes(cmd)
          );
          
          if (shouldAutoSend) {
            // Show voice command feedback
            setVoiceCommand('Sending...');
            
            // Remove the send command from the input
            const cleanTranscript = transcript
              .replace(/\b(send|send message|go|submit|enter)\b/gi, '')
              .trim();
            setInput(cleanTranscript);
            
            // Auto-send after a short delay
            setTimeout(() => {
              if (cleanTranscript) {
                sendMessage();
                setVoiceCommand(null);
              }
            }, 300);
          } else {
            // Auto-send the message after a longer delay for regular speech
            setTimeout(() => {
              if (transcript.trim()) {
                sendMessage();
              }
            }, 1500);
          }
        };
        
        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };
        
        recognition.onend = () => {
          setIsListening(false);
        };
        
        recognitionRef.current = recognition;
      }
    }
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          question: input.trim(),
          conversationId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data: ChatResponse = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: data.answer,
        timestamp: data.timestamp,
        relevantPages: data.relevantPages
      };

      setMessages(prev => [...prev, assistantMessage]);
      setConversationId(data.conversationId);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: 'Sorry, I encountered an error. Please try again or call Memphis 311 at (901)636-6500.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Memphis 211/311 Assistant</h1>
                <p className="text-sm text-gray-500">AI-powered city services help</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <span>Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Centered */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl mx-auto">
          {/* Chat Container */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Messages Area */}
            <div className="h-96 sm:h-[500px] overflow-y-auto p-6">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Welcome to Memphis Maven! 🎵</h3>
                  <p className="text-gray-600 mb-6 max-w-md">
                    Hey there, Memphis! I'm Memphis Maven, your friendly neighborhood AI assistant. I'm super excited to help you with city services, report issues, and answer questions in English, Spanish, or Arabic. Let's make Memphis even more awesome together! 🎵
                  </p>
                  
                  {/* Voice input feature notice */}
                  {isSupported && (
                    <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-2 text-blue-700">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                        <span className="text-sm font-medium">Voice input available!</span>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        Click the microphone icon to speak your question
                      </p>
                      <p className="text-xs text-blue-500 mt-1">
                        Say "send" to automatically send your message
                      </p>
                    </div>
                  )}
                  
                  {/* Example Questions */}
                  <div className="w-full max-w-2xl">
                    <p className="text-sm font-medium text-gray-700 mb-4">Try asking:</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        // English example
                        "How do I report a pothole?",
                        
                        // Spanish example
                        "¿Cómo reporto un bache?",
                        
                        // Arabic example
                        "كيف أبلغ عن حفرة في الطريق؟"
                      ].map((example, index) => (
                        <button
                          key={index}
                          onClick={() => setInput(example)}
                          className="text-left p-3 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors text-sm text-gray-700 hover:shadow-sm"
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs sm:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-900 rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.text}</p>
                        
                        {/* Display relevant pages for assistant messages */}
                        {message.role === 'assistant' && message.relevantPages && message.relevantPages.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <div className="text-xs font-medium text-gray-600 mb-2">
                              📄 Relevant Resources ({message.relevantPages.length}):
                            </div>
                            {message.relevantPages.map((page, index) => (
                              <div key={index} className="bg-white bg-opacity-50 rounded-lg p-2 border border-gray-200">
                                <a
                                  href={page.url}
            target="_blank"
            rel="noopener noreferrer"
                                  className="block hover:bg-opacity-70 transition-colors"
                                >
                                  <div className="text-xs font-medium text-blue-700 hover:text-blue-800 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                    {page.title}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1 truncate">
                                    {page.url}
                                  </div>
                                  <div className="text-xs text-gray-400 mt-1 flex items-center space-x-1">
                                    <span>Relevance:</span>
                                    <span className={`font-medium ${
                                      page.similarity > 0.7 ? 'text-green-600' : 
                                      page.similarity > 0.5 ? 'text-yellow-600' : 'text-gray-500'
                                    }`}>
                                      {Math.round(page.similarity * 100)}%
                                    </span>
                                  </div>
          </a>
        </div>
                            ))}
                          </div>
                        )}
                        
                        <p className={`text-xs mt-2 ${
                          message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-900 max-w-xs sm:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl rounded-bl-md">
                        <div className="flex items-center space-x-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-sm font-medium">Memphis Maven is searching...</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          Finding relevant information and generating response
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          💡 This may take a few seconds...
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex space-x-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about Memphis city services..."
                    className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                    disabled={isLoading}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    {/* Speech to Text Button */}
                    {isSupported && (
                      <button
                        onClick={isListening ? stopListening : startListening}
                        disabled={isLoading}
                        className={`p-2 rounded-lg transition-colors ${
                          isListening
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                        }`}
                        title={isListening ? 'Stop listening' : 'Start voice input'}
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
                    {/* Type indicator */}
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21l4-7 4 7M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2"
                >
                  <span>Send</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              
              {/* Voice input status */}
              {isListening && (
                <div className="mt-2 flex items-center space-x-2 text-sm text-red-600">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  <span>Listening... Speak now</span>
                </div>
              )}
              
              {/* Voice command feedback */}
              {voiceCommand && (
                <div className="mt-2 flex items-center space-x-2 text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>{voiceCommand}</span>
                </div>
              )}
              
              {/* Speech support notice */}
              {!isSupported && (
                <div className="mt-2 text-xs text-gray-500">
                  Voice input not supported in this browser. Please use Chrome, Edge, or Safari.
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Call 211: <a href="tel:211" className="text-purple-600 hover:underline font-medium">211</a></span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>Call 311: <a href="tel:901-636-6500" className="text-blue-600 hover:underline font-medium">(901)636-6500</a></span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span>Emergency: <a href="tel:911" className="text-red-600 hover:underline font-bold">911</a></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
