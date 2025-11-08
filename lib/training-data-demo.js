/**
 * AI Training Data Collection Demo
 * Demonstrates how human feedback and interventions improve AI training
 */

import { AITrainingDataCollector } from './ai-training-data-collector.js';

class TrainingDataDemo {
  constructor() {
    this.collector = new AITrainingDataCollector();
    this.demoData = this.generateDemoData();
  }

  /**
   * Generate sample training data for demonstration
   */
  generateDemoData() {
    return {
      conversations: [
        {
          id: 'conv-demo-001',
          userId: 'user-001',
          language: 'en',
          messages: [
            { sender: 'user', content: 'How do I report a pothole?', timestamp: '2024-01-01T10:00:00Z' },
            { sender: 'ai', content: 'You can report potholes through our 311 system...', timestamp: '2024-01-01T10:00:05Z' },
            { sender: 'user', content: 'That\'s not working for me', timestamp: '2024-01-01T10:01:00Z' }
          ],
          duration: 120,
          outcome: 'escalated',
          serviceCategory: 'infrastructure',
          satisfaction: 2,
          interventions: ['low_confidence']
        }
      ],
      feedback: [
        {
          id: 'fb-demo-001',
          conversationId: 'conv-demo-001',
          userId: 'user-001',
          satisfaction: 2,
          nps: 3,
          issueResolved: false,
          helpfulness: 2,
          easeOfUse: 1,
          comments: 'The AI didn\'t understand my specific situation',
          improvement: 'Better handling of complex infrastructure issues',
          language: 'en'
        }
      ],
      interventions: [
        {
          id: 'int-demo-001',
          conversationId: 'conv-demo-001',
          trigger: 'user_frustration',
          severity: 'high',
          operatorId: 'op-001',
          transferTime: 45,
          resolution: 'successful',
          aiFailureReason: 'Insufficient context understanding for infrastructure complaints',
          humanSolution: 'Provided direct link to pothole reporting form and phone number',
          lessonsLearned: 'AI needs better recognition of frustrated users and immediate escalation',
          metadata: {
            conversationLength: 3,
            userFrustration: true,
            topicComplexity: 'medium'
          }
        }
      ],
      corrections: [
        {
          id: 'corr-demo-001',
          conversationId: 'conv-demo-001',
          aiResponse: 'You can report potholes through our 311 system by calling or using the website.',
          humanCorrection: 'For urgent potholes that pose safety risks, call 311 immediately at (901) 636-6500. For non-urgent reports, use our online portal at memphis.gov/potholes.',
          correctionType: 'completeness',
          reason: 'AI response lacked urgency distinction and specific contact information',
          category: 'infrastructure',
          severity: 'medium',
          operatorId: 'op-001'
        }
      ]
    };
  }

  /**
   * Run comprehensive training data collection demo
   */
  async runDemo() {
    console.log('🎓 AI Training Data Collection Demo\n');

    // Demo 1: Record conversation data
    await this.demoConversationRecording();

    // Demo 2: Record feedback data
    await this.demoFeedbackRecording();

    // Demo 3: Record intervention data
    await this.demoInterventionRecording();

    // Demo 4: Record AI corrections
    await this.demoCorrectionRecording();

    // Demo 5: Generate training dataset
    await this.demoDatasetGeneration();

    // Demo 6: Show statistics and insights
    this.demoStatisticsAndInsights();

    console.log('✅ Training Data Collection Demo completed!');
  }

  /**
   * Demo 1: Conversation recording
   */
  async demoConversationRecording() {
    console.log('📝 Demo 1: Conversation Data Recording');

    const conversation = this.demoData.conversations[0];

    this.collector.recordConversation(conversation.id, {
      ...conversation,
      userAgent: 'Demo Browser',
      zipCode: '38103',
      accessibilityUsed: false,
      repeatedAttempts: 1
    });

    console.log(`   ✅ Recorded conversation: ${conversation.id}`);
    console.log(`   Messages: ${conversation.messages.length}`);
    console.log(`   Outcome: ${conversation.outcome}`);
    console.log(`   Satisfaction: ${conversation.satisfaction}/5`);
    console.log('');
  }

  /**
   * Demo 2: Feedback recording
   */
  async demoFeedbackRecording() {
    console.log('📊 Demo 2: User Feedback Recording');

    const feedback = this.demoData.feedback[0];

    this.collector.recordFeedback(feedback.id, {
      ...feedback,
      metadata: {
        responseTime: 5,
        messageCount: 3,
        interventions: 1
      }
    });

    console.log(`   ✅ Recorded feedback: ${feedback.id}`);
    console.log(`   Satisfaction: ${feedback.satisfaction}/5`);
    console.log(`   NPS: ${feedback.nps}/10`);
    console.log(`   Issue resolved: ${feedback.issueResolved}`);
    console.log(`   Comments: "${feedback.comments}"`);
    console.log('');
  }

  /**
   * Demo 3: Intervention recording
   */
  async demoInterventionRecording() {
    console.log('👤 Demo 3: Human Intervention Recording');

    const intervention = this.demoData.interventions[0];

    this.collector.recordIntervention(intervention.id, intervention);

    console.log(`   ✅ Recorded intervention: ${intervention.id}`);
    console.log(`   Trigger: ${intervention.trigger}`);
    console.log(`   Severity: ${intervention.severity}`);
    console.log(`   Transfer time: ${intervention.transferTime}s`);
    console.log(`   Resolution: ${intervention.resolution}`);
    console.log(`   AI failure: ${intervention.aiFailureReason}`);
    console.log('');
  }

  /**
   * Demo 4: AI correction recording
   */
  async demoCorrectionRecording() {
    console.log('🔧 Demo 4: AI Response Corrections');

    const correction = this.demoData.corrections[0];

    this.collector.recordCorrection(correction.id, {
      ...correction,
      metadata: {
        confidence: 0.3,
        topic: 'infrastructure',
        language: 'en'
      }
    });

    console.log(`   ✅ Recorded correction: ${correction.id}`);
    console.log(`   Type: ${correction.correctionType}`);
    console.log(`   Category: ${correction.category}`);
    console.log(`   Reason: ${correction.reason}`);
    console.log(`   AI: "${correction.aiResponse.substring(0, 50)}..."`);
    console.log(`   Human: "${correction.humanCorrection.substring(0, 50)}..."`);
    console.log('');
  }

  /**
   * Demo 5: Training dataset generation
   */
  async demoDatasetGeneration() {
    console.log('🎯 Demo 5: Training Dataset Generation');

    const dataset = await this.collector.generateTrainingDataset({
      includeConversations: true,
      includeCorrections: true,
      includeInterventions: true,
      minQuality: 0.5
    });

    console.log(`   ✅ Generated training dataset`);
    console.log(`   Total samples: ${dataset.metadata.totalSamples}`);
    console.log(`   Conversations: ${dataset.training.conversations.length}`);
    console.log(`   Corrections: ${dataset.training.corrections.length}`);
    console.log(`   Interventions: ${dataset.training.interventions.length}`);
    console.log(`   Quality threshold: ${dataset.metadata.quality}`);
    console.log('');

    // Show sample training data
    if (dataset.training.conversations.length > 0) {
      console.log('   📋 Sample Conversation Training Data:');
      const sample = dataset.training.conversations[0];
      console.log(`      ID: ${sample.id}`);
      console.log(`      Category: ${sample.context.category}`);
      console.log(`      Outcome: ${sample.outcome}`);
      console.log(`      Messages: ${sample.messages.length}`);
    }

    if (dataset.training.corrections.length > 0) {
      console.log('   🔧 Sample Correction Training Data:');
      const sample = dataset.training.corrections[0];
      console.log(`      Type: ${sample.correctionType}`);
      console.log(`      Category: ${sample.context.category}`);
      console.log(`      Reason: ${sample.reason}`);
    }

    console.log('');
  }

  /**
   * Demo 6: Statistics and insights
   */
  demoStatisticsAndInsights() {
    console.log('📈 Demo 6: Training Data Statistics & Insights');

    const stats = this.collector.getStatistics();
    console.log(`   📊 Current Statistics:`);
    console.log(`      Conversations: ${stats.conversations}`);
    console.log(`      Feedback: ${stats.feedback}`);
    console.log(`      Interventions: ${stats.interventions}`);
    console.log(`      Corrections: ${stats.corrections}`);
    console.log(`      Last updated: ${stats.lastUpdated}`);
    console.log('');

    // Show improvement suggestions
    const performanceData = this.collector.trainingData.performance.get('improvement_suggestions') || [];
    if (performanceData.length > 0) {
      console.log('   💡 AI Improvement Suggestions:');
      performanceData.slice(0, 3).forEach((suggestion, index) => {
        console.log(`      ${index + 1}. ${suggestion.suggestion} (${suggestion.frequency}x)`);
      });
    }

    const metrics = this.collector.trainingData.performance.get('metrics') || {};
    if (metrics.averageSatisfaction) {
      console.log('   📊 Performance Metrics:');
      console.log(`      Average satisfaction: ${metrics.averageSatisfaction.toFixed(1)}/5`);
      console.log(`      Average NPS: ${metrics.averageNPS?.toFixed(1) || 'N/A'}/10`);
      console.log(`      Resolution rate: ${(metrics.resolutionRate * 100).toFixed(1)}%`);
      console.log(`      Total feedback: ${metrics.totalFeedback}`);
    }

    console.log('');
  }

  /**
   * Export training data for external use
   */
  async exportDemoData() {
    console.log('💾 Exporting Training Data for Analysis');

    const exportPath = './training-data-export.json';
    const metadata = await this.collector.exportTrainingData(exportPath, {
      includeConversations: true,
      includeCorrections: true,
      includeInterventions: true,
      minQuality: 0.3
    });

    console.log(`   ✅ Exported to: ${exportPath}`);
    console.log(`   Samples: ${metadata.totalSamples}`);
    console.log(`   Generated: ${metadata.generated}`);
    console.log('');
  }

  /**
   * Run quick validation test
   */
  async runQuickTest() {
    console.log('🧪 Running Quick Training Data Test');

    // Add sample data
    const testConversation = {
      id: 'test-conv-001',
      userId: 'test-user',
      language: 'en',
      messages: [
        { sender: 'user', content: 'Test question', timestamp: new Date().toISOString() }
      ],
      duration: 30,
      outcome: 'resolved',
      serviceCategory: 'test',
      satisfaction: 4
    };

    this.collector.recordConversation(testConversation.id, testConversation);

    const stats = this.collector.getStatistics();
    const success = stats.conversations > 0;

    console.log(`   Test result: ${success ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   Conversations recorded: ${stats.conversations}`);

    return success;
  }
}

// Export for use in other modules
export { TrainingDataDemo };

// Run demo if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const demo = new TrainingDataDemo();
  demo.runDemo().then(() => demo.exportDemoData()).catch(console.error);
}
