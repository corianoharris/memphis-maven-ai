/**
 * Anonymous Reporting System
 * Handles non-critical service requests without requiring user authentication
 */

import { v4 as uuidv4 } from 'uuid';

class AnonymousReportingSystem {
  constructor() {
    this.reportCache = new Map(); // In-memory cache for demo
    this.reportId = 1;
  }

  /**
   * Create an anonymous report
   */
  async createAnonymousReport(reportData) {
    try {
      const reportId = `AR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const report = {
        id: reportId,
        timestamp: new Date().toISOString(),
        category: reportData.category,
        description: reportData.description,
        location: reportData.location,
        priority: reportData.priority || 'normal',
        status: 'submitted',
        contactInfo: reportData.contactInfo || null, // Optional
        attachments: reportData.attachments || [],
        anonymous: true,
        estimatedResponse: this.getEstimatedResponse(reportData.category),
        nextSteps: this.getNextSteps(reportData.category)
      };

      // Store in cache (in production, this would go to database)
      this.reportCache.set(reportId, report);
      
      // Generate tracking information
      const tracking = {
        reportId: reportId,
        statusUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/track/${reportId}`,
        statusPhone: `(901) 636-6500 and reference ${reportId}`,
        estimatedResponse: report.estimatedResponse,
        confirmation: this.generateConfirmation(report)
      };

      return {
        success: true,
        reportId: reportId,
        tracking: tracking,
        message: "Your anonymous report has been submitted successfully!"
      };

    } catch (error) {
      console.error('Error creating anonymous report:', error);
      return {
        success: false,
        error: 'Failed to create report. Please try again.'
      };
    }
  }

  /**
   * Track report status
   */
  async trackReport(reportId) {
    try {
      const report = this.reportCache.get(reportId);
      
      if (!report) {
        return {
          success: false,
          error: 'Report not found. Please check your report ID.'
        };
      }

      return {
        success: true,
        report: {
          id: report.id,
          status: report.status,
          category: report.category,
          description: report.description,
          location: report.location,
          submitted: report.timestamp,
          estimatedResponse: report.estimatedResponse,
          nextSteps: report.nextSteps
        }
      };

    } catch (error) {
      console.error('Error tracking report:', error);
      return {
        success: false,
        error: 'Unable to retrieve report status.'
      };
    }
  }

  /**
   * Update report with additional contact information
   */
  async updateReportContact(reportId, contactInfo) {
    try {
      const report = this.reportCache.get(reportId);
      
      if (!report) {
        return {
          success: false,
          error: 'Report not found.'
        };
      }

      report.contactInfo = contactInfo;
      report.contactUpdated = new Date().toISOString();
      this.reportCache.set(reportId, report);

      return {
        success: true,
        message: 'Contact information updated successfully!'
      };

    } catch (error) {
      console.error('Error updating report contact:', error);
      return {
        success: false,
        error: 'Failed to update contact information.'
      };
    }
  }

  /**
   * Submit anonymous feedback
   */
  async submitAnonymousFeedback(feedbackData) {
    try {
      const feedbackId = `FB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const feedback = {
        id: feedbackId,
        timestamp: new Date().toISOString(),
        rating: feedbackData.rating,
        comments: feedbackData.comments,
        category: feedbackData.category || 'general',
        anonymous: true,
        contactConsent: feedbackData.contactConsent || false
      };

      // Store feedback (in production, would go to database)
      this.reportCache.set(feedbackId, feedback);

      return {
        success: true,
        feedbackId: feedbackId,
        message: 'Thank you for your feedback!'
      };

    } catch (error) {
      console.error('Error submitting feedback:', error);
      return {
        success: false,
        error: 'Failed to submit feedback.'
      };
    }
  }

  /**
   * Get estimated response time based on category
   */
  getEstimatedResponse(category) {
    const responseTimes = {
      'pothole': '3-5 business days',
      'streetlight': '24-48 hours', 
      'trash': 'same day to 3 days',
      'park': '5-10 business days',
      'traffic': '1-3 business days',
      'noise': '24-48 hours',
      'other': '3-7 business days'
    };

    return responseTimes[category] || '3-7 business days';
  }

  /**
   * Get next steps for user based on category
   */
  getNextSteps(category) {
    const steps = {
      'pothole': [
        'Your report has been submitted to Public Works',
        'A crew will assess the pothole within 3-5 business days',
        'Repairs typically take 1-2 days once scheduled',
        'Track progress using your report ID'
      ],
      'streetlight': [
        'Your report has been submitted to the Traffic Division',
        'An electrician will investigate within 24-48 hours',
        'Repairs are typically completed within 1-3 days',
        'Emergency outages are prioritized'
      ],
      'trash': [
        'Check your collection schedule for your area',
        'Missed collections are typically resolved within 24 hours',
        'Report missed collections immediately after scheduled pickup',
        'Contact 311 if issue persists'
      ],
      'park': [
        'Your report has been submitted to Parks & Recreation',
        'Maintenance will be scheduled based on priority',
        'High-priority items are addressed within 5-10 days',
        'Track progress using your report ID'
      ]
    };

    return steps[category] || [
      'Your report has been submitted to the appropriate department',
      'You will receive updates on the status of your request',
      'Track progress using your report ID'
    ];
  }

  /**
   * Generate confirmation message
   */
  generateConfirmation(report) {
    const confirmations = {
      'pothole': `Great! Your pothole report (#${report.id}) has been submitted. Memphis Public Works will assess and repair this within 3-5 business days. You can track progress online or by calling (901) 636-6500.`,
      
      'streetlight': `Perfect! Your streetlight report (#${report.id}) has been submitted. Our electrical team will investigate within 24-48 hours. Track progress online or call (901) 636-6500.`,
      
      'trash': `Thanks! Your trash collection report (#${report.id}) has been submitted. Check your area's collection schedule, and contact 311 if the issue isn't resolved within 24 hours.`,
      
      'park': `Excellent! Your park maintenance report (#${report.id}) has been submitted. Parks & Recreation will schedule repairs within 5-10 business days. Track progress online or call (901) 636-6500.`
    };

    return confirmations[report.category] || `Thank you! Your report (#${report.id}) has been submitted successfully. Track progress online or call (901) 636-6500 with reference number ${report.id}.`;
  }

  /**
   * Get report templates for common issues
   */
  getReportTemplates() {
    return {
      pothole: {
        title: 'Report a Pothole',
        description: 'Report potholes, cracks, or road surface damage',
        fields: ['location', 'description', 'severity', 'traffic_impact'],
        example: 'Large pothole on Main Street near the intersection with 2nd Avenue, causing traffic to swerve into oncoming lane'
      },
      
      streetlight: {
        title: 'Report Streetlight Issue',
        description: 'Report broken, flickering, or missing streetlights',
        fields: ['location', 'description', 'urgency'],
        example: 'Streetlight completely out on Beale Street between 2nd and 3rd Avenue, creating a dark section of sidewalk'
      },
      
      trash: {
        title: 'Trash Collection Issue',
        description: 'Report missed collections, overflowing bins, or illegal dumping',
        fields: ['location', 'description', 'collection_day'],
        example: 'Missed Wednesday collection for apartment complex at 123 Main St, bins still full from Tuesday evening'
      },
      
      park: {
        title: 'Park Maintenance Issue',
        description: 'Report playground equipment, trail, or facility issues',
        fields: ['location', 'description', 'type'],
        example: 'Broken swing set at the north end of Overton Park, several swings hanging at odd angles'
      }
    };
  }
}

// Anonymous reporting templates and response generators
const anonymousReportResponses = {
  // Confirmation responses
  confirmations: {
    pothole: (reportId, contactInfo) => ({
      message: `Perfect! Your pothole report (#${reportId}) is submitted! 🛠️`,
      details: `Our road crew will assess this within 3-5 business days.`,
      tracking: contactInfo ? 
        `You'll receive updates${contactInfo.email ? ` via email` : ''}${contactInfo.phone ? ` and text` : ''}.` :
        `Track progress online or call (901) 636-6500.`,
      tips: [
        '📍 Remember: You can always track this with your report ID',
        '🚗 Crews work 7am-5pm, Monday-Friday',
        '🕐 Major repairs may take additional time'
      ]
    }),

    streetlight: (reportId, contactInfo) => ({
      message: `Thanks! Your streetlight report (#${reportId}) is in! 💡`,
      details: `Our electrical team will investigate within 24-48 hours.`,
      tracking: contactInfo ? 
        `Updates sent to${contactInfo.email ? ` email` : ''}${contactInfo.phone ? ` and phone` : ''}.` :
        `Check status online or call (901) 636-6500.`,
      tips: [
        '⚡ Emergency outages get prioritized',
        '🌃 Most repairs completed within 1-3 days', 
        '📱 Download the Memphis 311 app for updates'
      ]
    }),

    trash: (reportId, contactInfo) => ({
      message: `Got it! Your trash report (#${reportId}) is registered! 🗑️`,
      details: `We'll check your collection schedule and resolve this.`,
      tracking: contactInfo ? 
        `Stay tuned${contactInfo.email ? ` via email` : ''}${contactInfo.phone ? ` and text` : ''}.` :
        `Call 311 if not resolved within 24 hours.`,
      tips: [
        '📅 Check your pickup day at memphistn.gov',
        '🏠 Bulk pickup requires separate scheduling',
        '♻️ Recycling collected same day as trash'
      ]
    }),

    park: (reportId, contactInfo) => ({
      message: `Wonderful! Your park report (#${reportId}) is submitted! 🌳`,
      details: `Parks & Recreation will schedule maintenance within 5-10 days.`,
      tracking: contactInfo ? 
        `Updates coming${contactInfo.email ? ` to email` : ''}${contactInfo.phone ? ` and phone` : ''}.` :
        `Track online or call (901) 636-6500.`,
      tips: [
        '🏃 High-traffic areas get priority attention',
        '🛝 Playground repairs use specialized contractors',
        '🌲 Tree issues may require arborist assessment'
      ]
    })
  },

  // Follow-up questions
  followUp: {
    contact: [
      "Would you like to leave a phone number or email for updates? (Optional - completely anonymous without it!)",
      "Want me to set you up for text updates? (Just share your phone number - no other info needed!)",
      "Should I give you a call if we need more details? (Your number stays private!)"
    ],
    urgency: [
      "Is this causing any safety concerns? (Just wondering if we should prioritize it)",
      "How much traffic does this area get? (Helps us understand urgency)",
      "Has this gotten worse recently? (Sometimes issues escalate quickly)"
    ],
    location: [
      "Any nearby landmarks to help crews find this quickly?",
      "Which side of the street is this on?",
      "Is this near any businesses or houses I should mention?"
    ]
  },

  // Encouragement messages
  encouragement: [
    "Thanks for helping keep Memphis beautiful! 🏙️",
    "You're making our community better one report at a time! 🌟",
    "Memphis appreciates residents like you! 💙",
    "Great catch - this helps our crews prioritize! 👷",
    "Every report makes a difference in our city! 🛠️"
  ]
};

export {
  AnonymousReportingSystem,
  anonymousReportResponses
};