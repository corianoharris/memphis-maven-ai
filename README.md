# Memphis 211/311 AI Assistant

A comprehensive Next.js AI chat application for Memphis 211/311 services with semantic search, multilingual support, and SMS integration via Google Voice.

## Features

- 🤖 **AI-Powered Chat**: Uses Ollama for intelligent responses (completely self-hosted)
- 🔍 **Semantic Search**: Finds relevant information using vector embeddings
- 🌍 **Multilingual Support**: English, Spanish, and Arabic
- 📱 **SMS Integration**: Google Voice bot for SMS communication
- 🗄️ **PostgreSQL Database**: Neon/PostgreSQL for data storage
- 🕷️ **Web Scraping**: Automated scraping of Memphis 211/311 pages
- ⏰ **Scheduled Updates**: Automatic daily content updates

## Project Structure

```
memphis-211-311-ai-assistant/
├── app/
│   ├── api/chat/route.js     # AI chat API endpoint
│   └── page.tsx              # Web chat UI
├── lib/
│   ├── db.js                 # Database connection & queries
│   └── ai.js                 # AI integration & multilingual support
├── scripts/
│   ├── googleVoiceBot.js     # SMS bot with Puppeteer
│   ├── scrapePages.js        # Web scraping & embeddings
│   └── scheduler.js          # Automated scheduling
└── env.example               # Environment variables template
```

## Prerequisites

- Node.js 18+ 
- PostgreSQL database (Neon recommended)
- Google Voice account (for SMS bot)
- Ollama (self-hosted AI)

## Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd memphis-211-311-ai-assistant
npm install
```

2. **Set up environment variables:**
```bash
cp env.example .env
```

Edit `.env` with your credentials:
```env
# Database Configuration
DATABASE_URL=postgres://user:password@host:port/dbname

# Google Voice Credentials (for SMS bot)
GOOGLE_EMAIL=your-google-email@gmail.com
GOOGLE_PASSWORD=your-google-password

# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **Set up Ollama:**
```bash
# Install Ollama (macOS/Linux)
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama service
ollama serve

# Install required models (in a new terminal)
ollama pull llama2
ollama pull nomic-embed-text  # Required for embeddings
```

4. **Set up PostgreSQL database:**
```sql
-- The database schema will be created automatically when you run the application
-- Make sure your DATABASE_URL is correct in the .env file
```

## Usage

### 1. Web Chat Interface

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the web chat interface.

### 2. SMS Bot (Google Voice)

Run the SMS bot:
```bash
npm run sms-bot
```

The bot will:
- Open a browser window for Google Voice login
- Monitor incoming SMS messages
- Process messages with AI
- Send responses back via SMS

### 3. Web Scraping

Run initial scraping:
```bash
npm run scrape
```

Update embeddings only:
```bash
node scripts/scrapePages.js update-embeddings
```

### 4. Automated Scheduler

Start the scheduler for automated updates:
```bash
npm run scheduler
```

Or run specific tasks:
```bash
# Start all scheduled jobs
node scripts/scheduler.js start

# Run manual scraping
node scripts/scheduler.js scrape

# Update embeddings
node scripts/scheduler.js embeddings

# Check status
node scripts/scheduler.js status
```

## API Endpoints

### POST /api/chat
Send a chat message and get AI response.

**Request:**
```json
{
  "userId": "user_123",
  "question": "How do I report a pothole?",
  "conversationId": "optional-conversation-id"
}
```

**Response:**
```json
{
  "answer": "To report a pothole in Memphis...",
  "conversationId": "uuid",
  "language": "English",
  "languageCode": "en",
  "confidence": 0.85,
  "relevantPages": [...],
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### GET /api/chat
Get conversation history.

**Query Parameters:**
- `conversationId` - Get messages for specific conversation
- `userId` - Get messages for specific user

## Database Schema

The application automatically creates these tables:

- **pages**: Scraped web content with embeddings
- **conversations**: Chat conversations
- **messages**: Individual chat messages

## Multilingual Support

The system automatically:
1. Detects the language of incoming messages
2. Translates to English for AI processing
3. Translates responses back to the original language

Supported languages:
- English (en)
- Spanish (es) 
- Arabic (ar)

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms

1. Build the application:
```bash
npm run build
```

2. Start production server:
```bash
npm start
```

3. Run background services (scheduler, SMS bot) separately

## Configuration

### Scraping URLs

Edit `scripts/scrapePages.js` to add more URLs to scrape:
```javascript
const TARGET_URLS = [
  'https://team211.communityos.org/linc211memphis',
  'https://memphistn.gov/call-311/',
  // Add more URLs here
];
```

### AI Models

The system uses:
- **Embeddings**: `sentence-transformers/all-MiniLM-L6-v2`
- **Translation**: Helsinki-NLP models
- **Chat**: OpenAI GPT-3.5-turbo

### Scheduling

Default schedule:
- **Daily scraping**: 2:00 AM CT
- **Embedding updates**: Every 6 hours
- **Health checks**: Every hour

## Troubleshooting

### Common Issues

1. **Database connection errors**: Check your DATABASE_URL
2. **Google Voice login fails**: Ensure 2FA is disabled or use app passwords
3. **Scraping fails**: Check if target websites are accessible
4. **AI responses fail**: Verify API keys are correct

### Logs

Check console output for detailed error messages. The application logs:
- Database operations
- AI processing
- SMS bot activities
- Scraping progress

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues or questions:
- Create an issue in the repository
- Contact Memphis 311 at (901)636-6500
- For emergencies, call 911
