import { Pool } from 'pg';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local first, then .env
config({ path: path.join(__dirname, '..', '.env.local') });
config({ path: path.join(__dirname, '..', '.env') });

/**
 * Calculate cosine similarity between two vectors
 * @param {Array} a - First vector
 * @param {Array} b - Second vector
 * @returns {number} - Cosine similarity score
 */
function cosineSimilarity(a, b) {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

// Database schema initialization
async function initializeDatabase() {
  try {
    // Create pages table with vector support
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pages (
        id SERIAL PRIMARY KEY,
        url TEXT UNIQUE NOT NULL,
        title TEXT,
        content TEXT,
        embedding FLOAT8[],
        last_updated TIMESTAMP DEFAULT now()
      )
    `);

    // Create conversations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        channel TEXT DEFAULT 'sms',
        created_at TIMESTAMP DEFAULT now()
      )
    `);

    // Create messages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
        role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT now()
      )
    `);

    // Create regular indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_pages_url ON pages(url)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_pages_last_updated ON pages(last_updated)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at)
    `);

    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Database query helper functions
const db = {
  // Pages operations
  async insertPage(url, title, content, embedding = null) {
    const query = `
      INSERT INTO pages (url, title, content, embedding, last_updated)
      VALUES ($1, $2, $3, $4, now())
      ON CONFLICT (url) 
      DO UPDATE SET 
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        embedding = EXCLUDED.embedding,
        last_updated = now()
      RETURNING id
    `;
    const result = await pool.query(query, [url, title, content, embedding]);
    return result.rows[0].id;
  },

  async getPageByUrl(url) {
    const query = 'SELECT * FROM pages WHERE url = $1';
    const result = await pool.query(query, [url]);
    return result.rows[0];
  },

  async getAllPages() {
    const query = 'SELECT * FROM pages ORDER BY last_updated DESC';
    const result = await pool.query(query);
    return result.rows;
  },

  async searchSimilarPages(embedding, limit = 5) {
    // Get all pages with embeddings and calculate similarity in JavaScript
    const query = `
      SELECT url, title, content, embedding
      FROM pages 
      WHERE embedding IS NOT NULL
    `;
    const result = await pool.query(query);
    
    // Calculate cosine similarity for each page
    const pagesWithSimilarity = result.rows.map(page => {
      const similarity = cosineSimilarity(embedding, page.embedding);
      return {
        url: page.url,
        title: page.title,
        content: page.content,
        similarity: similarity
      };
    });
    
    // Sort by similarity and return top results
    return pagesWithSimilarity
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  },

  // Conversation operations
  async createConversation(userId, channel = 'sms') {
    const query = `
      INSERT INTO conversations (user_id, channel)
      VALUES ($1, $2)
      RETURNING id
    `;
    const result = await pool.query(query, [userId, channel]);
    return result.rows[0].id;
  },

  async getConversation(conversationId) {
    const query = 'SELECT * FROM conversations WHERE id = $1';
    const result = await pool.query(query, [conversationId]);
    return result.rows[0];
  },

  async getConversationByUser(userId, channel = 'sms') {
    const query = `
      SELECT * FROM conversations 
      WHERE user_id = $1 AND channel = $2 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    const result = await pool.query(query, [userId, channel]);
    return result.rows[0];
  },

  // Message operations
  async addMessage(conversationId, role, text) {
    const query = `
      INSERT INTO messages (conversation_id, role, text)
      VALUES ($1, $2, $3)
      RETURNING id
    `;
    const result = await pool.query(query, [conversationId, role, text]);
    return result.rows[0].id;
  },

  async getMessages(conversationId, limit = 50) {
    const query = `
      SELECT * FROM messages 
      WHERE conversation_id = $1 
      ORDER BY created_at ASC 
      LIMIT $2
    `;
    const result = await pool.query(query, [conversationId, limit]);
    return result.rows;
  },

  async getRecentMessages(conversationId, limit = 10) {
    const query = `
      SELECT * FROM messages 
      WHERE conversation_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `;
    const result = await pool.query(query, [conversationId, limit]);
    return result.rows.reverse();
  }
};

export {
  pool,
  db,
  initializeDatabase
};
