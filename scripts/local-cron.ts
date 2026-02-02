/**
 * Local Development için Cron Job Simülatörü
 * 
 * Kullanım: npm run cron:local
 * 
 * Bu script, local development'ta otomatik kontrolü simüle eder.
 * Production'da Vercel Cron Job kullanılır.
 */

import fetch from 'node-fetch';

const API_URL = process.env.API_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET || 'change-this-to-a-random-secret-key';
const CHECK_INTERVAL = 5 * 60 * 1000; // 5 dakika (milisaniye)

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
    const timestamp = new Date().toLocaleString('tr-TR');

    if (response.ok) {
      console.log(`[${timestamp}] ✅ Kontrol başarılı:`);
      console.log(`   - Kontrol edilen kullanıcı: ${data.checked || 0}`);
      console.log(`   - Bulunan randevu: ${data.results?.reduce((sum: number, r: any) => sum + (r.found || 0), 0) || 0}`);
    } else {
      console.error(`[${timestamp}] ❌ Hata:`, data.error || 'Bilinmeyen hata');
    }
  } catch (error: any) {
    const timestamp = new Date().toLocaleString('tr-TR');
    console.error(`[${timestamp}] ❌ Bağlantı hatası:`, error.message);
  }
}

// İlk kontrolü hemen yap
console.log('🚀 Local Cron Job başlatıldı');
console.log(`📡 API URL: ${API_URL}`);
console.log(`⏰ Kontrol sıklığı: 5 dakika`);
console.log('---');
runCronCheck();

// Her 5 dakikada bir kontrol et
setInterval(() => {
  runCronCheck();
}, CHECK_INTERVAL);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Cron job durduruluyor...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Cron job durduruluyor...');
  process.exit(0);
});

