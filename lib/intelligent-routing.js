/**
 * Intelligent Routing & Escalation System
 * Handles smart routing of requests and escalation to human agents
 */

import { classifyIntent } from './services-classification.js';

class IntelligentRoutingSystem {
  constructor() {
    this.escalationRules = new Map();
    this.humanAgents = new Map();
    this.routingHistory = [];
    this.activeTransfers = new Map();
    
    this.initializeEscalationRules();
    this.initializeHumanAgents();
  }

  /**
   * Initialize escalation rules based on urgency and type
   */
  initializeEscalationRules() {
    this.escalationRules.set('emergency', {
      trigger: 'emergency_keywords',
      timeLimit: 0, // Immediate
      required: true,
      target: '911_emergency_services',
      message: 'Transferring to emergency services immediately',
      priority: 'critical'
    });

    this.escalationRules.set('urgent_city_service', {
      trigger: 'urgent_service_keywords',
      timeLimit: 300, // 5 minutes
      required: true,
      target: 'city_services_supervisor',
      message: 'Connecting you with a city services specialist',
      priority: 'high'
    });

    this.escalationRules.set('frustrated_user', {
      trigger: 'frustration_indicators',
      timeLimit: 180, // 3 minutes
      required: true,
      target: 'customer_service_lead',
      message: 'Let me connect you with someone who can help resolve this',
      priority: 'medium'
    });

    this.escalationRules.set('complex_inquiry', {
      trigger: 'complexity_score',
      timeLimit: 600, // 10 minutes
      required: false,
      target: 'knowledge_specialist',
      message: 'This might be better handled by one of our specialists',
      priority: 'low'
    });

    this.escalationRules.set('repeated_contact', {
      trigger: 'multiple_attempts',
      timeLimit: 120, // 2 minutes
      required: true,
      target: 'follow_up_specialist',
      message: 'I see this is a follow-up. Let me get you to someone familiar with your case',
      priority: 'medium'
    });
  }

  /**
   * Initialize available human agents
   */
  initializeHumanAgents() {
    this.humanAgents.set('911_emergency_services', {
      name: 'Emergency Services',
      phone: '911',
      available: '24/7',
      specialties: ['medical emergency', 'fire', 'crime', 'immediate danger'],
      estimatedWait: 'immediate',
      onlineSupport: false
    });

    this.humanAgents.set('city_services_supervisor', {
      name: 'City Services Supervisor',
      phone: '(901) 636-6500',
      extension: 'Supervisor Queue',
      available: 'Mon-Fri 8AM-5PM',
      specialties: ['potholes', 'streetlights', 'traffic issues', 'infrastructure'],
      estimatedWait: '5-15 minutes',
      onlineSupport: true,
      languages: ['English', 'Spanish']
    });

    this.humanAgents.set('customer_service_lead', {
      name: 'Customer Service Lead',
      phone: '(901) 636-6500',
      extension: 'Customer Service',
      available: 'Mon-Fri 8AM-6PM, Sat 9AM-1PM',
      specialties: ['complaints', 'service issues', 'billing questions', 'general inquiries'],
      estimatedWait: '10-20 minutes',
      onlineSupport: true,
      callbackAvailable: true
    });

    this.humanAgents.set('community_resources_specialist', {
      name: 'Community Resources Specialist',
      phone: '211',
      available: '24/7',
      specialties: ['food assistance', 'housing help', 'utility assistance', 'employment services'],
      estimatedWait: 'immediate',
      onlineSupport: true,
      languages: ['English', 'Spanish', 'Arabic', 'other languages via interpreter']
    });

    this.humanAgents.set('technical_support', {
      name: 'Technical Support',
      phone: '(901) 636-6500',
      extension: 'Technical Support',
      available: 'Mon-Fri 9AM-4PM',
      specialties: ['website issues', 'app problems', 'system errors', 'account issues'],
      estimatedWait: '15-30 minutes',
      onlineSupport: true
    });
  }

  /**
   * Analyze request and determine if escalation is needed
   */
  async analyzeEscalationNeed(userInput, conversationHistory = [], context = {}) {
    const intent = classifyIntent(userInput, context);
    
    // Check for immediate emergency triggers
    if (intent.category === 'emergency') {
      return {
        shouldEscalate: true,
        escalationType: 'emergency',
        urgency: 'critical',
        reason: 'Emergency situation detected',
        targetAgent: '911_emergency_services',
        confidence: 0.95
      };
    }

    // Analyze conversation for escalation triggers
    const escalationAnalysis = this.analyzeConversationForEscalation(
      conversationHistory, 
      context
    );

    // Check time-based escalation
    const timeBasedEscalation = this.checkTimeBasedEscalation(context);

    // Determine overall escalation need
    const escalationNeed = this.determineEscalationNeed(
      intent, 
      escalationAnalysis, 
      timeBasedEscalation
    );

    return escalationNeed;
  }

  /**
   * Analyze conversation history for escalation triggers
   */
  analyzeConversationForEscalation(conversationHistory, context) {
    const triggers = {
      frustration: this.detectFrustration(conversationHistory),
      complexity: this.assessComplexity(conversationHistory),
      repetition: this.detectRepetition(conversationHistory),
      urgency: this.assessUrgency(conversationHistory, context)
    };

    const escalationReasons = [];
    
    if (triggers.frustration.score > 0.7) {
      escalationReasons.push({
        type: 'frustrated_user',
        score: triggers.frustration.score,
        evidence: triggers.frustration.evidence
      });
    }

    if (triggers.complexity.score > 0.8) {
      escalationReasons.push({
        type: 'complex_inquiry',
        score: triggers.complexity.score,
        evidence: triggers.complexity.evidence
      });
    }

    if (triggers.repetition.count > 2) {
      escalationReasons.push({
        type: 'repeated_contact',
        score: 0.8,
        evidence: `${triggers.repetition.count} repeated attempts`
      });
    }

    return {
      shouldEscalate: escalationReasons.length > 0,
      reasons: escalationReasons,
      overallScore: Math.max(...escalationReasons.map(r => r.score), 0)
    };
  }

  /**
   * Detect user frustration in conversation
   */
  detectFrustration(conversationHistory) {
    const frustrationKeywords = [
      'frustrated', 'annoying', 'ridiculous', 'useless', 'waste of time',
      'not working', 'broken', 'terrible', 'awful', 'hate', 'angry',
      'escalate', 'supervisor', 'manager', 'complaint'
    ];

    const responses = conversationHistory.filter(msg => msg.role === 'user');
    let frustrationScore = 0;
    const evidence = [];

    responses.forEach(response => {
      const text = response.content.toLowerCase();
      const matchedKeywords = frustrationKeywords.filter(keyword => 
        text.includes(keyword)
      );
      
      if (matchedKeywords.length > 0) {
        frustrationScore += matchedKeywords.length * 0.2;
        evidence.push(`Frustration indicators: ${matchedKeywords.join(', ')}`);
      }
    });

    return {
      score: Math.min(frustrationScore, 1.0),
      evidence: evidence
    };
  }

  /**
   * Assess complexity of the inquiry
   */
  assessComplexity(conversationHistory) {
    const complexityIndicators = [
      'multiple issues',
      'legal question', 
      'policy question',
      'billing dispute',
      'special circumstance',
      'exception to rule',
      'inter departmental',
      'complex situation'
    ];

    const allText = conversationHistory
      .map(msg => msg.content.toLowerCase())
      .join(' ');

    const matchedIndicators = complexityIndicators.filter(indicator => 
      allText.includes(indicator)
    );

    const complexityScore = matchedIndicators.length * 0.15;
    
    return {
      score: Math.min(complexityScore, 1.0),
      evidence: matchedIndicators
    };
  }

  /**
   * Detect repeated contact attempts
   */
  detectRepetition(conversationHistory) {
    // Group by similar requests (simplified for demo)
    const requests = conversationHistory
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content.toLowerCase());

    const repetitionPatterns = {};
    requests.forEach(request => {
      const key = request.split(' ').slice(0, 3).join(' '); // First 3 words
      repetitionPatterns[key] = (repetitionPatterns[key] || 0) + 1;
    });

    const maxRepetition = Math.max(...Object.values(repetitionPatterns));
    
    return {
      count: maxRepetition,
      patterns: repetitionPatterns
    };
  }

  /**
   * Assess urgency from conversation
   */
  assessUrgency(conversationHistory, context) {
    const urgencyKeywords = [
      'urgent', 'emergency', 'asap', 'immediately', 'right now',
      'deadline', 'time sensitive', 'critical', 'urgent'
    ];

    const allText = conversationHistory
      .map(msg => msg.content.toLowerCase())
      .join(' ');

    const urgencyMatches = urgencyKeywords.filter(keyword => 
      allText.includes(keyword)
    ).length;

    return {
      score: Math.min(urgencyMatches * 0.2, 1.0),
      evidence: urgencyMatches
    };
  }

  /**
   * Check for time-based escalation triggers
   */
  checkTimeBasedEscalation(context) {
    const currentTime = new Date();
    const startTime = new Date(context.sessionStartTime || currentTime);
    const sessionDuration = (currentTime - startTime) / 1000 / 60; // minutes

    let escalationNeeded = false;
    let reason = null;

    // Escalate if session has been going on too long without resolution
    if (sessionDuration > 10 && !context.issueResolved) {
      escalationNeeded = true;
      reason = 'extended_session';
    }

    // Escalate after business hours for certain types
    if (this.isAfterHours() && context.serviceType === 'urgent') {
      escalationNeeded = true;
      reason = 'after_hours_urgent';
    }

    return {
      shouldEscalate: escalationNeeded,
      reason: reason,
      sessionDuration: sessionDuration
    };
  }

  /**
   * Determine overall escalation need
   */
  determineEscalationNeed(intent, conversationAnalysis, timeAnalysis) {
    // Priority-based escalation decision
    if (intent.category === 'emergency') {
      return {
        shouldEscalate: true,
        escalationType: 'emergency',
        urgency: 'critical',
        reason: 'Emergency detected in initial request',
        targetAgent: '911_emergency_services',
        confidence: 0.95
      };
    }

    if (conversationAnalysis.shouldEscalate) {
      const primaryReason = conversationAnalysis.reasons.reduce((prev, current) => 
        prev.score > current.score ? prev : current
      );

      return {
        shouldEscalate: true,
        escalationType: primaryReason.type,
        urgency: this.getUrgencyLevel(primaryReason.type),
        reason: `Conversation analysis: ${primaryReason.evidence.join(', ')}`,
        targetAgent: this.getTargetAgent(primaryReason.type),
        confidence: primaryReason.score
      };
    }

    if (timeAnalysis.shouldEscalate) {
      return {
        shouldEscalate: true,
        escalationType: timeAnalysis.reason,
        urgency: 'medium',
        reason: `Time-based escalation: ${timeAnalysis.sessionDuration} minutes`,
        targetAgent: 'customer_service_lead',
        confidence: 0.7
      };
    }

    return {
      shouldEscalate: false,
      escalationType: null,
      urgency: 'low',
      reason: 'No escalation triggers detected',
      confidence: 0.1
    };
  }

  /**
   * Get urgency level for escalation type
   */
  getUrgencyLevel(escalationType) {
    const urgencyMap = {
      'emergency': 'critical',
      'urgent_city_service': 'high',
      'frustrated_user': 'medium',
      'complex_inquiry': 'low',
      'repeated_contact': 'medium'
    };

    return urgencyMap[escalationType] || 'medium';
  }

  /**
   * Get target agent for escalation type
   */
  getTargetAgent(escalationType) {
    const agentMap = {
      'emergency': '911_emergency_services',
      'urgent_city_service': 'city_services_supervisor',
      'frustrated_user': 'customer_service_lead',
      'complex_inquiry': 'technical_support',
      'repeated_contact': 'follow_up_specialist'
    };

    return agentMap[escalationType] || 'customer_service_lead';
  }

  /**
   * Check if current time is after business hours
   */
  isAfterHours() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday

    // After hours: before 8 AM or after 5 PM on weekdays, all weekend
    return (day === 0 || day === 6) || (hour < 8 || hour > 17);
  }

  /**
   * Execute escalation
   */
  async executeEscalation(escalationNeed, userContext = {}) {
    try {
      const agent = this.humanAgents.get(escalationNeed.targetAgent);
      
      if (!agent) {
        throw new Error(`Agent ${escalationNeed.targetAgent} not found`);
      }

      // Create transfer record
      const transferId = `TRANS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const transferRecord = {
        id: transferId,
        timestamp: new Date().toISOString(),
        escalationType: escalationNeed.escalationType,
        urgency: escalationNeed.urgency,
        targetAgent: escalationNeed.targetAgent,
        userContext: userContext,
        status: 'initiated',
        estimatedWait: agent.estimatedWait
      };

      this.activeTransfers.set(transferId, transferRecord);
      this.routingHistory.push(transferRecord);

      // Generate escalation response
      const escalationResponse = this.generateEscalationResponse(
        escalationNeed, 
        agent, 
        transferId
      );

      return {
        success: true,
        transferId: transferId,
        response: escalationResponse,
        agent: agent,
        nextSteps: this.getEscalationNextSteps(escalationNeed, agent)
      };

    } catch (error) {
      console.error('Error executing escalation:', error);
      return {
        success: false,
        error: 'Unable to process escalation request',
        fallbackAction: 'Continue with AI assistance or provide direct contact information'
      };
    }
  }

  /**
   * Generate escalation response message
   */
  generateEscalationResponse(escalationNeed, agent, transferId) {
    const responses = {
      emergency: {
        message: "🚨 I'm connecting you to emergency services immediately. This is a critical situation.",
        instruction: "Stay on the line - emergency services will be with you shortly.",
        contact: "Call 911 directly if this connection fails."
      },
      
      urgent_city_service: {
        message: "Let me connect you with a city services supervisor right away.",
        instruction: `Please hold while I transfer you. Estimated wait: ${agent.estimatedWait}`,
        contact: `Direct line: ${agent.phone} ${agent.extension ? `(${agent.extension})` : ''}`
      },
      
      frustrated_user: {
        message: "I understand your frustration. Let me get you to someone who can help resolve this.",
        instruction: `One moment please - connecting you to ${agent.name}`,
        contact: `${agent.name}: ${agent.phone}`
      },
      
      complex_inquiry: {
        message: "This is a complex situation that might benefit from specialist assistance.",
        instruction: `I'm connecting you with ${agent.name} who can provide detailed help.`,
        contact: `${agent.name}: ${agent.phone}`
      },
      
      repeated_contact: {
        message: "I see this is a follow-up situation. Let me connect you with someone familiar with your case.",
        instruction: `Transferring to ${agent.name} for continuity of service.`,
        contact: `Reference number: ${transferId}`
      }
    };

    return responses[escalationNeed.escalationType] || responses.frustrated_user;
  }

  /**
   * Get next steps for user during escalation
   */
  getEscalationNextSteps(escalationNeed, agent) {
    const steps = {
      emergency: [
        "Stay on the line while we connect you",
        "If disconnected, call 911 immediately",
        "Have your location ready"
      ],
      
      urgent_city_service: [
        "Prepare to describe your issue briefly",
        "Have your address or location details ready",
        "Note any reference numbers from previous contacts"
      ],
      
      frustrated_user: [
        "Take a deep breath - we're going to resolve this",
        "Be ready to explain what happened so far",
        "Let them know if you have any deadlines"
      ],
      
      complex_inquiry: [
        "Gather any relevant documents or information",
        "Prepare specific questions you need answered",
        "Ask about resolution timelines"
      ],
      
      repeated_contact: [
        "Mention you're following up on reference number",
        "Explain what has happened in previous contacts",
        "Ask for status update on your case"
      ]
    };

    return steps[escalationNeed.escalationType] || steps.frustrated_user;
  }

  /**
   * Get agent availability information
   */
  getAgentAvailability(agentType) {
    const agent = this.humanAgents.get(agentType);
    if (!agent) return null;

    return {
      name: agent.name,
      availability: agent.available,
      estimatedWait: agent.estimatedWait,
      specialties: agent.specialties,
      callbackAvailable: agent.callbackAvailable || false,
      onlineSupport: agent.onlineSupport || false,
      languages: agent.languages || ['English']
    };
  }

  /**
   * Get escalation statistics
   */
  getEscalationStats() {
    const totalTransfers = this.routingHistory.length;
    const urgencyBreakdown = {};
    const typeBreakdown = {};
    
    this.routingHistory.forEach(transfer => {
      urgencyBreakdown[transfer.urgency] = (urgencyBreakdown[transfer.urgency] || 0) + 1;
      typeBreakdown[transfer.escalationType] = (typeBreakdown[transfer.escalationType] || 0) + 1;
    });

    return {
      totalTransfers,
      urgencyBreakdown,
      typeBreakdown,
      activeTransfers: this.activeTransfers.size
    };
  }
}

// Escalation response templates
const escalationTemplates = {
  // Pre-escalation messages
  preparing_transfer: [
    "Let me get you to someone who can help with this right away...",
    "I'll connect you with a specialist who deals with this type of situation...",
    "One moment while I transfer you to the appropriate department...",
    "I want to make sure you get the help you need. Let me connect you..."
  ],

  // During transfer wait
  transfer_wait: [
    "Please hold while I connect you...",
    "Transferring you now...",
    "Connecting you to the right person...",
    "Setting up the transfer..."
  ],

  // Post-transfer confirmation
  transfer_complete: [
    "You're now connected! They'll be able to help you with this.",
    "Transfer complete! They'll continue helping you from here.",
    "Connected! They have all the information they need to assist you.",
    "Transfer successful! Someone will be with you shortly."
  ],

  // Transfer failure handling
  transfer_failed: [
    "I'm having trouble with the transfer. Let me give you their direct number.",
    "The transfer didn't go through. Here's how to reach them directly:",
    "Let me try a different approach to get you connected.",
    "I'll give you their direct information instead:"
  ]
};

export {
  IntelligentRoutingSystem,
  escalationTemplates
};