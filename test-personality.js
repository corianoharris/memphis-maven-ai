#!/usr/bin/env node

import axios from 'axios';

const API_URL = 'http://localhost:3000/api/chat';

/**
 * Test suite for validating the updated chatbot personality and behavior
 * Tests the new personality system, multi-language support, and natural conversation flow
 */
const personalityTests = {
  // Core personality tests
  english: [
    {
      name: "Greeting Test",
      question: "Hi there!",
      expectedTraits: ["friendly", "conversational", "engaging"]
    },
    {
      name: "Follow-up Question",
      question: "Also, what about streetlights?",
      expectedTraits: ["responsive", "helpful", "engaged"]
    },
    {
      name: "Urgent Request",
      question: "I need to report an urgent water main break!",
      expectedTraits: ["direct", "helpful", "urgent"]
    },
    {
      name: "Technical Question",
      question: "How do I apply for a building permit?",
      expectedTraits: ["thorough", "informative", "clear"]
    },
    {
      name: "Gratitude Response",
      question: "Thank you for the help!",
      expectedTraits: ["warm", "appreciative", "friendly"]
    }
  ],

  // Multi-language tests
  spanish: [
    {
      name: "Spanish Greeting",
      question: "¡Hola! ¿Cómo puedo reportar un hoyo en el pavimento?",
      expectedTraits: ["friendly", "helpful", "cultural_aware"]
    },
    {
      name: "Spanish Follow-up",
      question: "¿También puedo reportar una luz de calle rota?",
      expectedTraits: ["responsive", "engaged", "helpful"]
    }
  ],

  // Arabic tests
  arabic: [
    {
      name: "Arabic Greeting",
      question: "مرحبا! كيف يمكنني الإبلاغ عن حفرة في الطريق؟",
      expectedTraits: ["friendly", "helpful", "cultural_aware"]
    }
  ],

  // Edge cases
  edgeCases: [
    {
      name: "Confused User",
      question: "I'm confused about trash pickup days...",
      expectedTraits: ["patient", "reassuring", "helpful"]
    },
    {
      name: "Error Recovery",
      question: "What are the emergency services numbers?",
      expectedTraits: ["reliable", "informative", "clear"]
    }
  ]
};

async function runPersonalityTests() {
  console.log('🧠 Testing Updated Chatbot Personality & Behavior');
  console.log('=================================================\n');

  let totalTests = 0;
  let passedTests = 0;
  const detailedResults = [];

  // Test English personality
  console.log('🇺🇸 Testing English Personality Traits');
  console.log('---------------------------------------');
  for (const test of personalityTests.english) {
    totalTests++;
    const result = await testQuestion(test.question, 'en', test.name);
    const passed = validatePersonalityTraits(result.answer, test.expectedTraits);
    if (passed) {
      passedTests++;
      console.log(`✅ ${test.name}: PASSED`);
    } else {
      console.log(`❌ ${test.name}: FAILED`);
    }
    console.log(`   Response: "${result.answer.substring(0, 100)}..."`);
    console.log(`   Confidence: ${Math.round(result.confidence * 100)}%`);
    console.log(`   Language: ${result.originalLanguage}`);
    console.log('');
    
    detailedResults.push({
      test: test.name,
      language: 'en',
      question: test.question,
      answer: result.answer,
      traits: test.expectedTraits,
      passed: passed,
      confidence: result.confidence
    });

    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Test Spanish personality
  console.log('🇪🇸 Testing Spanish Personality Traits');
  console.log('---------------------------------------');
  for (const test of personalityTests.spanish) {
    totalTests++;
    const result = await testQuestion(test.question, 'es', test.name);
    const passed = validatePersonalityTraits(result.answer, test.expectedTraits);
    if (passed) {
      passedTests++;
      console.log(`✅ ${test.name}: PASSED`);
    } else {
      console.log(`❌ ${test.name}: FAILED`);
    }
    console.log(`   Response: "${result.answer.substring(0, 100)}..."`);
    console.log(`   Confidence: ${Math.round(result.confidence * 100)}%`);
    console.log(`   Language: ${result.originalLanguage}`);
    console.log('');
    
    detailedResults.push({
      test: test.name,
      language: 'es',
      question: test.question,
      answer: result.answer,
      traits: test.expectedTraits,
      passed: passed,
      confidence: result.confidence
    });

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Test Arabic personality
  console.log('🇸🇦 Testing Arabic Personality Traits');
  console.log('--------------------------------------');
  for (const test of personalityTests.arabic) {
    totalTests++;
    const result = await testQuestion(test.question, 'ar', test.name);
    const passed = validatePersonalityTraits(result.answer, test.expectedTraits);
    if (passed) {
      passedTests++;
      console.log(`✅ ${test.name}: PASSED`);
    } else {
      console.log(`❌ ${test.name}: FAILED`);
    }
    console.log(`   Response: "${result.answer.substring(0, 100)}..."`);
    console.log(`   Confidence: ${Math.round(result.confidence * 100)}%`);
    console.log(`   Language: ${result.originalLanguage}`);
    console.log('');
    
    detailedResults.push({
      test: test.name,
      language: 'ar',
      question: test.question,
      answer: result.answer,
      traits: test.expectedTraits,
      passed: passed,
      confidence: result.confidence
    });

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Test edge cases
  console.log('🔄 Testing Edge Cases');
  console.log('---------------------');
  for (const test of personalityTests.edgeCases) {
    totalTests++;
    const result = await testQuestion(test.question, 'en', test.name);
    const passed = validatePersonalityTraits(result.answer, test.expectedTraits);
    if (passed) {
      passedTests++;
      console.log(`✅ ${test.name}: PASSED`);
    } else {
      console.log(`❌ ${test.name}: FAILED`);
    }
    console.log(`   Response: "${result.answer.substring(0, 100)}..."`);
    console.log(`   Confidence: ${Math.round(result.confidence * 100)}%`);
    console.log(`   Language: ${result.originalLanguage}`);
    console.log('');
    
    detailedResults.push({
      test: test.name,
      language: 'en',
      question: test.question,
      answer: result.answer,
      traits: test.expectedTraits,
      passed: passed,
      confidence: result.confidence
    });

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log('📊 TEST SUMMARY');
  console.log('===============');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  console.log('');

  // Analysis
  console.log('🔍 PERSONALITY ANALYSIS');
  console.log('=======================');
  analyzePersonalityResults(detailedResults);
  
  return {
    totalTests,
    passedTests,
    successRate: (passedTests / totalTests) * 100,
    detailedResults
  };
}

async function testQuestion(question, language, testName) {
  console.log(`🧪 Testing: "${question}" (${language})`);
  
  const startTime = Date.now();
  
  try {
    const response = await axios.post(API_URL, {
      userId: `personality_test_${Date.now()}`,
      question: question,
      preferredLanguage: language
    }, {
      timeout: 30000
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`⏱️  Response time: ${responseTime}ms`);
    
    return {
      answer: response.data.answer,
      confidence: response.data.confidence || 0,
      originalLanguage: response.data.originalLanguage || 'English',
      responseTime: responseTime,
      isError: false
    };
  } catch (error) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`❌ Error after ${responseTime}ms: ${error.message}`);
    
    return {
      answer: `Error: ${error.message}`,
      confidence: 0,
      originalLanguage: language === 'es' ? 'Spanish' : language === 'ar' ? 'Arabic' : 'English',
      responseTime: responseTime,
      isError: true
    };
  }
}

function validatePersonalityTraits(answer, expectedTraits) {
  const lowerAnswer = answer.toLowerCase();
  
  // Check for negative traits (things that should NOT be present)
  const negativePatterns = [
    /y\'all/i,           // Avoid Southern stereotypes
    /sweet tea/i,        // Avoid cultural food references
    /blues music/i,      // Avoid Memphis music stereotypes
    /beale street/i,     // Avoid constant Memphis references
    /grits/i,            // Avoid Southern food stereotypes
    / dixie /i           // Avoid regional references
  ];
  
  for (const pattern of negativePatterns) {
    if (pattern.test(lowerAnswer)) {
      console.log(`   ⚠️  Found potentially stereotypical reference: ${pattern}`);
      return false;
    }
  }
  
  // Check for positive personality traits
  const positivePatterns = {
    friendly: /hey|hi|hello|great|awesome|perfect|excellent|wonderful/i,
    helpful: /help|assist|guide|support|point|direct/i,
    engaged: /question|ask|follow|more|anything|else/i,
    warm: /appreciate|thank|glad|nice|good|welcome/i,
    clear: /here\'s|step|process|way|solution/i,
    reassuring: /don\'t worry|no problem|we\'ll get|let\'s figure/i,
    direct: /right away|immediately|urgent|priority/i,
    thorough: /detail|specific|comprehensive|complete/i,
    patient: /no worries|slow down|explain|clarify/i,
    cultural_aware: /hola|gracias|مرحبا|شكرا|¿|¡/i
  };
  
  let traitMatches = 0;
  for (const trait of expectedTraits) {
    if (positivePatterns[trait] && positivePatterns[trait].test(lowerAnswer)) {
      traitMatches++;
    }
  }
  
  // Require at least 70% of expected traits to be present
  const minTraits = Math.ceil(expectedTraits.length * 0.7);
  const passed = traitMatches >= minTraits;
  
  console.log(`   🎯 Traits found: ${traitMatches}/${expectedTraits.length} (${Math.round((traitMatches/expectedTraits.length)*100)}%)`);
  
  return passed;
}

function analyzePersonalityResults(results) {
  console.log('📈 Response Analysis:');
  
  // Calculate average response length
  const avgLength = results.reduce((sum, r) => sum + r.answer.length, 0) / results.length;
  console.log(`   Average response length: ${Math.round(avgLength)} characters`);
  
  // Language distribution
  const languages = {};
  results.forEach(r => {
    languages[r.language] = (languages[r.language] || 0) + 1;
  });
  console.log(`   Language distribution: ${JSON.stringify(languages)}`);
  
  // Confidence analysis
  const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
  console.log(`   Average confidence: ${Math.round(avgConfidence * 100)}%`);
  
  // Common issues
  console.log('\n🔧 Common Issues Found:');
  results.filter(r => !r.passed).forEach(r => {
    console.log(`   - ${r.test} (${r.language}): Failed personality validation`);
  });
  
  console.log('\n✅ Strengths:');
  const strengths = ['friendly', 'helpful', 'engaged', 'warm'];
  results.forEach(r => {
    if (r.passed) {
      strengths.forEach(strength => {
        if (r.answer.toLowerCase().includes(strength)) {
          console.log(`   - Strong ${strength} response in ${r.test}`);
        }
      });
    }
  });
}

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  runPersonalityTests()
    .then(results => {
      console.log('\n🎉 Personality testing completed!');
      console.log(`Success Rate: ${results.successRate.toFixed(1)}%`);
      process.exit(results.successRate >= 70 ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Testing failed:', error);
      process.exit(1);
    });
}

export { runPersonalityTests };