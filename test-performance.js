#!/usr/bin/env node

import axios from 'axios';

const API_URL = 'http://localhost:3000/api/chat';

const testQuestions = [
  "How do I report a pothole?",
  "What are the garbage collection days?",
  "How do I get a building permit?",
  "Where can I pay my water bill?",
  "How do I report a broken streetlight?"
];

async function testPerformance() {
  console.log('🚀 Testing Memphis 211/311 AI Assistant Performance');
  console.log('================================================\n');

  for (let i = 0; i < testQuestions.length; i++) {
    const question = testQuestions[i];
    console.log(`Test ${i + 1}: "${question}"`);
    
    const startTime = Date.now();
    
    try {
      const response = await axios.post(API_URL, {
        userId: `test_user_${Date.now()}`,
        question: question
      }, {
        timeout: 35000 // 35 second timeout
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      console.log(`✅ Response time: ${responseTime}ms`);
      console.log(`📝 Answer length: ${response.data.answer.length} characters`);
      console.log(`📄 Relevant pages: ${response.data.relevantPages?.length || 0}`);
      console.log(`🌐 Language: ${response.data.language} (${response.data.languageCode})`);
      console.log(`🎯 Confidence: ${Math.round(response.data.confidence * 100)}%`);
      
      if (response.data.relevantPages && response.data.relevantPages.length > 0) {
        console.log('📋 Top relevant page:');
        console.log(`   ${response.data.relevantPages[0].title} (${Math.round(response.data.relevantPages[0].similarity * 100)}%)`);
      }
      
    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      console.log(`❌ Error after ${responseTime}ms: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Error: ${error.response.data.error}`);
      }
    }
    
    console.log('---\n');
    
    // Wait 1 second between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('🏁 Performance test completed!');
}

// Run the test
testPerformance().catch(console.error);
