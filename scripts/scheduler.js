import cron from 'node-cron';
import { scrapeAllPages, updateEmbeddings } from './scrapePages.js';
import { initializeDatabase } from '../lib/db.js';
import { config } from 'dotenv';
config();

class Scheduler {
  constructor() {
    this.isRunning = false;
    this.jobs = new Map();
  }

  /**
   * Initialize the scheduler
   */
  async initialize() {
    try {
      console.log('Initializing scheduler...');
      
      // Initialize database
      await initializeDatabase();
      
      // Run initial scraping
      console.log('Running initial web scraping...');
      await scrapeAllPages();
      
      console.log('Scheduler initialized successfully');
      
    } catch (error) {
      console.error('Error initializing scheduler:', error);
      throw error;
    }
  }

  /**
   * Schedule daily web scraping at 2 AM
   */
  scheduleDailyScraping() {
    const job = cron.schedule('0 2 * * *', async () => {
      try {
        console.log('Starting scheduled web scraping...');
        await scrapeAllPages();
        console.log('Scheduled web scraping completed');
      } catch (error) {
        console.error('Error in scheduled scraping:', error);
      }
    }, {
      scheduled: false,
      timezone: 'America/Chicago' // Memphis timezone
    });

    this.jobs.set('dailyScraping', job);
    console.log('Daily scraping scheduled for 2:00 AM CT');
  }

  /**
   * Schedule embedding updates every 6 hours
   */
  scheduleEmbeddingUpdates() {
    const job = cron.schedule('0 */6 * * *', async () => {
      try {
        console.log('Starting scheduled embedding updates...');
        await updateEmbeddings();
        console.log('Scheduled embedding updates completed');
      } catch (error) {
        console.error('Error in scheduled embedding updates:', error);
      }
    }, {
      scheduled: false,
      timezone: 'America/Chicago'
    });

    this.jobs.set('embeddingUpdates', job);
    console.log('Embedding updates scheduled every 6 hours');
  }

  /**
   * Schedule health check every hour
   */
  scheduleHealthCheck() {
    const job = cron.schedule('0 * * * *', async () => {
      try {
        console.log('Performing health check...');
        
        // Check database connection
        const { db } = require('../lib/db');
        const pages = await db.getAllPages();
        console.log(`Health check: ${pages.length} pages in database`);
        
        // Check if we have recent data
        const recentPages = pages.filter(page => {
          const lastUpdated = new Date(page.last_updated);
          const now = new Date();
          const hoursSinceUpdate = (now - lastUpdated) / (1000 * 60 * 60);
          return hoursSinceUpdate < 48; // Less than 48 hours old
        });
        
        if (recentPages.length === 0) {
          console.warn('Warning: No recent pages found, triggering emergency scraping');
          await scrapeAllPages();
        }
        
        console.log('Health check completed');
        
      } catch (error) {
        console.error('Error in health check:', error);
      }
    }, {
      scheduled: false,
      timezone: 'America/Chicago'
    });

    this.jobs.set('healthCheck', job);
    console.log('Health check scheduled every hour');
  }

  /**
   * Start all scheduled jobs
   */
  start() {
    if (this.isRunning) {
      console.log('Scheduler is already running');
      return;
    }

    console.log('Starting scheduler...');
    
    // Schedule all jobs
    this.scheduleDailyScraping();
    this.scheduleEmbeddingUpdates();
    this.scheduleHealthCheck();
    
    // Start all jobs
    for (const [name, job] of this.jobs) {
      job.start();
      console.log(`Started job: ${name}`);
    }
    
    this.isRunning = true;
    console.log('All scheduled jobs started');
  }

  /**
   * Stop all scheduled jobs
   */
  stop() {
    if (!this.isRunning) {
      console.log('Scheduler is not running');
      return;
    }

    console.log('Stopping scheduler...');
    
    for (const [name, job] of this.jobs) {
      job.stop();
      console.log(`Stopped job: ${name}`);
    }
    
    this.isRunning = false;
    console.log('All scheduled jobs stopped');
  }

  /**
   * Get status of all jobs
   */
  getStatus() {
    const status = {
      isRunning: this.isRunning,
      jobs: {}
    };
    
    for (const [name, job] of this.jobs) {
      status.jobs[name] = {
        running: job.running,
        nextDate: job.nextDate(),
        lastDate: job.lastDate()
      };
    }
    
    return status;
  }

  /**
   * Run a specific job manually
   */
  async runJob(jobName) {
    switch (jobName) {
      case 'scraping':
        console.log('Running manual scraping...');
        await scrapeAllPages();
        console.log('Manual scraping completed');
        break;
        
      case 'embeddings':
        console.log('Running manual embedding updates...');
        await updateEmbeddings();
        console.log('Manual embedding updates completed');
        break;
        
      default:
        console.error(`Unknown job: ${jobName}`);
        break;
    }
  }
}

// Main execution
async function main() {
  const scheduler = new Scheduler();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down scheduler...');
    scheduler.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down scheduler...');
    scheduler.stop();
    process.exit(0);
  });
  
  try {
    // Initialize scheduler
    await scheduler.initialize();
    
    // Check for command line arguments
    const args = process.argv.slice(2);
    
    if (args.length > 0) {
      const command = args[0];
      
      switch (command) {
        case 'start':
          scheduler.start();
          // Keep the process running
          setInterval(() => {}, 1000);
          break;
          
        case 'scrape':
          await scheduler.runJob('scraping');
          break;
          
        case 'embeddings':
          await scheduler.runJob('embeddings');
          break;
          
        case 'status':
          console.log('Scheduler status:', JSON.stringify(scheduler.getStatus(), null, 2));
          break;
          
        default:
          console.log('Usage: node scheduler.js [start|scrape|embeddings|status]');
          break;
      }
    } else {
      // Default: start the scheduler
      scheduler.start();
      // Keep the process running
      setInterval(() => {}, 1000);
    }
    
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default Scheduler;
