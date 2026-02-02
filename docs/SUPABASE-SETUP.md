# 🗄️ Supabase Kurulum Rehberi

Bu rehber, Supabase'i sıfırdan kurmak için adım adım talimatlar içerir. Yazılım bilgisi gerektirmez!

## 📋 İçindekiler

1. [Supabase Hesabı Oluşturma](#1-supabase-hesabı-oluşturma)
2. [Proje Oluşturma](#2-proje-oluşturma)
3. [Veritabanı Kurulumu](#3-veritabanı-kurulumu)
4. [API Anahtarlarını Alma](#4-api-anahtarlarını-alma)
5. [Projeye Bağlama](#5-projeye-bağlama)
6. [Test Etme](#6-test-etme)

---

## 1. Supabase Hesabı Oluşturma

### Adım 1.1: Supabase'e Git
1. Tarayıcınızda https://supabase.com adresine gidin
2. Sağ üstteki **"Start your project"** butonuna tıklayın

### Adım 1.2: Kayıt Ol
Üç seçeneğiniz var:
- **GitHub ile** (Önerilen)
- **Google ile**
- **Email ile**

En kolayı GitHub veya Google ile giriş yapmak.

---

## 2. Proje Oluşturma

### Adım 2.1: Yeni Proje
1. Dashboard'da **"New Project"** butonuna tıklayın
2. Bir **Organization** seçin (yoksa oluşturun)

### Adım 2.2: Proje Bilgileri
Aşağıdaki bilgileri doldurun:

```
Name: schengen-visa-bot
Database Password: [Güçlü bir şifre oluşturun]
Region: Europe West (Frankfurt) - Türkiye'ye en yakın
Pricing Plan: Free (Ücretsiz)
```

**ÖNEMLİ:** Database şifresini bir yere kaydedin!

### Adım 2.3: Proje Oluştur
- **"Create new project"** butonuna tıklayın
- Proje oluşturulması 2-3 dakika sürer
- Bekleyin... ☕

---

## 3. Veritabanı Kurulumu

Proje hazır olduğunda veritabanı tablolarını oluşturacağız.

### Yöntem 1: SQL Editor (Kolay) ⭐ Önerilen

#### Adım 3.1: SQL Editor'ü Aç
1. Sol menüden **"SQL Editor"** seçeneğine tıklayın
2. **"New query"** butonuna tıklayın

#### Adım 3.2: Migration'ı Çalıştır
1. Proje klasöründeki `supabase/migrations/001_initial_schema.sql` dosyasını açın
2. Tüm içeriği kopyalayın (Ctrl+A, Ctrl+C)
3. SQL Editor'e yapıştırın (Ctrl+V)
4. Sağ alttaki **"Run"** butonuna tıklayın (veya Ctrl+Enter)

#### Adım 3.3: Başarı Kontrolü
Aşağıdaki mesajı görmelisiniz:
```
Success. No rows returned
```

### Yöntem 2: Supabase CLI (İleri Seviye)

```bash
# Supabase CLI kur
npm install -g supabase

# Login
supabase login

# Projeye bağlan
supabase link --project-ref your-project-ref

# Migration'ları çalıştır
supabase db push
```

---

## 4. API Anahtarlarını Alma

### Adım 4.1: Settings'e Git
1. Sol menüden **"Project Settings"** (⚙️ ikonu) tıklayın
2. **"API"** sekmesine tıklayın

### Adım 4.2: Anahtarları Kopyala
İki anahtar göreceksiniz:

#### Project URL
```
https://abcdefghijklmnop.supabase.co
```
Bu URL'yi kopyalayın.

#### anon public
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
Bu anahtarı kopyalayın (çok uzun olacak, hepsini kopyalayın).

**ÖNEMLİ:** `service_role` anahtarını KULLANMAYIN! Sadece `anon public` kullanın.

---

## 5. Projeye Bağlama

### Adım 5.1: .env Dosyası Oluştur
Proje klasöründe `.env` dosyası oluşturun:

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

### Adım 5.2: Anahtarları Yapıştır
`.env` dosyasını bir metin editörü ile açın ve şunları yapıştırın:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Telegram Bot (Opsiyonel - sonra ekleyebilirsiniz)
TELEGRAM_BOT_TOKEN=

# Cron Secret (Rastgele bir şifre)
CRON_SECRET=my-super-secret-key-12345
```

**ÖNEMLİ:** Gerçek değerlerinizi yapıştırın!

### Adım 5.3: Kaydet
Dosyayı kaydedin (Ctrl+S veya Cmd+S).

---

## 6. Test Etme

### Adım 6.1: Uygulamayı Başlat
Terminal'de:

```bash
npm run dev
```

### Adım 6.2: Tarayıcıda Aç
http://localhost:3000 adresine gidin

### Adım 6.3: Dashboard'a Git
1. Ana sayfada **"Hemen Başla"** butonuna tıklayın
2. Dashboard açılmalı
3. Hata yoksa ✅ Supabase bağlantısı başarılı!

### Adım 6.4: Ayarları Test Et
1. **"Ayarlar"** sayfasına gidin
2. Bir ülke ve şehir seçin
3. **"Ayarları Kaydet"** butonuna tıklayın
4. Başarılı mesajı görürseniz ✅ Veritabanı çalışıyor!

---

## 🎉 Tebrikler!

Supabase kurulumu tamamlandı! Artık:
- ✅ Veritabanı çalışıyor
- ✅ Tablolar oluşturuldu
- ✅ Uygulama bağlandı

---

## 🔧 Sorun Giderme

### Hata: "Invalid API key"
**Çözüm:** 
- `.env` dosyasındaki anahtarları kontrol edin
- Boşluk veya satır sonu olmamalı
- Tüm anahtarı kopyaladığınızdan emin olun

### Hata: "Table does not exist"
**Çözüm:**
- SQL Editor'de migration'ı tekrar çalıştırın
- Tüm SQL kodunu kopyaladığınızdan emin olun

### Hata: "Connection refused"
**Çözüm:**
- Supabase projesinin aktif olduğunu kontrol edin
- Project URL'nin doğru olduğunu kontrol edin
- İnternet bağlantınızı kontrol edin

### Hata: "Row Level Security"
**Çözüm:**
- Migration dosyası RLS policy'lerini otomatik oluşturur
- Sorun devam ederse SQL Editor'de şunu çalıştırın:
```sql
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON user_profiles FOR ALL USING (true);
```

---

## 📚 Ek Kaynaklar

- [Supabase Dokümantasyonu](https://supabase.com/docs)
- [Supabase Dashboard](https://app.supabase.com)
- [SQL Editor Kullanımı](https://supabase.com/docs/guides/database/overview)
- [Proje GitHub](https://github.com/ibidi/schengen-visa-appointment-bot)

---

## 💡 İpuçları

1. **Ücretsiz Plan Limitleri:**
   - 500 MB veritabanı
   - 2 GB dosya depolama
   - 50,000 aylık aktif kullanıcı
   - Bu proje için yeterli!

2. **Yedekleme:**
   - Supabase otomatik yedekleme yapar
   - Dashboard > Database > Backups'tan kontrol edebilirsiniz

3. **Monitoring:**
   - Dashboard > Database > Logs'tan sorguları görebilirsiniz
   - Hata ayıklama için kullanışlı

4. **Güvenlik:**
   - `.env` dosyasını asla GitHub'a yüklemeyin
   - `.gitignore` dosyasında zaten var
   - Anahtarlarınızı kimseyle paylaşmayın

---

**Yardıma mı ihtiyacınız var?**
- GitHub Issues: https://github.com/ibidi/schengen-visa-appointment-bot/issues
- Email: info@ihsanbakidogan.com
