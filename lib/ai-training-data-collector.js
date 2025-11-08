/**
 * AI Training Data Collection System
 * Collects conversation data, feedback, and intervention patterns
 * to continuously improve AI performance through human-in-the-loop learning
 */

import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

class AITrainingDataCollector {
  constructor() {
    this.trainingData = {
      conversations: new Map(),
      feedback: new Map(),
      interventions: new Map(),
      corrections: new Map(),
      performance: new Map()
    };

    this.dataPath = './training-data';
    this.initializeDataCollection();
  }

  /**
   * Initialize data collection system
   */
  async initializeDataCollection() {
    try {
      // Ensure training data directory exists
      await fs.mkdir(this.dataPath, { recursive: true });

      // Load existing training data
      await this.loadExistingData();

      console.log('✅ AI Training Data Collector initialized');
    } catch (error) {
      console.error('Error initializing training data collector:', error);
    }
  }

  /**
   * Load existing training data from disk
   */
  async loadExistingData() {
    try {
      const files = await fs.readdir(this.dataPath);

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.dataPath, file);
          const data = JSON.parse(await fs.readFile(filePath, 'utf8'));

          const dataType = file.replace('.json', '');
          if (this.trainingData[dataType]) {
            // Convert back to Map
            this.trainingData[dataType] = new Map(Object.entries(data));
          }
        }
      }

      console.log(`📚 Loaded existing training data: ${files.length} files`);
    } catch (error) {
      console.log('No existing training data found, starting fresh');
    }
  }

  /**
   * Record a complete conversation for training
   */
  recordConversation(conversationId, conversationData) {
    const trainingRecord = {
      id: conversationId,
      timestamp: new Date().toISOString(),
      userId: conversationData.userId,
      language: conversationData.language,
      messages: conversationData.messages,
      duration: conversationData.duration,
      outcome: conversationData.outcome, // 'resolved', 'escalated', 'abandoned'
      serviceCategory: conversationData.serviceCategory,
      satisfaction: conversationData.satisfaction,
      interventions: conversationData.interventions || [],
      metadata: {
        userAgent: conversationData.userAgent,
        zipCode: conversationData.zipCode,
        accessibilityUsed: conversationData.accessibilityUsed,
        repeatedAttempts: conversationData.repeatedAttempts
      }
    };

    this.trainingData.conversations.set(conversationId, trainingRecord);
    this.saveDataToDisk('conversations');
  }

  /**
   * Record user feedback for training improvement
   */
  recordFeedback(feedbackId, feedbackData) {
    const trainingRecord = {
      id: feedbackId,
      timestamp: new Date().toISOString(),
      conversationId: feedbackData.conversationId,
      userId: feedbackData.userId,
      satisfaction: feedbackData.satisfaction, // 1-5 scale
      nps: feedbackData.nps, // 0-10 scale
      issueResolved: feedbackData.issueResolved,
      helpfulness: feedbackData.helpfulness,
      easeOfUse: feedbackData.easeOfUse,
      comments: feedbackData.comments,
      improvement: feedbackData.improvement,
      language: feedbackData.language,
      metadata: {
        responseTime: feedbackData.responseTime,
        messageCount: feedbackData.messageCount,
        interventions: feedbackData.interventions
      }
    };

    this.trainingData.feedback.set(feedbackId, trainingRecord);
    this.saveDataToDisk('feedback');

    // Update performance metrics
    this.updatePerformanceMetrics(trainingRecord);
  }

  /**
   * Record human intervention patterns
   */
  recordIntervention(interventionId, interventionData) {
    const trainingRecord = {
      id: interventionId,
      timestamp: new Date().toISOString(),
      conversationId: interventionData.conversationId,
      trigger: interventionData.trigger, // 'low_confidence', 'user_frustration', etc.
      severity: interventionData.severity,
      operatorId: interventionData.operatorId,
      transferTime: interventionData.transferTime,
      resolution: interventionData.resolution,
      aiFailureReason: interventionData.aiFailureReason,
      humanSolution: interventionData.humanSolution,
      lessonsLearned: interventionData.lessonsLearned,
      metadata: {
        conversationLength: interventionData.conversationLength,
        userFrustration: interventionData.userFrustration,
        topicComplexity: interventionData.topicComplexity
      }
    };

    this.trainingData.interventions.set(interventionId, trainingRecord);
    this.saveDataToDisk('interventions');

    // Extract training patterns from intervention
    this.extractTrainingPatterns(trainingRecord);
  }

  /**
   * Record AI corrections from human operators
   */
  recordCorrection(correctionId, correctionData) {
    const trainingRecord = {
      id: correctionId,
      timestamp: new Date().toISOString(),
      conversationId: correctionData.conversationId,
      aiResponse: correctionData.aiResponse,
      humanCorrection: correctionData.humanCorrection,
      correctionType: correctionData.correctionType, // 'factual', 'tone', 'completeness', 'accuracy'
      reason: correctionData.reason,
      category: correctionData.category,
      severity: correctionData.severity,
      operatorId: correctionData.operatorId,
      metadata: {
        confidence: correctionData.confidence,
        topic: correctionData.topic,
        language: correctionData.language
      }
    };

    this.trainingData.corrections.set(correctionId, trainingRecord);
    this.saveDataToDisk('corrections');

    // Update AI improvement suggestions
    this.updateAIImprovementSuggestions(trainingRecord);
  }

  /**
   * Extract training patterns from interventions
   */
  extractTrainingPatterns(interventionRecord) {
    const patterns = {
      failurePatterns: [],
      successPatterns: [],
      improvementAreas: []
    };

    // Analyze failure reasons
    if (interventionRecord.aiFailureReason) {
      patterns.failurePatterns.push({
        reason: interventionRecord.aiFailureReason,
        context: interventionRecord.metadata,
        frequency: 1
      });
    }

    // Analyze successful human solutions
    if (interventionRecord.humanSolution) {
      patterns.successPatterns.push({
        solution: interventionRecord.humanSolution,
        trigger: interventionRecord.trigger,
        context: interventionRecord.metadata
      });
    }

    // Identify improvement areas
    patterns.improvementAreas = this.identifyImprovementAreas(interventionRecord);

    return patterns;
  }

  /**
   * Identify areas for AI improvement
   */
  identifyImprovementAreas(interventionRecord) {
    const improvements = [];

    const trigger = interventionRecord.trigger;
    const context = interventionRecord.metadata;

    // Low confidence improvements
    if (trigger === 'low_confidence') {
      improvements.push({
        area: 'confidence_calibration',
        suggestion: 'Improve confidence scoring for similar contexts',
        context: context
      });
    }

    // User frustration improvements
    if (trigger === 'user_frustration') {
      improvements.push({
        area: 'empathy_responses',
        suggestion: 'Enhance responses for frustrated users',
        context: context
      });
    }

    // Complex topic improvements
    if (trigger === 'complex_topic') {
      improvements.push({
        area: 'specialized_knowledge',
        suggestion: 'Expand knowledge base for complex topics',
        context: context
      });
    }

    // Language improvements
    if (context.topicComplexity === 'high') {
      improvements.push({
        area: 'simplification',
        suggestion: 'Improve complex topic explanations',
        context: context
      });
    }

    return improvements;
  }

  /**
   * Update AI improvement suggestions
   */
  updateAIImprovementSuggestions(correctionRecord) {
    const suggestions = this.trainingData.performance.get('improvement_suggestions') || [];

    const newSuggestion = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      type: correctionRecord.correctionType,
      category: correctionRecord.category,
      suggestion: `Improve ${correctionRecord.correctionType} for ${correctionRecord.category} topics`,
      example: {
        aiResponse: correctionRecord.aiResponse,
        humanCorrection: correctionRecord.humanCorrection,
        reason: correctionRecord.reason
      },
      frequency: 1
    };

    // Check if similar suggestion exists
    const existingSuggestion = suggestions.find(s =>
      s.type === newSuggestion.type &&
      s.category === newSuggestion.category
    );

    if (existingSuggestion) {
      existingSuggestion.frequency++;
      existingSuggestion.lastUpdated = newSuggestion.timestamp;
    } else {
      suggestions.push(newSuggestion);
    }

    this.trainingData.performance.set('improvement_suggestions', suggestions);
    this.saveDataToDisk('performance');
  }

  /**
   * Update performance metrics from feedback
   */
  updatePerformanceMetrics(feedbackRecord) {
    const metrics = this.trainingData.performance.get('metrics') || {
      totalFeedback: 0,
      averageSatisfaction: 0,
      averageNPS: 0,
      resolutionRate: 0,
      categoryPerformance: {},
      temporalTrends: {}
    };

    metrics.totalFeedback++;
    metrics.averageSatisfaction = this.updateAverage(metrics.averageSatisfaction, feedbackRecord.satisfaction, metrics.totalFeedback);
    metrics.averageNPS = this.updateAverage(metrics.averageNPS, feedbackRecord.nps, metrics.totalFeedback);

    if (feedbackRecord.issueResolved) {
      metrics.resolutionRate = ((metrics.resolutionRate * (metrics.totalFeedback - 1)) + 1) / metrics.totalFeedback;
    }

    // Update category performance
    const category = feedbackRecord.metadata?.category || 'general';
    if (!metrics.categoryPerformance[category]) {
      metrics.categoryPerformance[category] = { count: 0, satisfaction: 0, resolution: 0 };
    }

    const catPerf = metrics.categoryPerformance[category];
    catPerf.count++;
    catPerf.satisfaction = this.updateAverage(catPerf.satisfaction, feedbackRecord.satisfaction, catPerf.count);
    if (feedbackRecord.issueResolved) catPerf.resolution++;

    this.trainingData.performance.set('metrics', metrics);
    this.saveDataToDisk('performance');
  }

  /**
   * Update running average
   */
  updateAverage(currentAverage, newValue, count) {
    if (!newValue) return currentAverage;
    return ((currentAverage * (count - 1)) + newValue) / count;
  }

  /**
   * Generate training dataset for AI improvement
   */
  async generateTrainingDataset(options = {}) {
    const {
      includeConversations = true,
      includeCorrections = true,
      includeInterventions = true,
      minQuality = 0.7,
      categories = null
    } = options;

    const dataset = {
      metadata: {
        generated: new Date().toISOString(),
        totalSamples: 0,
        categories: [],
        quality: minQuality
      },
      training: {
        conversations: [],
        corrections: [],
        interventions: []
      }
    };

    // Add conversation data
    if (includeConversations) {
      for (const [id, conversation] of this.trainingData.conversations) {
        if (this.meetsQualityThreshold(conversation, minQuality) &&
            this.matchesCategories(conversation, categories)) {
          dataset.training.conversations.push(this.formatConversationForTraining(conversation));
        }
      }
    }

    // Add correction data
    if (includeCorrections) {
      for (const [id, correction] of this.trainingData.corrections) {
        if (this.meetsQualityThreshold(correction, minQuality)) {
          dataset.training.corrections.push(this.formatCorrectionForTraining(correction));
        }
      }
    }

    // Add intervention data
    if (includeInterventions) {
      for (const [id, intervention] of this.trainingData.interventions) {
        if (this.meetsQualityThreshold(intervention, minQuality)) {
          dataset.training.interventions.push(this.formatInterventionForTraining(intervention));
        }
      }
    }

    dataset.metadata.totalSamples =
      dataset.training.conversations.length +
      dataset.training.corrections.length +
      dataset.training.interventions.length;

    return dataset;
  }

  /**
   * Check if record meets quality threshold
   */
  meetsQualityThreshold(record, minQuality) {
    // Quality based on feedback, corrections, and intervention outcomes
    if (record.satisfaction) {
      return (record.satisfaction / 5) >= minQuality;
    }
    if (record.helpfulness) {
      return (record.helpfulness / 5) >= minQuality;
    }
    return true; // Default to include if no quality metric
  }

  /**
   * Check if record matches category filter
   */
  matchesCategories(record, categories) {
    if (!categories || categories.length === 0) return true;
    const recordCategory = record.serviceCategory || record.category || 'general';
    return categories.includes(recordCategory);
  }

  /**
   * Format conversation for training
   */
  formatConversationForTraining(conversation) {
    return {
      id: conversation.id,
      context: {
        language: conversation.language,
        category: conversation.serviceCategory,
        userType: this.inferUserType(conversation)
      },
      messages: conversation.messages.map(msg => ({
        role: msg.sender,
        content: msg.content,
        timestamp: msg.timestamp
      })),
      outcome: conversation.outcome,
      satisfaction: conversation.satisfaction,
      interventions: conversation.interventions
    };
  }

  /**
   * Format correction for training
   */
  formatCorrectionForTraining(correction) {
    return {
      id: correction.id,
      context: {
        category: correction.category,
        language: correction.metadata?.language
      },
      original: correction.aiResponse,
      corrected: correction.humanCorrection,
      correctionType: correction.correctionType,
      reason: correction.reason
    };
  }

  /**
   * Format intervention for training
   */
  formatInterventionForTraining(intervention) {
    return {
      id: intervention.id,
      trigger: intervention.trigger,
      context: intervention.metadata,
      aiFailure: intervention.aiFailureReason,
      humanSolution: intervention.humanSolution,
      lessons: intervention.lessonsLearned
    };
  }

  /**
   * Infer user type from conversation patterns
   */
  inferUserType(conversation) {
    const messages = conversation.messages || [];
    const userMessages = messages.filter(m => m.sender === 'user');

    // Analyze message patterns
    if (userMessages.length > 10) return 'power_user';
    if (conversation.interventions?.length > 2) return 'frustrated_user';
    if (conversation.metadata?.accessibilityUsed) return 'accessibility_user';

    return 'standard_user';
  }

  /**
   * Save data to disk
   */
  async saveDataToDisk(dataType) {
    try {
      const filePath = path.join(this.dataPath, `${dataType}.json`);
      const data = Object.fromEntries(this.trainingData[dataType]);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Error saving ${dataType} data:`, error);
    }
  }

  /**
   * Get training data statistics
   */
  getStatistics() {
    return {
      conversations: this.trainingData.conversations.size,
      feedback: this.trainingData.feedback.size,
      interventions: this.trainingData.interventions.size,
      corrections: this.trainingData.corrections.size,
      performance: Object.keys(this.trainingData.performance.get('metrics') || {}),
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Export training data for external use
   */
  async exportTrainingData(filePath, options = {}) {
    const dataset = await this.generateTrainingDataset(options);
    await fs.writeFile(filePath, JSON.stringify(dataset, null, 2));
    return dataset.metadata;
  }
}

// Export the system
export { AITrainingDataCollector };
