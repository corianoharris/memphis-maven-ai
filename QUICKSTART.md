# Quick Start Guide

Get the Memphis 211/311 AI Assistant running in 5 minutes!

## Prerequisites

Before you start, make sure you have:
- Node.js 18+ installed
- A PostgreSQL database (use [Neon](https://neon.tech) for free)
- A Google account for SMS bot
- [Ollama](https://ollama.ai) installed for AI models

## 1. Get Required Services

### PostgreSQL Database
1. Go to [Neon.tech](https://neon.tech)
2. Create a free account
3. Create a new project
4. Copy the connection string (starts with `postgres://`)

### Ollama (Self-hosted AI)
1. Install Ollama: `curl -fsSL https://ollama.ai/install.sh | sh`
2. Start Ollama: `ollama serve`
3. Install models: `ollama pull llama2`
4. Required: `ollama pull nomic-embed-text` (for embeddings)

## 2. Setup the Application

```bash
# Clone and install
git clone <your-repo-url>
cd memphis-211-311-ai-assistant
npm install

# Run setup script
npm run setup
```

The setup script will:
- Create `.env` file
- Test database connection
- Test AI services
- Run initial web scraping

## 3. Configure Environment

Edit the `.env` file with your credentials:

```env
DATABASE_URL=postgres://your-neon-connection-string
GOOGLE_EMAIL=your-email@gmail.com
GOOGLE_PASSWORD=your-google-password
OLLAMA_BASE_URL=http://localhost:11434
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 4. Test the Application

### Web Interface
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### SMS Bot (Optional)
```bash
npm run sms-bot
```
This opens a browser window for Google Voice login.

### Automated Updates
```bash
npm run scheduler
```
This runs background tasks for content updates.

## 5. Test Multilingual Support

Try these test messages in the web interface:

**English:**
- "How do I report a pothole?"
- "What are the garbage collection days?"

**Spanish:**
- "¿Cómo reporto un bache?"
- "¿Cuáles son los días de recolección de basura?"

**Arabic:**
- "كيف أبلغ عن حفرة في الطريق؟"
- "ما هي أيام جمع القمامة؟"

## Troubleshooting

### Database Issues
```bash
# Test database connection
node scripts/setup.js --test-only
```

### Scraping Issues
```bash
# Run scraping manually
npm run scrape
```

### AI Issues
Check your API keys in `.env` file and ensure you have credits.

## Next Steps

1. **Customize URLs**: Edit `scripts/scrapePages.js` to add more Memphis websites
2. **Deploy**: Use Vercel for easy deployment
3. **Monitor**: Check logs for any issues
4. **Scale**: Add more AI models or features

## Support

- Check the main [README.md](README.md) for detailed documentation
- For Memphis-specific questions, call 311 at (901)636-6500
- For emergencies, call 911

---

**Need help?** The setup script will guide you through any issues!
