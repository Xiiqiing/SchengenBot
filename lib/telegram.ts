import axios from 'axios';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function telegramBildirimGonder(mesaj: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('Telegram ayarları yapılmamış');
    return;
  }

  try {
    await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: TELEGRAM_CHAT_ID,
        text: mesaj,
        parse_mode: 'HTML'
      }
    );
  } catch (error) {
    console.error('Telegram bildirimi gönderilemedi:', error);
  }
}

export function formatTelegramMesaj(ulke: string, durum: string, mesaj: string, url: string) {
  const emoji = durum === 'musait' ? '✅' : durum === 'dolu' ? '❌' : '⚠️';
  
  return `
${emoji} <b>Schengen Randevu Kontrol</b>

🌍 <b>Ülke:</b> ${ulke.toUpperCase()}
📊 <b>Durum:</b> ${durum.toUpperCase()}
💬 <b>Mesaj:</b> ${mesaj}

🔗 <a href="${url}">Resmi Siteye Git</a>

⏰ ${new Date().toLocaleString('tr-TR')}
  `.trim();
}
