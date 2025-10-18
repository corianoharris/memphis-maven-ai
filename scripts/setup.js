#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local first, then .env
config({ path: path.join(__dirname, '..', '.env.local') });
config({ path: path.join(__dirname, '..', '.env') });

console.log('🚀 Memphis 211/311 AI Assistant Setup');
console.log('=====================================\n');

/**
 * Check if a file exists
 */
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * Create .env file from template
 */
function createEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), 'env.example');
  
  if (fileExists(envPath)) {
    console.log('✅ .env file already exists');
    return;
  }
  
  if (!fileExists(envExamplePath)) {
    console.error('❌ env.example file not found');
    return;
  }
  
  try {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file from template');
    console.log('⚠️  Please edit .env file with your actual credentials');
  } catch (error) {
    console.error('❌ Error creating .env file:', error.message);
  }
}

/**
 * Check if required environment variables are set
 */
function checkEnvVariables() {
  const requiredVars = [
    'DATABASE_URL',
    'GOOGLE_EMAIL',
    'GOOGLE_PASSWORD'
  ];
  
  const missingVars = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName] || process.env[varName].includes('your-')) {
      missingVars.push(varName);
    }
  }
  
  if (missingVars.length > 0) {
    console.log('⚠️  Missing or incomplete environment variables:');
    missingVars.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    console.log('\nPlease update your .env file with actual values');
    return false;
  }
  
  console.log('✅ All required environment variables are set');
  return true;
}

/**
 * Test database connection
 */
async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    const { initializeDatabase } = await import('../lib/db.js');
    await initializeDatabase();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('Please check your DATABASE_URL in .env file');
    return false;
  }
}

/**
 * Test Ollama connection
 */
async function testOllamaConnection() {
  try {
    console.log('🔍 Testing Ollama connection...');
    const axios = (await import('axios')).default;
    const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    
    // Test if Ollama is running
    const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`);
    console.log('✅ Ollama is running');
    
    // Check if we have the required models
    const models = response.data.models || [];
    const hasLlama = models.some(model => model.name.includes('llama'));
    const hasEmbedding = models.some(model => model.name.includes('embed'));
    
    if (!hasLlama) {
      console.log('⚠️  Warning: No Llama model found. Please run: ollama pull llama2');
    }
    
    if (!hasEmbedding) {
      console.log('⚠️  Warning: No embedding model found. Will use fallback embedding generation.');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Ollama connection failed:', error.message);
    console.log('Please make sure Ollama is running: ollama serve');
    console.log('And install a model: ollama pull llama2');
    return false;
  }
}

/**
 * Run initial web scraping
 */
async function runInitialScraping() {
  try {
    console.log('🕷️  Running initial web scraping...');
    const { scrapeAllPages } = await import('./scrapePages.js');
    await scrapeAllPages();
    console.log('✅ Initial scraping completed');
    return true;
  } catch (error) {
    console.error('❌ Initial scraping failed:', error.message);
    return false;
  }
}

/**
 * Install dependencies
 */
function installDependencies() {
  try {
    console.log('📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed');
    return true;
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    return false;
  }
}

/**
 * Main setup function
 */
async function setup() {
  console.log('Starting setup process...\n');
  
  // Step 1: Create .env file
  console.log('1. Setting up environment variables...');
  createEnvFile();
  console.log();
  
  // Step 2: Install dependencies
  console.log('2. Installing dependencies...');
  if (!installDependencies()) {
    console.log('❌ Setup failed at dependency installation');
    return;
  }
  console.log();
  
  // Step 3: Check environment variables
  console.log('3. Checking environment variables...');
  if (!checkEnvVariables()) {
    console.log('\n⚠️  Please update your .env file and run setup again');
    return;
  }
  console.log();
  
  // Step 4: Test database connection
  console.log('4. Testing database connection...');
  if (!(await testDatabaseConnection())) {
    console.log('\n❌ Setup failed at database connection');
    return;
  }
  console.log();
  
  // Step 5: Test Ollama connection
  console.log('5. Testing Ollama connection...');
  if (!(await testOllamaConnection())) {
    console.log('\n❌ Setup failed at Ollama connection test');
    return;
  }
  console.log();
  
  // Step 6: Run initial scraping
  console.log('6. Running initial web scraping...');
  if (!(await runInitialScraping())) {
    console.log('\n⚠️  Initial scraping failed, but you can run it manually later');
  }
  console.log();
  
  // Setup complete
  console.log('🎉 Setup completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Start the development server: npm run dev');
  console.log('2. Open http://localhost:3000 to test the web interface');
  console.log('3. Run the SMS bot: npm run sms-bot');
  console.log('4. Start the scheduler: npm run scheduler');
  console.log('\nFor more information, see README.md');
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log('Memphis 211/311 AI Assistant Setup');
  console.log('\nUsage: node scripts/setup.js [options]');
  console.log('\nOptions:');
  console.log('  --help, -h    Show this help message');
  console.log('  --env-only    Only create .env file');
  console.log('  --test-only   Only run tests (no scraping)');
  console.log('\nThis script will:');
  console.log('1. Create .env file from template');
  console.log('2. Install dependencies');
  console.log('3. Test database connection');
  console.log('4. Test AI services');
  console.log('5. Run initial web scraping');
  process.exit(0);
}

if (args.includes('--env-only')) {
  createEnvFile();
  process.exit(0);
}

if (args.includes('--test-only')) {
  console.log('Running tests only...\n');
  checkEnvVariables();
  testDatabaseConnection();
  testAIServices();
  process.exit(0);
}

// Run full setup
setup().catch(error => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});
