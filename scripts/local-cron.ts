/**
 * Cron Job Simulator for Local Development
 * 
 * Usage: npm run cron:local
 * 
 * This script simulates automatic checks in local development.
 * Vercel Cron Job is used in Production.
 */

import fetch from 'node-fetch';

const API_URL = process.env.API_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET || 'change-this-to-a-random-secret-key';
const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes (milliseconds)

async function runCronCheck() {
  try {
    const url = `${API_URL}/api/cron/check`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
      },
    });

    const data = await response.json() as any;
    const timestamp = new Date().toLocaleString();

    if (response.ok) {
      console.log(`[${timestamp}] ✅ Check successful:`);
      console.log(`   - Users checked: ${data.checked || 0}`);
      console.log(`   - Appointments found: ${data.results?.reduce((sum: number, r: any) => sum + (r.found || 0), 0) || 0}`);
    } else {
      console.error(`[${timestamp}] ❌ Error:`, data.error || 'Unknown error');
    }
  } catch (error: any) {
    const timestamp = new Date().toLocaleString();
    console.error(`[${timestamp}] ❌ Connection error:`, error.message);
  }
}

// Perform first check immediately
console.log('🚀 Local Cron Job started');
console.log(`📡 API URL: ${API_URL}`);
console.log(`⏰ Check interval: 5 minutes`);
console.log('---');
runCronCheck();

// Check every 5 minutes
setInterval(() => {
  runCronCheck();
}, CHECK_INTERVAL);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Stopping Cron job...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Stopping Cron job...');
  process.exit(0);
});

