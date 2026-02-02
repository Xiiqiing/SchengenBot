import { SchengenChecker } from 'schengen-randevu-checker';
import type { RandevuKontrolSonuc } from 'schengen-randevu-checker';
import { kayitEkle, bildirimEkle } from './supabase';
import { telegramBildirimGonder, formatTelegramMesaj } from './telegram';

export type KontrolSonuc = RandevuKontrolSonuc;

export class SchengenService {
  private checker: SchengenChecker;

  constructor(sehir: string = 'ankara') {
    this.checker = new SchengenChecker({ 
      sehir,
      rateLimit: 2000 
    });
  }

  async kontrolEt(ulke: string, kaydet: boolean = false): Promise<KontrolSonuc> {
    const sonuc = await this.checker.musaitRandevuKontrol(ulke);

    // Supabase'e kaydet
    if (kaydet) {
      try {
        await kayitEkle({
          ulke: sonuc.ulke,
          durum: sonuc.durum,
          mesaj: sonuc.mesaj,
          url: sonuc.url,
          kontrol_tarihi: sonuc.kontrolTarihi.toISOString()
        });

        // Müsait randevu varsa bildirim oluştur
        if (sonuc.durum === 'musait') {
          await bildirimEkle({
            ulke: sonuc.ulke,
            durum: sonuc.durum,
            mesaj: sonuc.mesaj,
            okundu: false
          });

          // Telegram bildirimi gönder
          const telegramMesaj = formatTelegramMesaj(
            sonuc.ulke,
            sonuc.durum,
            sonuc.mesaj,
            sonuc.url
          );
          await telegramBildirimGonder(telegramMesaj);
        }
      } catch (error) {
        console.error('Kayıt hatası:', error);
      }
    }

    return sonuc;
  }

  async topluKontrol(ulkeler: string[], kaydet: boolean = false): Promise<KontrolSonuc[]> {
    const sonuclar: KontrolSonuc[] = [];

    for (const ulke of ulkeler) {
      const sonuc = await this.kontrolEt(ulke, kaydet);
      sonuclar.push(sonuc);
    }

    return sonuclar;
  }

  getUlkeler(): string[] {
    return this.checker.vizeMerkezleriListele().map(m => m.ulke);
  }

  getVizeMerkezi(ulke: string) {
    return this.checker.vizeMerkeziBilgisi(ulke);
  }

  getSehreGoreMerkezler(sehir: string) {
    return this.checker.sehreGoreVizeMerkezleri(sehir);
  }
}
