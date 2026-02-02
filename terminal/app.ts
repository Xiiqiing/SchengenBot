import * as readline from 'readline';
import { SchengenService } from '../lib/SchengenService';
import * as dotenv from 'dotenv';

dotenv.config();

const ULKELER = [
  { kod: 'fransa', ad: 'Fransa', bayrak: '🇫🇷' },
  { kod: 'hollanda', ad: 'Hollanda', bayrak: '🇳🇱' },
  { kod: 'almanya', ad: 'Almanya', bayrak: '🇩🇪' },
  { kod: 'ispanya', ad: 'İspanya', bayrak: '🇪🇸' },
  { kod: 'italya', ad: 'İtalya', bayrak: '🇮🇹' },
  { kod: 'isvec', ad: 'İsveç', bayrak: '🇸🇪' },
  { kod: 'cekyarepublik', ad: 'Çekya', bayrak: '🇨🇿' },
  { kod: 'hirvatistan', ad: 'Hırvatistan', bayrak: '🇭🇷' },
  { kod: 'bulgaristan', ad: 'Bulgaristan', bayrak: '🇧🇬' },
  { kod: 'finlandiya', ad: 'Finlandiya', bayrak: '🇫🇮' },
  { kod: 'slovenya', ad: 'Slovenya', bayrak: '🇸🇮' },
  { kod: 'danimarka', ad: 'Danimarka', bayrak: '🇩🇰' },
  { kod: 'norvec', ad: 'Norveç', bayrak: '🇳🇴' },
  { kod: 'estonya', ad: 'Estonya', bayrak: '🇪🇪' },
  { kod: 'litvanya', ad: 'Litvanya', bayrak: '🇱🇹' },
  { kod: 'luksemburg', ad: 'Lüksemburg', bayrak: '🇱🇺' },
  { kod: 'ukrayna', ad: 'Ukrayna', bayrak: '🇺🇦' },
  { kod: 'letonya', ad: 'Letonya', bayrak: '🇱🇻' }
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function soru(prompt: string): Promise<string> {
  return new Promise(resolve => rl.question(prompt, resolve));
}

async function anaMenu() {
  console.clear();
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   🔍 SCHENGEN VİZE RANDEVU KONTROL SİSTEMİ   ║');
  console.log('╚════════════════════════════════════════════════╝\n');
  console.log('⚠️  UYARI: Bu uygulama sadece bilgilendirme amaçlıdır!');
  console.log('    Resmi randevu için resmi kanalları kullanın.\n');
  console.log('1. Tek Ülke Kontrol');
  console.log('2. Toplu Kontrol (Tüm Ülkeler)');
  console.log('3. Ülke Listesi');
  console.log('4. Çıkış\n');

  const secim = await soru('Seçiminiz (1-4): ');

  switch (secim.trim()) {
    case '1':
      await tekUlkeKontrol();
      break;
    case '2':
      await topluKontrol();
      break;
    case '3':
      ulkeListesi();
      break;
    case '4':
      console.log('\n👋 Görüşmek üzere!\n');
      rl.close();
      process.exit(0);
    default:
      console.log('\n❌ Geçersiz seçim!\n');
      await bekle(2000);
      await anaMenu();
  }
}

async function tekUlkeKontrol() {
  console.clear();
  console.log('═══ TEK ÜLKE KONTROL ═══\n');
  
  ULKELER.forEach((ulke, idx) => {
    console.log(`${idx + 1}. ${ulke.bayrak} ${ulke.ad}`);
  });

  const secim = await soru('\nÜlke numarası (0 = Ana Menü): ');
  const idx = parseInt(secim) - 1;

  if (idx === -1) {
    await anaMenu();
    return;
  }

  if (idx < 0 || idx >= ULKELER.length) {
    console.log('\n❌ Geçersiz seçim!\n');
    await bekle(2000);
    await tekUlkeKontrol();
    return;
  }

  const ulke = ULKELER[idx];
  console.log(`\n⏳ ${ulke.ad} kontrol ediliyor...\n`);

  const service = new SchengenService();
  const sonuc = await service.kontrolEt(ulke.kod);

  console.log('═══ SONUÇ ═══');
  console.log(`Ülke: ${ulke.bayrak} ${ulke.ad}`);
  console.log(`Durum: ${getDurumEmoji(sonuc.durum)} ${sonuc.durum.toUpperCase()}`);
  console.log(`Mesaj: ${sonuc.mesaj}`);
  console.log(`URL: ${sonuc.url}`);
  console.log(`Kontrol: ${new Date(sonuc.kontrolTarihi).toLocaleString('tr-TR')}\n`);

  await soru('Devam etmek için Enter\'a basın...');
  await anaMenu();
}

async function topluKontrol() {
  console.clear();
  console.log('═══ TOPLU KONTROL ═══\n');
  console.log(`${ULKELER.length} ülke kontrol edilecek...\n`);

  const service = new SchengenService();
  const sonuclar = [];

  for (let i = 0; i < ULKELER.length; i++) {
    const ulke = ULKELER[i];
    console.log(`[${i + 1}/${ULKELER.length}] ${ulke.bayrak} ${ulke.ad} kontrol ediliyor...`);
    
    const sonuc = await service.kontrolEt(ulke.kod);
    sonuclar.push({ ulke, sonuc });
    
    await bekle(2000);
  }

  console.log('\n═══ SONUÇLAR ═══\n');
  sonuclar.forEach(({ ulke, sonuc }) => {
    console.log(`${ulke.bayrak} ${ulke.ad.padEnd(15)} | ${getDurumEmoji(sonuc.durum)} ${sonuc.durum.toUpperCase().padEnd(12)} | ${sonuc.mesaj}`);
  });

  console.log('\n');
  await soru('Devam etmek için Enter\'a basın...');
  await anaMenu();
}

function ulkeListesi() {
  console.clear();
  console.log('═══ DESTEKLENEN ÜLKELER ═══\n');
  
  ULKELER.forEach((ulke, idx) => {
    console.log(`${(idx + 1).toString().padStart(2)}. ${ulke.bayrak} ${ulke.ad}`);
  });

  console.log(`\nToplam: ${ULKELER.length} ülke\n`);
}

function getDurumEmoji(durum: string): string {
  switch (durum) {
    case 'musait': return '✅';
    case 'dolu': return '❌';
    case 'hata': return '⚠️';
    default: return '❓';
  }
}

function bekle(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Başlat
anaMenu();
