/**
 * Progressive Handoff System
 * Enables human operators to intervene in AI conversations mid-stream
 * Provides seamless transition between AI and human assistance
 */

import { v4 as uuidv4 } from 'uuid';

class ProgressiveHandoffSystem {
  constructor() {
    this.activeSessions = new Map(); // conversationId -> session data
    this.operatorPool = new Map(); // operatorId -> operator status
    this.interventionQueue = new Map(); // conversationId -> intervention requests
    this.sessionHistory = new Map(); // conversationId -> message history

    this.interventionTriggers = {
      lowConfidence: 0.4, // Trigger at 40% confidence
      userFrustration: ['frustrated', 'confused', 'doesn\'t work', 'not helping'],
      complexTopics: ['legal', 'medical', 'financial', 'permits', 'zoning'],
      escalationKeywords: ['speak to human', 'talk to person', 'real person', 'supervisor'],
      repeatedQuestions: 3 // After 3 similar questions
    };

    this.initializeSystem();
  }

  /**
   * Initialize the progressive handoff system
   */
  initializeSystem() {
    // Set up monitoring for automatic intervention triggers
    this.startMonitoringLoop();

    // Initialize operator pool with mock operators for demo
    this.initializeOperatorPool();

    console.log('✅ Progressive Handoff System initialized');
  }

  /**
   * Initialize operator pool
   */
  initializeOperatorPool() {
    // Mock operators for demonstration
    const operators = [
      { id: 'op-001', name: 'Sarah Johnson', skills: ['general', 'urgent'], status: 'available' },
      { id: 'op-002', name: 'Mike Chen', skills: ['technical', 'permits'], status: 'available' },
      { id: 'op-003', name: 'Lisa Rodriguez', skills: ['spanish', 'accessibility'], status: 'busy' },
      { id: 'op-004', name: 'David Williams', skills: ['emergency', 'supervisor'], status: 'available' }
    ];

    operators.forEach(op => {
      this.operatorPool.set(op.id, op);
    });
  }

  /**
   * Start monitoring conversations for intervention triggers
   */
  startMonitoringLoop() {
    setInterval(() => {
      this.checkForInterventions();
    }, 5000); // Check every 5 seconds
  }

  /**
   * Register a new conversation session
   */
  registerSession(conversationId, userId, initialContext = {}) {
    const session = {
      id: conversationId,
      userId: userId,
      startTime: new Date().toISOString(),
      status: 'ai_active', // ai_active, human_pending, human_active, ai_resumed
      operatorId: null,
      messages: [],
      context: initialContext,
      interventionHistory: [],
      confidenceHistory: [],
      lastActivity: new Date().toISOString()
    };

    this.activeSessions.set(conversationId, session);
    this.sessionHistory.set(conversationId, []);

    return session;
  }

  /**
   * Record a message in the conversation
   */
  recordMessage(conversationId, message, sender, metadata = {}) {
    const session = this.activeSessions.get(conversationId);
    if (!session) return false;

    const messageRecord = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      sender: sender, // 'user', 'ai', 'human_operator'
      content: message,
      metadata: metadata
    };

    session.messages.push(messageRecord);
    session.lastActivity = messageRecord.timestamp;

    // Update session history
    const history = this.sessionHistory.get(conversationId) || [];
    history.push(messageRecord);
    this.sessionHistory.set(conversationId, history.slice(-50)); // Keep last 50 messages

    // Check for intervention triggers
    if (sender === 'user') {
      this.evaluateInterventionTriggers(conversationId, message, metadata);
    }

    return true;
  }

  /**
   * Evaluate if intervention is needed based on triggers
   */
  evaluateInterventionTriggers(conversationId, userMessage, metadata) {
    const session = this.activeSessions.get(conversationId);
    if (!session || session.status !== 'ai_active') return;

    const triggers = [];

    // Low confidence trigger
    if (metadata.confidence && metadata.confidence < this.interventionTriggers.lowConfidence) {
      triggers.push({
        type: 'low_confidence',
        severity: 'high',
        reason: `AI confidence dropped to ${Math.round(metadata.confidence * 100)}%`
      });
    }

    // User frustration trigger
    const frustrationWords = this.interventionTriggers.userFrustration;
    if (frustrationWords.some(word => userMessage.toLowerCase().includes(word))) {
      triggers.push({
        type: 'user_frustration',
        severity: 'high',
        reason: 'User expressed frustration or confusion'
      });
    }

    // Complex topics trigger
    const complexTopics = this.interventionTriggers.complexTopics;
    if (complexTopics.some(topic => userMessage.toLowerCase().includes(topic))) {
      triggers.push({
        type: 'complex_topic',
        severity: 'medium',
        reason: 'Complex topic requiring specialized knowledge'
      });
    }

    // Escalation keywords trigger
    const escalationKeywords = this.interventionTriggers.escalationKeywords;
    if (escalationKeywords.some(keyword => userMessage.toLowerCase().includes(keyword))) {
      triggers.push({
        type: 'explicit_request',
        severity: 'critical',
        reason: 'User explicitly requested human assistance'
      });
    }

    // Repeated questions trigger
    if (this.detectRepeatedQuestions(conversationId, userMessage)) {
      triggers.push({
        type: 'repeated_questions',
        severity: 'medium',
        reason: 'User asking similar questions repeatedly'
      });
    }

    // Process triggers
    if (triggers.length > 0) {
      this.requestIntervention(conversationId, triggers);
    }
  }

  /**
   * Detect if user is asking repeated questions
   */
  detectRepeatedQuestions(conversationId, currentMessage) {
    const history = this.sessionHistory.get(conversationId) || [];
    const userMessages = history.filter(msg => msg.sender === 'user').slice(-6); // Last 6 user messages

    if (userMessages.length < this.interventionTriggers.repeatedQuestions) return false;

    // Simple similarity check - count how many recent messages are similar
    let similarCount = 0;
    const currentWords = currentMessage.toLowerCase().split(/\s+/);

    userMessages.forEach(msg => {
      const msgWords = msg.content.toLowerCase().split(/\s+/);
      const commonWords = currentWords.filter(word => msgWords.includes(word)).length;
      const similarity = commonWords / Math.max(currentWords.length, msgWords.length);

      if (similarity > 0.6) similarCount++;
    });

    return similarCount >= this.interventionTriggers.repeatedQuestions;
  }

  /**
   * Request human intervention
   */
  requestIntervention(conversationId, triggers) {
    const session = this.activeSessions.get(conversationId);
    if (!session) return false;

    // Find highest severity trigger
    const highestSeverity = triggers.reduce((max, trigger) =>
      this.getSeverityWeight(trigger.severity) > this.getSeverityWeight(max.severity) ? trigger : max
    );

    const interventionRequest = {
      id: uuidv4(),
      conversationId: conversationId,
      timestamp: new Date().toISOString(),
      triggers: triggers,
      primaryTrigger: highestSeverity,
      status: 'pending', // pending, assigned, active, completed
      assignedOperator: null,
      priority: this.calculatePriority(highestSeverity.severity, session)
    };

    this.interventionQueue.set(conversationId, interventionRequest);

    // Try to assign operator immediately
    this.assignOperator(interventionRequest);

    return true;
  }

  /**
   * Get severity weight for prioritization
   */
  getSeverityWeight(severity) {
    const weights = { low: 1, medium: 2, high: 3, critical: 4 };
    return weights[severity] || 1;
  }

  /**
   * Calculate intervention priority
   */
  calculatePriority(severity, session) {
    let priority = this.getSeverityWeight(severity);

    // Increase priority for long conversations
    const conversationDuration = Date.now() - new Date(session.startTime).getTime();
    if (conversationDuration > 15 * 60 * 1000) priority += 1; // 15+ minutes

    // Increase priority for VIP users (could be based on user data)
    if (session.context.vipUser) priority += 2;

    return Math.min(priority, 5); // Max priority 5
  }

  /**
   * Assign available operator to intervention
   */
  assignOperator(interventionRequest) {
    const availableOperators = Array.from(this.operatorPool.values())
      .filter(op => op.status === 'available')
      .sort((a, b) => this.getOperatorPriority(a, interventionRequest) - this.getOperatorPriority(b, interventionRequest));

    if (availableOperators.length === 0) {
      // No operators available, add to queue
      interventionRequest.status = 'queued';
      return false;
    }

    const assignedOperator = availableOperators[0];
    assignedOperator.status = 'busy';

    interventionRequest.assignedOperator = assignedOperator.id;
    interventionRequest.status = 'assigned';

    this.operatorPool.set(assignedOperator.id, assignedOperator);

    // Notify operator (in real implementation, this would send a notification)
    console.log(`👤 Assigned operator ${assignedOperator.name} to conversation ${interventionRequest.conversationId}`);

    return true;
  }

  /**
   * Calculate operator priority for assignment
   */
  getOperatorPriority(operator, interventionRequest) {
    let priority = 0;

    // Skill matching
    const requiredSkills = this.getRequiredSkills(interventionRequest.primaryTrigger);
    const skillMatch = requiredSkills.some(skill => operator.skills.includes(skill));
    if (skillMatch) priority -= 2; // Higher priority for skill match

    // Workload balancing (prefer less busy operators)
    // For now, simple random assignment

    return priority;
  }

  /**
   * Get required skills for intervention
   */
  getRequiredSkills(primaryTrigger) {
    const skillMap = {
      low_confidence: ['general'],
      user_frustration: ['general', 'de-escalation'],
      complex_topic: ['technical', 'specialized'],
      explicit_request: ['general'],
      repeated_questions: ['general', 'clarification']
    };

    return skillMap[primaryTrigger.type] || ['general'];
  }

  /**
   * Check for pending interventions and assign operators
   */
  checkForInterventions() {
    const pendingInterventions = Array.from(this.interventionQueue.values())
      .filter(req => req.status === 'pending' || req.status === 'queued')
      .sort((a, b) => b.priority - a.priority); // Highest priority first

    pendingInterventions.forEach(intervention => {
      if (intervention.status === 'pending') {
        this.assignOperator(intervention);
      }
    });
  }

  /**
   * Transfer conversation to human operator
   */
  async transferToHuman(conversationId, operatorId) {
    const session = this.activeSessions.get(conversationId);
    const intervention = this.interventionQueue.get(conversationId);

    if (!session || !intervention) return false;

    // Update session status
    session.status = 'human_active';
    session.operatorId = operatorId;

    // Update intervention status
    intervention.status = 'active';
    intervention.transferTime = new Date().toISOString();

    // Record intervention in session history
    session.interventionHistory.push({
      timestamp: new Date().toISOString(),
      type: 'transfer_to_human',
      operatorId: operatorId,
      reason: intervention.primaryTrigger.reason
    });

    // Send transfer message to user
    const transferMessage = this.generateTransferMessage(intervention);
    this.recordMessage(conversationId, transferMessage, 'system', {
      type: 'transfer_notification',
      operatorId: operatorId
    });

    return true;
  }

  /**
   * Generate transfer message for user
   */
  generateTransferMessage(intervention) {
    const messages = {
      low_confidence: "I want to make sure you get the best help possible. Let me connect you with one of our human specialists who can assist you directly.",
      user_frustration: "I can tell this has been frustrating. Let me get you connected with a human representative who can help resolve this right away.",
      complex_topic: "This topic requires some specialized knowledge. I'm connecting you with an expert who can walk you through everything step by step.",
      explicit_request: "Absolutely, I'd be happy to connect you with a human representative. One moment please.",
      repeated_questions: "I want to make sure we get this sorted out completely. Let me connect you with someone who can provide more detailed assistance."
    };

    return messages[intervention.primaryTrigger.type] || "Let me connect you with a human representative for better assistance.";
  }

  /**
   * Transfer conversation back to AI
   */
  async transferToAI(conversationId, reason = 'operator_request') {
    const session = this.activeSessions.get(conversationId);
    if (!session || session.status !== 'human_active') return false;

    // Update session status
    session.status = 'ai_resumed';
    const previousOperator = session.operatorId;
    session.operatorId = null;

    // Free up operator
    if (previousOperator) {
      const operator = this.operatorPool.get(previousOperator);
      if (operator) {
        operator.status = 'available';
        this.operatorPool.set(previousOperator, operator);
      }
    }

    // Record transfer back
    session.interventionHistory.push({
      timestamp: new Date().toISOString(),
      type: 'transfer_to_ai',
      reason: reason,
      previousOperator: previousOperator
    });

    // Send resume message
    const resumeMessage = "Thanks for speaking with our human representative! I'm back to help if you need anything else.";
    this.recordMessage(conversationId, resumeMessage, 'system', {
      type: 'resume_notification'
    });

    return true;
  }

  /**
   * Get session status
   */
  getSessionStatus(conversationId) {
    const session = this.activeSessions.get(conversationId);
    if (!session) return null;

    return {
      status: session.status,
      operatorId: session.operatorId,
      messageCount: session.messages.length,
      lastActivity: session.lastActivity,
      interventionHistory: session.interventionHistory
    };
  }

  /**
   * Get operator status
   */
  getOperatorStatus(operatorId = null) {
    if (operatorId) {
      return this.operatorPool.get(operatorId) || null;
    }

    return Array.from(this.operatorPool.values());
  }

  /**
   * Get system statistics
   */
  getSystemStats() {
    const sessions = Array.from(this.activeSessions.values());
    const interventions = Array.from(this.interventionQueue.values());

    return {
      activeSessions: sessions.length,
      humanActiveSessions: sessions.filter(s => s.status === 'human_active').length,
      pendingInterventions: interventions.filter(i => i.status === 'pending').length,
      availableOperators: Array.from(this.operatorPool.values()).filter(op => op.status === 'available').length,
      totalOperators: this.operatorPool.size,
      averageInterventionTime: this.calculateAverageInterventionTime(interventions)
    };
  }

  /**
   * Calculate average intervention time
   */
  calculateAverageInterventionTime(interventions) {
    const completedInterventions = interventions.filter(i => i.transferTime);

    if (completedInterventions.length === 0) return 0;

    const totalTime = completedInterventions.reduce((sum, i) => {
      const requestTime = new Date(i.timestamp).getTime();
      const transferTime = new Date(i.transferTime).getTime();
      return sum + (transferTime - requestTime);
    }, 0);

    return Math.round(totalTime / completedInterventions.length / 1000); // Average in seconds
  }

  /**
   * Clean up old sessions
   */
  cleanupOldSessions(maxAgeHours = 24) {
    const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000);

    for (const [conversationId, session] of this.activeSessions) {
      const lastActivity = new Date(session.lastActivity).getTime();
      if (lastActivity < cutoffTime) {
        this.activeSessions.delete(conversationId);
        this.sessionHistory.delete(conversationId);
        this.interventionQueue.delete(conversationId);
      }
    }
  }
}

// Export the system
export { ProgressiveHandoffSystem };
