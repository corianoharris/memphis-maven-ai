/**
 * Progressive Handoff System Demo
 * Demonstrates the human-in-the-loop intervention capabilities
 */

import { ProgressiveHandoffSystem } from './progressive-handoff.js';

class ProgressiveHandoffDemo {
  constructor() {
    this.handoffSystem = new ProgressiveHandoffSystem();
    this.demoConversations = [];
  }

  /**
   * Run comprehensive demo of progressive handoff features
   */
  async runDemo() {
    console.log('🚀 Starting Progressive Handoff System Demo\n');

    // Demo 1: Basic conversation with automatic intervention
    await this.demoBasicIntervention();

    // Demo 2: User frustration trigger
    await this.demoFrustrationTrigger();

    // Demo 3: Complex topic intervention
    await this.demoComplexTopic();

    // Demo 4: Explicit human request
    await this.demoExplicitRequest();

    // Demo 5: Operator management
    await this.demoOperatorManagement();

    // Demo 6: System statistics
    this.demoSystemStats();

    console.log('✅ Progressive Handoff Demo completed!');
  }

  /**
   * Demo 1: Basic conversation with low confidence intervention
   */
  async demoBasicIntervention() {
    console.log('📝 Demo 1: Basic Conversation with Low Confidence Intervention');

    const conversationId = 'demo-basic-001';
    const userId = 'user-demo-001';

    // Register session
    this.handoffSystem.registerSession(conversationId, userId, {
      preferredLanguage: 'en',
      zipCode: '38103'
    });

    // Simulate conversation
    const messages = [
      { text: 'Hi, I need help with something', sender: 'user', confidence: 0.9 },
      { text: 'Hello! I\'d be happy to help. What can I assist you with today?', sender: 'ai', confidence: 0.9 },
      { text: 'I have a very specific question about zoning laws', sender: 'user', confidence: 0.3 }, // Low confidence trigger
      { text: 'I want to make sure you get the best help possible...', sender: 'ai', confidence: 0.3 }
    ];

    for (const message of messages) {
      this.handoffSystem.recordMessage(conversationId, message.text, message.sender, {
        confidence: message.confidence
      });
      await this.delay(500); // Simulate real-time conversation
    }

    // Check if intervention was triggered
    const status = this.handoffSystem.getSessionStatus(conversationId);
    console.log(`   Status: ${status.status}`);
    console.log(`   Interventions: ${status.interventionHistory.length}`);

    if (status.interventionHistory.length > 0) {
      console.log('   ✅ Low confidence intervention triggered successfully');
    }

    console.log('');
  }

  /**
   * Demo 2: User frustration trigger
   */
  async demoFrustrationTrigger() {
    console.log('😤 Demo 2: User Frustration Intervention');

    const conversationId = 'demo-frustration-002';
    const userId = 'user-demo-002';

    this.handoffSystem.registerSession(conversationId, userId);

    const messages = [
      { text: 'I need help with my water bill', sender: 'user' },
      { text: 'I can help you with water bill questions!', sender: 'ai' },
      { text: 'This is not helping at all', sender: 'user' },
      { text: 'I\'m sorry you\'re frustrated...', sender: 'ai' },
      { text: 'I\'m really frustrated with this service', sender: 'user' } // Frustration trigger
    ];

    for (const message of messages) {
      this.handoffSystem.recordMessage(conversationId, message.text, message.sender);
      await this.delay(300);
    }

    const status = this.handoffSystem.getSessionStatus(conversationId);
    console.log(`   Status: ${status.status}`);
    console.log(`   Interventions: ${status.interventionHistory.length}`);

    if (status.interventionHistory.some(i => i.type === 'transfer_to_human')) {
      console.log('   ✅ Frustration-based intervention triggered successfully');
    }

    console.log('');
  }

  /**
   * Demo 3: Complex topic intervention
   */
  async demoComplexTopic() {
    console.log('🏗️ Demo 3: Complex Topic Intervention');

    const conversationId = 'demo-complex-003';
    const userId = 'user-demo-003';

    this.handoffSystem.registerSession(conversationId, userId);

    const messages = [
      { text: 'Hello', sender: 'user' },
      { text: 'Hi there! How can I help?', sender: 'ai' },
      { text: 'I need information about building permits and zoning laws', sender: 'user' } // Complex topic
    ];

    for (const message of messages) {
      this.handoffSystem.recordMessage(conversationId, message.text, message.sender);
      await this.delay(400);
    }

    const status = this.handoffSystem.getSessionStatus(conversationId);
    console.log(`   Status: ${status.status}`);
    console.log(`   Interventions: ${status.interventionHistory.length}`);

    if (status.interventionHistory.length > 0) {
      console.log('   ✅ Complex topic intervention triggered successfully');
    }

    console.log('');
  }

  /**
   * Demo 4: Explicit human request
   */
  async demoExplicitRequest() {
    console.log('🙋 Demo 4: Explicit Human Request');

    const conversationId = 'demo-explicit-004';
    const userId = 'user-demo-004';

    this.handoffSystem.registerSession(conversationId, userId);

    const messages = [
      { text: 'Can I speak to a real person?', sender: 'user' } // Explicit request
    ];

    for (const message of messages) {
      this.handoffSystem.recordMessage(conversationId, message.text, message.sender);
      await this.delay(200);
    }

    const status = this.handoffSystem.getSessionStatus(conversationId);
    console.log(`   Status: ${status.status}`);
    console.log(`   Interventions: ${status.interventionHistory.length}`);

    if (status.interventionHistory.some(i => i.type === 'transfer_to_human')) {
      console.log('   ✅ Explicit request intervention triggered successfully');
    }

    console.log('');
  }

  /**
   * Demo 5: Operator management
   */
  async demoOperatorManagement() {
    console.log('👥 Demo 5: Operator Management');

    // Get operator status
    const operators = this.handoffSystem.getOperatorStatus();
    console.log(`   Total operators: ${operators.length}`);
    console.log(`   Available operators: ${operators.filter(op => op.status === 'available').length}`);

    // Simulate operator assignment
    const conversationId = 'demo-operator-005';
    this.handoffSystem.registerSession(conversationId, 'user-demo-005');

    // Trigger intervention
    this.handoffSystem.recordMessage(conversationId, 'I need urgent help with an emergency', 'user');

    await this.delay(1000); // Wait for monitoring loop

    const status = this.handoffSystem.getSessionStatus(conversationId);
    console.log(`   Session status: ${status.status}`);

    if (status.operatorId) {
      console.log(`   Assigned operator: ${status.operatorId}`);
      console.log('   ✅ Operator assignment working');
    }

    console.log('');
  }

  /**
   * Demo 6: System statistics
   */
  demoSystemStats() {
    console.log('📊 Demo 6: System Statistics');

    const stats = this.handoffSystem.getSystemStats();
    console.log(`   Active sessions: ${stats.activeSessions}`);
    console.log(`   Human active sessions: ${stats.humanActiveSessions}`);
    console.log(`   Pending interventions: ${stats.pendingInterventions}`);
    console.log(`   Available operators: ${stats.availableOperators}`);
    console.log(`   Total operators: ${stats.totalOperators}`);
    console.log(`   Avg intervention time: ${stats.averageInterventionTime}s`);

    console.log('');
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Run quick intervention test
   */
  async runQuickTest() {
    console.log('🧪 Running Quick Progressive Handoff Test');

    const conversationId = 'test-quick-001';
    this.handoffSystem.registerSession(conversationId, 'test-user');

    // Test low confidence trigger
    this.handoffSystem.recordMessage(conversationId, 'Complex legal question about permits', 'user', {
      confidence: 0.2
    });

    await this.delay(6000); // Wait for monitoring

    const status = this.handoffSystem.getSessionStatus(conversationId);
    const success = status.interventionHistory.length > 0;

    console.log(`   Test result: ${success ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   Interventions triggered: ${status.interventionHistory.length}`);

    return success;
  }
}

// Export for use in other modules
export { ProgressiveHandoffDemo };

// Run demo if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const demo = new ProgressiveHandoffDemo();
  demo.runDemo().catch(console.error);
}
