import axios from 'axios';
import * as cheerio from 'cheerio';
import { db, initializeDatabase } from '../lib/db.js';
import { getEmbedding } from '../lib/ai.js';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local first, then .env
config({ path: path.join(__dirname, '..', '.env.local') });
config({ path: path.join(__dirname, '..', '.env') });


// URLs to scrape
const TARGET_URLS = [
  'https://team211.communityos.org/linc211memphis',
  'https://memphistn.gov/call-311/'
];

// Additional Memphis 211/311 related URLs to scrape
const ADDITIONAL_URLS = [
  'https://memphistn.gov/government/',
  'https://memphistn.gov/residents/',
  'https://memphistn.gov/business/',
  'https://memphistn.gov/updates/',
  'https://memphistn.gov/government/solid-waste/',
  'https://memphistn.gov/government/public-works/',
  'https://memphistn.gov/government/parks/',
  'https://memphistn.gov/government/animal-services/',
  'https://memphistn.gov/government/fire/',
  'https://memphistn.gov/government/police/'
];

/**
 * Clean and normalize text content
 * @param {string} text - Raw text content
 * @returns {string} - Cleaned text
 */
function cleanText(text) {
  return text
    .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim()
    .substring(0, 10000); // Limit to 10k characters
}

/**
 * Extract meaningful content from HTML
 * @param {string} html - HTML content
 * @returns {Object} - Extracted content with title and text
 */
function extractContent(html) {
  const $ = cheerio.load(html);
  
  // Remove script and style elements
  $('script, style, nav, footer, header').remove();
  
  // Extract title
  let title = $('title').text() || $('h1').first().text() || 'Untitled';
  title = cleanText(title);
  
  // Extract main content
  const contentSelectors = [
    'main',
    'article',
    '.content',
    '.main-content',
    '#content',
    'body'
  ];
  
  let content = '';
  for (const selector of contentSelectors) {
    const element = $(selector);
    if (element.length > 0) {
      content = element.text();
      break;
    }
  }
  
  // If no main content found, get all text
  if (!content) {
    content = $('body').text();
  }
  
  content = cleanText(content);
  
  // Extract links for additional context
  const links = [];
  $('a[href]').each((i, el) => {
    const href = $(el).attr('href');
    const text = $(el).text().trim();
    if (href && text && href.startsWith('http')) {
      links.push({ url: href, text: text });
    }
  });
  
  return {
    title,
    content,
    links
  };
}

/**
 * Scrape a single URL
 * @param {string} url - URL to scrape
 * @returns {Object|null} - Scraped content or null if failed
 */
async function scrapeUrl(url) {
  try {
    console.log(`Scraping: ${url}`);
    
    const response = await axios.get(url, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Memphis-211-311-Bot/1.0)'
      }
    });
    
    const { title, content, links } = extractContent(response.data);
    
    if (!content || content.length < 100) {
      console.log(`Skipping ${url}: insufficient content`);
      return null;
    }
    
    return {
      url,
      title,
      content,
      links,
      scrapedAt: new Date()
    };
    
  } catch (error) {
    console.error(`Error scraping ${url}:`, error.message);
    return null;
  }
}

/**
 * Process and store scraped content
 * @param {Object} pageData - Scraped page data
 */
async function processPage(pageData) {
  try {
    const { url, title, content } = pageData;
    
    // Check if page already exists and is recent
    const existingPage = await db.getPageByUrl(url);
    if (existingPage) {
      const lastUpdated = new Date(existingPage.last_updated);
      const now = new Date();
      const hoursSinceUpdate = (now - lastUpdated) / (1000 * 60 * 60);
      
      // Skip if updated within last 24 hours
      if (hoursSinceUpdate < 24) {
        console.log(`Skipping ${url}: recently updated`);
        return;
      }
    }
    
    // Generate embedding for semantic search
    console.log(`Generating embedding for: ${title}`);
    const embedding = await getEmbedding(content);
    
    // Store in database
    await db.insertPage(url, title, content, embedding);
    console.log(`Stored: ${title}`);
    
  } catch (error) {
    console.error(`Error processing page ${pageData.url}:`, error.message);
  }
}

/**
 * Scrape all target URLs
 */
async function scrapeAllPages() {
  try {
    console.log('Starting web scraping...');
    
    // Initialize database
    await initializeDatabase();
    
    // Scrape main target URLs
    for (const url of TARGET_URLS) {
      const pageData = await scrapeUrl(url);
      if (pageData) {
        await processPage(pageData);
      }
    }
    
    // Scrape additional URLs
    for (const url of ADDITIONAL_URLS) {
      const pageData = await scrapeUrl(url);
      if (pageData) {
        await processPage(pageData);
      }
      
      // Add delay to be respectful
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('Web scraping completed successfully');
    
  } catch (error) {
    console.error('Scraping error:', error);
  }
}

/**
 * Update embeddings for existing pages
 */
async function updateEmbeddings() {
  try {
    console.log('Updating embeddings...');
    
    const pages = await db.getAllPages();
    
    for (const page of pages) {
      try {
        console.log(`Updating embedding for: ${page.title}`);
        const embedding = await getEmbedding(page.content);
        await db.insertPage(page.url, page.title, page.content, embedding);
      } catch (error) {
        console.error(`Error updating embedding for ${page.url}:`, error.message);
      }
    }
    
    console.log('Embeddings updated successfully');
    
  } catch (error) {
    console.error('Embedding update error:', error);
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  if (command === 'update-embeddings') {
    updateEmbeddings().then(() => process.exit(0));
  } else {
    scrapeAllPages().then(() => process.exit(0));
  }
}

export {
  scrapeUrl,
  scrapeAllPages,
  updateEmbeddings,
  extractContent,
  cleanText
};
