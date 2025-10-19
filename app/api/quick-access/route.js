import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Scrape Quick Access information from Memphis 211/311 services
 * @returns {Object} - Current service status and wait times
 */
async function scrapeQuickAccessInfo() {
  const quickAccessData = {
    services: {
      '211': {
        name: 'Community Services',
        status: 'available',
        waitTime: 'Call for current wait time',
        phone: '211',
        lastUpdated: new Date().toISOString()
      },
      '311': {
        name: 'City Services', 
        status: 'available',
        waitTime: 'Call for current wait time',
        phone: '901-636-6500',
        lastUpdated: new Date().toISOString()
      },
      '911': {
        name: 'Emergency',
        status: 'available',
        waitTime: 'Immediate',
        phone: '911',
        lastUpdated: new Date().toISOString()
      }
    }
  };

  try {
    // Scrape Memphis 311 status page
    const memphis311Response = await axios.get('https://memphistn.gov/call-311/', {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Memphis-211-311-Bot/1.0)'
      }
    });

    const $311 = cheerio.load(memphis311Response.data);
    
    // Look for current wait time information
    const waitTimeText = $311('body').text();
    
    // Extract wait time information if available
    if (waitTimeText.includes('wait time') || waitTimeText.includes('hold time')) {
      // Try to extract specific wait time information
      const waitTimeMatch = waitTimeText.match(/(\d+)\s*(minutes?|mins?|hours?|hrs?)/i);
      if (waitTimeMatch) {
        quickAccessData.services['311'].waitTime = `${waitTimeMatch[1]} ${waitTimeMatch[2]}`;
      }
    }

    // Check for service status indicators
    if (waitTimeText.toLowerCase().includes('currently experiencing high call volume')) {
      quickAccessData.services['311'].status = 'busy';
    }

  } catch (error) {
    console.log('Could not scrape 311 status:', error.message);
  }

  try {
    // Scrape Memphis 211 status page
    const memphis211Response = await axios.get('https://team211.communityos.org/linc211memphis', {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Memphis-211-311-Bot/1.0)'
      }
    });

    const $211 = cheerio.load(memphis211Response.data);
    
    // Look for 211 service status
    const serviceText = $211('body').text();
    
    // Check for service hours or status
    if (serviceText.includes('24/7') || serviceText.includes('24 hours')) {
      quickAccessData.services['211'].status = 'available';
    }

    if (serviceText.includes('closed') || serviceText.includes('unavailable')) {
      quickAccessData.services['211'].status = 'unavailable';
    }

  } catch (error) {
    console.log('Could not scrape 211 status:', error.message);
  }

  return quickAccessData;
}

/**
 * GET /api/quick-access
 * Get current Quick Access service information
 */
export async function GET() {
  try {
    const quickAccessInfo = await scrapeQuickAccessInfo();
    
    return NextResponse.json({
      success: true,
      data: quickAccessInfo,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Quick Access API error:', error);
    
    // Return fallback data if scraping fails
    return NextResponse.json({
      success: false,
      data: {
        services: {
          '211': {
            name: 'Community Services',
            status: 'available',
            waitTime: 'Call for current wait time',
            phone: '211'
          },
          '311': {
            name: 'City Services',
            status: 'available', 
            waitTime: 'Call for current wait time',
            phone: '901-636-6500'
          },
          '911': {
            name: 'Emergency',
            status: 'available',
            waitTime: 'Immediate',
            phone: '911'
          }
        }
      },
      timestamp: new Date().toISOString(),
      error: 'Scraping failed, using fallback data'
    });
  }
}
