/**
 * Feedback Loop & Data Collection System
 * Handles user satisfaction tracking, CSAT/NPS surveys, and continuous improvement
 */

import { v4 as uuidv4 } from 'uuid';

class FeedbackSystem {
  constructor() {
    this.feedbackStore = new Map(); // In-memory for demo
    this.surveyStore = new Map();
    this.analyticsData = {
      totalInteractions: 0,
      satisfactionScores: [],
      npsScores: [],
      categoryBreakdown: {},
      hourlyActivity: {},
      dailyActivity: {}
    };
  }

  /**
   * Record user interaction for analytics
   */
  recordInteraction(interactionData) {
    const timestamp = new Date();
    const hour = timestamp.getHours();
    const day = timestamp.toDateString();

    this.analyticsData.totalInteractions++;

    // Track hourly activity
    if (!this.analyticsData.hourlyActivity[hour]) {
      this.analyticsData.hourlyActivity[hour] = 0;
    }
    this.analyticsData.hourlyActivity[hour]++;

    // Track daily activity
    if (!this.analyticsData.dailyActivity[day]) {
      this.analyticsData.dailyActivity[day] = 0;
    }
    this.analyticsData.dailyActivity[day]++;

    // Track category breakdown
    const category = interactionData.category || 'general';
    if (!this.analyticsData.categoryBreakdown[category]) {
      this.analyticsData.categoryBreakdown[category] = 0;
    }
    this.analyticsData.categoryBreakdown[category]++;

    return true;
  }

  /**
   * Request feedback after interaction
   */
  async requestFeedback(interactionId, context = {}) {
    try {
      const feedbackId = `FB-${Date.now()}`;

      // Determine if this should be a quick or detailed survey
      const surveyType = this.determineSurveyType(context);

      const feedbackRequest = {
        id: feedbackId,
        interactionId: interactionId,
        timestamp: new Date().toISOString(),
        type: surveyType,
        questions: this.getSurveyQuestions(surveyType),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        context: context
      };

      this.surveyStore.set(feedbackId, feedbackRequest);

      return {
        success: true,
        feedbackId: feedbackId,
        survey: this.formatSurveyPrompt(feedbackRequest)
      };

    } catch (error) {
      console.error('Error creating feedback request:', error);
      return {
        success: false,
        error: 'Unable to create feedback request'
      };
    }
  }

  /**
   * Process user feedback response
   */
  async processFeedback(feedbackId, responses) {
    try {
      const survey = this.surveyStore.get(feedbackId);

      if (!survey) {
        return {
          success: false,
          error: 'Survey not found or expired'
        };
      }

      // Validate responses
      const validatedResponses = this.validateResponses(responses, survey.questions);

      // Store feedback
      const feedbackRecord = {
        id: feedbackId,
        interactionId: survey.interactionId,
        timestamp: new Date().toISOString(),
        type: survey.type,
        responses: validatedResponses,
        satisfactionScore: validatedResponses.satisfaction || null,
        npsScore: validatedResponses.nps || null,
        wouldRecommend: validatedResponses.recommendation || null,
        contactConsent: validatedResponses.contactConsent || false,
        anonymous: !validatedResponses.contactConsent
      };

      this.feedbackStore.set(feedbackId, feedbackRecord);

      // Update analytics
      this.updateAnalytics(feedbackRecord);

      // Remove survey from active surveys
      this.surveyStore.delete(feedbackId);

      return {
        success: true,
        message: this.generateFeedbackResponse(feedbackRecord),
        id: feedbackId
      };

    } catch (error) {
      console.error('Error processing feedback:', error);
      return {
        success: false,
        error: 'Unable to process feedback'
      };
    }
  }

  /**
   * Determine survey type based on interaction context
   */
  determineSurveyType(context) {
    // Emergency or urgent services get quick survey
    if (context.urgency === 'critical' || context.urgency === 'high') {
      return 'quick';
    }

    // Complex interactions get detailed survey
    if (context.complexity === 'high' || context.duration > 300) { // 5+ minutes
      return 'detailed';
    }

    // Default to standard survey
    return 'standard';
  }

  /**
   * Get survey questions based on type
   */
  getSurveyQuestions(surveyType) {
    const questionSets = {
      quick: [
        {
          id: 'satisfaction',
          type: 'scale',
          question: 'How satisfied are you with this service?',
          scale: { min: 1, max: 5, labels: ['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'] }
        },
        {
          id: 'issue_resolved',
          type: 'yesno',
          question: 'Was your issue resolved today?'
        }
      ],
      standard: [
        {
          id: 'satisfaction',
          type: 'scale',
          question: 'How satisfied are you with this service?',
          scale: { min: 1, max: 5, labels: ['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'] }
        },
        {
          id: 'issue_resolved',
          type: 'yesno',
          question: 'Was your issue resolved today?'
        },
        {
          id: 'recommendation',
          type: 'scale',
          question: 'How likely are you to recommend our service to others?',
          scale: { min: 0, max: 10, labels: ['Not at all likely', 'Extremely likely'] }
        },
        {
          id: 'improvement',
          type: 'text',
          question: 'What could we do better? (Optional)'
        }
      ],
      detailed: [
        {
          id: 'satisfaction',
          type: 'scale',
          question: 'Overall, how satisfied are you with this service?',
          scale: { min: 1, max: 5, labels: ['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'] }
        },
        {
          id: 'issue_resolved',
          type: 'yesno',
          question: 'Was your issue resolved today?'
        },
        {
          id: 'recommendation',
          type: 'scale',
          question: 'How likely are you to recommend our service to others?',
          scale: { min: 0, max: 10, labels: ['Not at all likely', 'Extremely likely'] }
        },
        {
          id: 'helpfulness',
          type: 'scale',
          question: 'How helpful was the information provided?',
          scale: { min: 1, max: 5, labels: ['Not Helpful', 'Slightly Helpful', 'Moderately Helpful', 'Helpful', 'Very Helpful'] }
        },
        {
          id: 'ease_of_use',
          type: 'scale',
          question: 'How easy was it to get the help you needed?',
          scale: { min: 1, max: 5, labels: ['Very Difficult', 'Difficult', 'Neutral', 'Easy', 'Very Easy'] }
        },
        {
          id: 'improvement',
          type: 'text',
          question: 'What could we do better? (Optional)'
        },
        {
          id: 'additional_feedback',
          type: 'text',
          question: 'Any additional comments or suggestions? (Optional)'
        }
      ]
    };

    return questionSets[surveyType] || questionSets.standard;
  }

  /**
   * Format survey prompt for user
   */
  formatSurveyPrompt(survey) {
    const prompts = {
      quick: {
        greeting: "Thanks for using our service!",
        question: "Just a quick question: How satisfied were you with the help you received today?",
        scale: "Please rate from 1 (Very Dissatisfied) to 5 (Very Satisfied)",
        buttons: ["1", "2", "3", "4", "5"]
      },
      standard: {
        greeting: "We'd love your feedback!",
        question: "How was your experience with our city services assistant today?",
        secondary: "Your input helps us serve Memphis residents better!",
        follow_up: "Any suggestions for improvement? (Optional)"
      },
      detailed: {
        greeting: "Thanks for spending time with us today!",
        question: "We'd appreciate your detailed feedback to improve our service:",
        sections: {
          satisfaction: "Overall Satisfaction",
          resolution: "Issue Resolution",
          recommendation: "Likelihood to Recommend",
          helpfulness: "Helpfulness of Information",
          ease: "Ease of Use"
        }
      }
    };

    return prompts[survey.type];
  }

  /**
   * Validate user responses
   */
  validateResponses(responses, questions) {
    const validated = {};

    for (const question of questions) {
      const response = responses[question.id];

      if (question.type === 'scale') {
        const value = parseInt(response);
        if (!isNaN(value) && value >= question.scale.min && value <= question.scale.max) {
          validated[question.id] = value;
        }
      } else if (question.type === 'yesno') {
        validated[question.id] = ['yes', 'true', '1'].includes(String(response).toLowerCase());
      } else if (question.type === 'text') {
        if (response && String(response).trim().length > 0) {
          validated[question.id] = String(response).trim();
        }
      }
    }

    // Handle special fields
    if (responses.contactConsent === 'yes' && responses.contactInfo) {
      validated.contactConsent = true;
      validated.contactInfo = responses.contactInfo;
    }

    return validated;
  }

  /**
   * Update analytics with new feedback
   */
  updateAnalytics(feedbackRecord) {
    // Update satisfaction scores
    if (feedbackRecord.satisfactionScore) {
      this.analyticsData.satisfactionScores.push(feedbackRecord.satisfactionScore);
    }

    // Update NPS scores
    if (feedbackRecord.npsScore !== null) {
      this.analyticsData.npsScores.push(feedbackRecord.npsScore);
    }
  }

  /**
   * Generate feedback acknowledgment response
   */
  generateFeedbackResponse(feedbackRecord) {
    const responses = [
      "Thank you for helping make Memphis services better!",
      "Your feedback means a lot to our city team!",
      "We appreciate you taking time to share your thoughts!",
      "Thanks for helping us serve Memphis residents better!"
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];

    if (feedbackRecord.satisfactionScore >= 4) {
      return `${response} We're thrilled you had a great experience!`;
    } else if (feedbackRecord.satisfactionScore <= 2) {
      return `${response} We're sorry the experience wasn't better. We'll work on improvements.`;
    }

    return response;
  }

  /**
   * Get analytics summary
   */
  getAnalyticsSummary() {
    const summary = {
      totalInteractions: this.analyticsData.totalInteractions,
      averageSatisfaction: this.calculateAverage(this.analyticsData.satisfactionScores),
      averageNPS: this.calculateAverage(this.analyticsData.npsScores),
      satisfactionDistribution: this.getDistribution(this.analyticsData.satisfactionScores),
      npsDistribution: this.getDistribution(this.analyticsData.npsScores),
      categoryBreakdown: this.analyticsData.categoryBreakdown,
      peakHours: this.getPeakHours(),
      dailyActivity: this.analyticsData.dailyActivity
    };

    return summary;
  }

  /**
   * Calculate average of array
   */
  calculateAverage(array) {
    if (array.length === 0) return 0;
    return Math.round((array.reduce((sum, val) => sum + val, 0) / array.length) * 100) / 100;
  }

  /**
   * Get distribution of values
   */
  getDistribution(array) {
    const distribution = {};
    array.forEach(val => {
      distribution[val] = (distribution[val] || 0) + 1;
    });
    return distribution;
  }

  /**
   * Get peak activity hours
   */
  getPeakHours() {
    const hours = Object.entries(this.analyticsData.hourlyActivity)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }));

    return hours;
  }

  /**
   * Get feedback templates for different scenarios
   */
  getFeedbackTemplates() {
    return {
      post_service: {
        immediate: "How did we do today? Just a quick rating would be awesome!",
        follow_up: "Any thoughts on how we could improve? (Totally optional!)",
        thank_you: "Thanks for helping make Memphis services better!"
      },

      post_complaint: {
        immediate: "We're sorry you had a frustrating experience.",
        follow_up: "What could we have done differently? Your insight helps us improve.",
        appreciation: "Thanks for giving us the chance to make it right."
      },

      post_compliment: {
        immediate: "Aww, thanks! That's what we're here for!",
        follow_up: "We'll keep up the great work for Memphis!",
        sharing: "Hope you tell your neighbors about our helpful service!"
      },

      annual_survey: {
        introduction: "Hey Memphis! Once a year we ask for your thoughts on city services.",
        importance: "Your feedback shapes how we serve our community!",
        incentive: "Complete this quick survey and you could win Memphis swag!"
      }
    };
  }
}

// Feedback response patterns for different satisfaction levels
const feedbackResponsePatterns = {
  satisfied: {
    positive: [
      "So glad we could help!",
      "That's what we're here for!",
      "Memphis residents like you make our job worth it!",
      "You just made someone's day by reporting that!"
    ],
    engagement: [
      "Anything else we can help with today?",
      "Know anyone else who could use our help?",
      "Want to learn about other city services?",
      "Should we keep you updated on community events?"
    ]
  },

  neutral: {
    acknowledgment: [
      "Thanks for the feedback! We'll work on improvements.",
      "We hear you and we'll keep working to do better.",
      "Your input helps us serve Memphis better!"
    ],
    engagement: [
      "What specifically would make your experience better?",
      "Is there anything we missed that would have helped?",
      "Would you like to try a different approach?"
    ]
  },

  dissatisfied: {
    empathy: [
      "I'm really sorry your experience wasn't better.",
      "That's definitely not the service we want to provide.",
      "We understand your frustration and we want to make this right."
    ],
    action: [
      "Let me connect you with someone who can help resolve this.",
      "What would a good resolution look like to you?",
      "I want to make sure you get the help you need. What's the best way?"
    ]
  }
};

export {
  FeedbackSystem,
  feedbackResponsePatterns
};
