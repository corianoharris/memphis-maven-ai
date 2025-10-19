#!/usr/bin/env node

import axios from 'axios';

async function testWebhook() {
  console.log('🧪 Testing SMS webhook endpoint...');
  
  try {
    const response = await axios.post('https://memphis-maven-ai.vercel.app/api/sms', {
      From: '+18773801914',
      Body: 'How do I report a pothole?'
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    console.log('✅ Webhook response:', response.status);
    console.log('Response data:', response.data);
    
  } catch (error) {
    console.error('❌ Webhook test failed:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data || error.message);
  }
}

testWebhook();
