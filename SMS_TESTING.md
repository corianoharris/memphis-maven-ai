# SMS Testing Guide

This guide explains how to test the SMS functionality of the Memphis 211/311 AI Assistant using Twilio test phone numbers.

## Prerequisites

1. **Twilio Account**: You need a Twilio account with:
   - Account SID
   - Auth Token
   - Phone Number (for sending SMS)

2. **Environment Variables**: Set these in your `.env.local` file:
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   TWILIO_TEST_PHONE_NUMBER=+15005550006  # Optional: Twilio test number
   ```

## Testing Methods

### 1. Basic SMS Test (GET /api/sms)

Sends a simple test message to verify SMS functionality.

**Using the API directly:**
```bash
curl -X GET http://localhost:3000/api/sms
```

**Using the test script:**
```bash
npm run test-sms basic
# or
node scripts/testSMS.js basic
```

### 2. Advanced SMS Test (PUT /api/sms)

Sends test messages with different scenarios to simulate real-world usage.

**Available scenarios:**
- `pothole` - Tests pothole reporting
- `emergency` - Tests emergency situations
- `community` - Tests community services requests
- `custom` - Tests with your own message

**Using the API directly:**
```bash
# Test pothole scenario
curl -X PUT http://localhost:3000/api/sms \
  -H "Content-Type: application/json" \
  -d '{"testScenario": "pothole"}'

# Test custom message
curl -X PUT http://localhost:3000/api/sms \
  -H "Content-Type: application/json" \
  -d '{"message": "I need help with trash pickup", "testScenario": "custom"}'
```

**Using the test script:**
```bash
# Test different scenarios
npm run test-sms advanced --scenario=pothole
npm run test-sms advanced --scenario=emergency
npm run test-sms advanced --scenario=community

# Test custom message
npm run test-sms advanced --custom="I need help with my water bill"
```

### 3. Full AI Response Test (POST /api/sms)

To test the complete AI response system, you need to:

1. **Set up a Twilio webhook** pointing to your SMS endpoint
2. **Send a real SMS** to your Twilio phone number
3. **The webhook will trigger** the AI processing and send a response

**Webhook URL format:**
```
https://your-domain.com/api/sms
```

## Twilio Test Phone Numbers

Twilio provides special test phone numbers that don't actually send SMS but return success responses:

- `+15005550006` - General test number
- `+15005550007` - Test number for receiving SMS
- `+15005550008` - Test number for receiving calls

## Expected Responses

### Basic Test Response
```json
{
  "success": true,
  "sid": "SM1234567890abcdef",
  "message": "Test SMS sent successfully",
  "to": "+15005550006",
  "from": "+1234567890"
}
```

### Advanced Test Response
```json
{
  "success": true,
  "sid": "SM1234567890abcdef",
  "scenario": "pothole",
  "message": "There is a large pothole on Main Street...",
  "expectedResponse": "Memphis 311 service request for pothole repair",
  "to": "+15005550006",
  "from": "+1234567890",
  "instructions": "This was a test message. To test the full AI response, send this message to your Twilio webhook URL."
}
```

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   - Error: "Missing required environment variables"
   - Solution: Check your `.env.local` file has all required Twilio credentials

2. **Invalid Phone Number**
   - Error: "Invalid phone number format"
   - Solution: Use E.164 format (+1234567890)

3. **Twilio Account Issues**
   - Error: "Authentication failed"
   - Solution: Verify your Account SID and Auth Token

4. **Webhook Not Responding**
   - Error: "Webhook timeout"
   - Solution: Ensure your server is running and accessible from the internet

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=sms:*
```

## Production Considerations

1. **Rate Limiting**: Implement rate limiting for SMS endpoints
2. **Error Handling**: Add comprehensive error handling
3. **Logging**: Log all SMS interactions for debugging
4. **Security**: Validate webhook signatures from Twilio
5. **Monitoring**: Set up monitoring for SMS delivery rates

## Next Steps

1. Test basic SMS functionality
2. Test different scenarios
3. Set up Twilio webhook
4. Test full AI response flow
5. Monitor and optimize performance
