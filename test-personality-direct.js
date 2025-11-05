#!/usr/bin/env node

/**
 * Direct unit tests for the updated AI personality system
 * Tests the refactored lib/ai.js module without requiring server
 */

import { safeProcessQuestion } from './lib/ai.js';

// Mock database functionality for testing
const mockDB = {
  searchSimilarPages: async () => [
    {
      title: "Pothole Reporting Guide",
      url: "https://memphistn.gov/potholes",
      similarity: 0.85
    },
    {
      title: "Street Maintenance Services", 
      url: "https://memphistn.gov/streets",
      similarity: 0.78
    }
  ]
};

/**
 * Personality and behavior test cases
 */
const personalityTestCases = [
  // Core personality tests
  {
    category: "English Greetings",
    tests: [
      {
        name: "Simple greeting",
        question: "Hi there!",
        expectedTraits: ["friendly", "conversational", "engaging"],
        shouldAvoid: ["southern stereotypes", "excessive memphis references"]
      },
      {
        name: "Polite greeting",
        question: "Hello, how are you?",
        expectedTraits: ["warm", "approachable", "helpful"],
        shouldAvoid: ["southern stereotypes", "excessive memphis references"]
      }
    ]
  },
  {
    category: "Service Requests",
    tests: [
      {
        name: "Pothole reporting",
        question: "I need to report a pothole on my street",
        expectedTraits: ["helpful", "direct", "informative"],
        shouldInclude: ["311", "(901) 636-6500", "phone call", "location"]
      },
      {
        name: "Building permit inquiry",
        question: "How do I get a building permit?",
        expectedTraits: ["thorough", "clear", "step-by-step"],
        shouldInclude: ["permit", "application", "city"]
      }
    ]
  },
  {
    category: "Multi-language Support",
    tests: [
      {
        name: "Spanish greeting",
        question: "¡Hola! ¿Cómo está usted?",
        preferredLanguage: "es",
        expectedTraits: ["friendly", "cultural_aware", "helpful"],
        shouldInclude: ["hola", "ayuda", "servicios"]
      },
      {
        name: "Arabic greeting", 
        question: "مرحبا! كيف يمكنني الحصول على المساعدة؟",
        preferredLanguage: "ar",
        expectedTraits: ["friendly", "cultural_aware", "helpful"],
        shouldInclude: ["مرحبا", "مساعدة", "خدمات"]
      }
    ]
  },
  {
    category: "Conversation Flow",
    tests: [
      {
        name: "Follow-up question",
        question: "Also, what about streetlights?",
        expectedTraits: ["responsive", "engaged", "continuity"],
        shouldInclude: ["streetlight", "report", "also"]
      },
      {
        name: "Gratitude response",
        question: "Thank you so much for your help!",
        expectedTraits: ["appreciative", "warm", "genuine"],
        shouldInclude: ["welcome", "happy", "glad"]
      }
    ]
  },
  {
    category: "Error Handling",
    tests: [
      {
        name: "Confused user",
        question: "I'm not sure what you're talking about...",
        expectedTraits: ["patient", "reassuring", "clarifying"],
        shouldInclude: ["clarify", "explain", "simple"]
      },
      {
        name: "Technical difficulty",
        question: "There seems to be an error with the system",
        expectedTraits: ["apologetic", "solution-oriented", "helpful"],
        shouldInclude: ["sorry", "try", "assist"]
      }
    ]
  }
];

/**
 * Validate personality traits in responses
 */
function validatePersonalityTraits(answer, expectedTraits, category, testName) {
  const lowerAnswer = answer.toLowerCase();
  let traitsFound = 0;
  
  // Define trait patterns (what we look for)
  const traitPatterns = {
    friendly: /hey|hi|hello|great|awesome|perfect|excellent|wonderful|happy|glad/i,
    conversational: /so|well|you know|here\'s|let\'s|tell me/i,
    engaging: /question|ask|follow|more|anything|else|what else/i,
    warm: /appreciate|thank|glad|nice|good|welcome|pleased/i,
    helpful: /help|assist|guide|support|point|direct|recommend/i,
    direct: /right away|immediately|urgent|priority|call|phone/i,
    thorough: /detail|specific|step|process|way|comprehensive|complete/i,
    patient: /no worries|don\'t worry|slow down|explain|clarify|take your time/i,
    reassuring: /we\'ll get|let\'s figure|don\'t worry|no problem|i\'m here/i,
    responsive: /also|right|that|exactly|perfect|great question/i,
    engaged: /follow|question|ask|more|interested|glad/i,
    appreciative: /welcome|glad|pleased|happy|thank you/i,
    solution_oriented: /solution|help|fix|solve|resolve|assist/i,
    clarifying: /clarify|explain|simple|understand|mean/i,
    apologetic: /sorry|apologize|excuse|forgive/i,
    cultural_aware: /hola|gracias|مرحبا|شكرا|¿|¡|help|assist/i
  };
  
  console.log(`\n🎯 Validating ${testName}:`);
  console.log(`   Response: "${answer.substring(0, 100)}..."`);
  
  // Check for expected traits
  for (const trait of expectedTraits) {
    if (traitPatterns[trait] && traitPatterns[trait].test(lowerAnswer)) {
      traitsFound++;
      console.log(`   ✅ Found trait: ${trait}`);
    } else {
      console.log(`   ❌ Missing trait: ${trait}`);
    }
  }
  
  // Check for stereotypical patterns to avoid
  const stereotypes = [
    /y\'all/i,           // Southern
    /sweet tea/i,        // Southern food
    /grits/i,            // Southern food  
    /blues music/i,      // Memphis music
    /beale street/i,     // Memphis landmark
    /barbecue/i,         // Regional food (too specific)
    /memphis rap/i,      // Regional music
    /tennessee/i,        // Too specific state reference
    / dixie /i           // Regional
  ];
  
  let stereotypesFound = [];
  for (const pattern of stereotypes) {
    if (pattern.test(lowerAnswer)) {
      stereotypesFound.push(pattern);
      console.log(`   ⚠️  Stereotype found: ${pattern}`);
    }
  }
  
  const traitScore = traitsFound / expectedTraits.length;
  const stereotypePenalty = stereotypesFound.length > 0 ? 0.3 : 0;
  const finalScore = Math.max(0, traitScore - stereotypePenalty);
  
  const passed = finalScore >= 0.6; // 60% threshold
  const grade = finalScore >= 0.8 ? 'EXCELLENT' : finalScore >= 0.6 ? 'GOOD' : finalScore >= 0.4 ? 'FAIR' : 'NEEDS WORK';
  
  console.log(`   📊 Score: ${Math.round(finalScore * 100)}% (${grade})`);
  console.log(`   ${passed ? '✅ PASSED' : '❌ FAILED'}`);
  
  return {
    passed,
    score: finalScore,
    traitsFound,
    traitsExpected: expectedTraits.length,
    stereotypesFound: stereotypesFound.length
  };
}

/**
 * Run comprehensive personality tests
 */
async function runComprehensiveTests() {
  console.log('🧠 COMPREHENSIVE AI PERSONALITY TESTING');
  console.log('=======================================\n');
  
  let totalTests = 0;
  let passedTests = 0;
  const detailedResults = [];
  
  // Test each category
  for (const category of personalityTestCases) {
    console.log(`📂 ${category.category}`);
    console.log('='.repeat(category.category.length + 5));
    
    for (const test of category.tests) {
      totalTests++;
      
      try {
        console.log(`\n🧪 Testing: "${test.question}"`);
        
        // Mock the database search similar pages function
        const similarPages = await mockDB.searchSimilarPages();
        
        // Call the AI function with test parameters
        const result = await safeProcessQuestion(
          test.question,
          similarPages,
          test.preferredLanguage || 'en'
        );
        
        console.log(`   Response: "${result.answer.substring(0, 150)}..."`);
        console.log(`   Language: ${result.originalLanguage}`);
        console.log(`   Confidence: ${Math.round(result.confidence * 100)}%`);
        
        // Validate personality traits
        const validation = validatePersonalityTraits(
          result.answer,
          test.expectedTraits,
          category.category,
          test.name
        );
        
        if (validation.passed) {
          passedTests++;
        }
        
        detailedResults.push({
          category: category.category,
          testName: test.name,
          question: test.question,
          language: test.preferredLanguage || 'en',
          answer: result.answer,
          confidence: result.confidence,
          validation: validation
        });
        
      } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
        detailedResults.push({
          category: category.category,
          testName: test.name,
          question: test.question,
          error: error.message,
          validation: { passed: false, score: 0 }
        });
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n' + '-'.repeat(60) + '\n');
  }
  
  // Generate comprehensive summary
  console.log('📊 COMPREHENSIVE TEST RESULTS');
  console.log('=============================');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  console.log('');
  
  // Category breakdown
  console.log('📈 BY CATEGORY:');
  const categoryBreakdown = {};
  detailedResults.forEach(result => {
    if (!categoryBreakdown[result.category]) {
      categoryBreakdown[result.category] = { total: 0, passed: 0 };
    }
    categoryBreakdown[result.category].total++;
    if (result.validation.passed) {
      categoryBreakdown[result.category].passed++;
    }
  });
  
  Object.entries(categoryBreakdown).forEach(([category, stats]) => {
    const rate = Math.round((stats.passed / stats.total) * 100);
    console.log(`   ${category}: ${stats.passed}/${stats.total} (${rate}%)`);
  });
  
  // Top performing areas
  console.log('\n✅ STRENGTHS:');
  const strengths = {};
  detailedResults
    .filter(r => r.validation && r.validation.score >= 0.8)
    .forEach(r => {
      if (!strengths[r.category]) strengths[r.category] = [];
      strengths[r.category].push(r.testName);
    });
    
  Object.entries(strengths).forEach(([category, tests]) => {
    console.log(`   ${category}: ${tests.join(', ')}`);
  });
  
  // Areas for improvement
  console.log('\n🔧 IMPROVEMENT AREAS:');
  const improvements = {};
  detailedResults
    .filter(r => r.validation && r.validation.score < 0.6)
    .forEach(r => {
      if (!improvements[r.category]) improvements[r.category] = [];
      improvements[r.category].push(r.testName);
    });
    
  Object.entries(improvements).forEach(([category, tests]) => {
    console.log(`   ${category}: ${tests.join(', ')}`);
  });
  
  console.log('\n🎯 FINAL ASSESSMENT:');
  const overallScore = (passedTests / totalTests) * 100;
  if (overallScore >= 80) {
    console.log('   ✅ EXCELLENT: Personality system working very well!');
  } else if (overallScore >= 60) {
    console.log('   ⚠️  GOOD: Personality system working, with minor improvements needed.');
  } else if (overallScore >= 40) {
    console.log('   🔧 FAIR: Personality system needs refinement.');
  } else {
    console.log('   ❌ NEEDS WORK: Significant personality improvements required.');
  }
  
  return {
    totalTests,
    passedTests,
    successRate: overallScore,
    detailedResults,
    categoryBreakdown
  };
}

// Run the comprehensive tests
if (import.meta.url === `file://${process.argv[1]}`) {
  runComprehensiveTests()
    .then(results => {
      console.log(`\n🎉 Testing completed! Success Rate: ${results.successRate.toFixed(1)}%`);
      process.exit(results.successRate >= 60 ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Testing failed:', error);
      process.exit(1);
    });
}

export { runComprehensiveTests };