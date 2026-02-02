# 🤖 Schengen Visa Appointment Bot

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green)](https://supabase.com/)

Gerçek zamanlı Schengen vize randevu bildirim botu. 17 ülke için otomatik randevu takibi, Telegram bildirimleri ve modern web dashboard.

## ✨ Özellikler

### 🎯 Temel Özellikler
- **17 Schengen Ülkesi** - Fransa, Hollanda, Almanya, İspanya, İtalya ve daha fazlası
- **7 Şehir Desteği** - Ankara, İstanbul, İzmir, Gaziantep, Edirne, Antalya, Bursa
- **Gerçek Zamanlı API** - https://api.schengenvisaappointments.com entegrasyonu
- **Otomatik Kontrol** - Vercel Cron ile 5 dakikada bir otomatik kontrol
- **Telegram Bildirimleri** - Müsait randevu bulunduğunda anında bildirim
- **Modern Dashboard** - Next.js 15 + React 19 + shadcn/ui

### 🚀 Teknolojiler
- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes, Supabase PostgreSQL
- **Bildirimler:** Telegram Bot API
- **Deployment:** Vercel (önerilen)

## 📸 Ekran Görüntüleri

### Landing Page
Modern, responsive landing page ile kullanıcıları karşılayın.

### Dashboard
Gerçek zamanlı istatistikler, manuel kontrol ve randevu geçmişi.

### Settings
Ülke/şehir seçimi, Telegram ayarları ve otomatik kontrol yapılandırması.

## 🚀 Hızlı Başlangıç

# Letonya |ksinimler
- Node.js 18.0.0+
- npm 9.0.0+
- Supabase hesabı (ücretsiz)
- Telegram Bot (opsiyonel)

### 2. Kurulum

```bash
# Projeyi klonla
git clone https://github.com/ibidi/schengen-visa-appointment-bot.git
cd schengen-visa-appointment-bot

# Bağımlılıkları yükle
npm install

# Environment variables
cp .env.example .env
# .env dosyasını düzenle
```

### 3. Supabase Kurulumu

1. https://supabase.com'da proje oluştur
2. SQL Editor'de `supabase-schemsyasını çalıştır
3. Project Settings > API'den URL ve Anon Key'i kopyala
4. `.env` dosyasına ekle

### 4. Telegram Bot (Opsiyonel)

```bash
# 1. @BotFather ile bot oluştur
# 2. Token'ı al
# 3. .env dosyasına ekle
TELEGRAMosyT_TOKEN=your_token_here
```

### 5. Çalıştır

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

Tarayıcıda aç: **http://localhost:3000**

## 📁 Proje Yapısı

```
schengen-visa-appointment-bot/
├── app/
│   ├── api/                    # API Routes
│   │   ├── appointments/       # Randevu API
│   │   ├── preferences/        # Kullanıcı tercihleri
│   │   ├── telegram/           # Telegram bot
│   │   ├── cron/              # Otomatik kontrol
│   │   └── stats/             # İstatistikler
│   ├── dashboard/             # Dashboard sayfaları
│   │   ├── page.tsx          # Ana dashboard
│   │   ├── settings/         # Ayarlar
│   │   └── history/          # Geçmiş
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── lib/
│   ├── api/
│   │   └── schengen-api.ts   # Harici API client
│   ├── services/
│   │   ├── appointment-service.ts
│   │   └── notification-service.ts
│   ├── supabase/
│   │   ├── client.ts         # CRUD fonksiyonları
│   │   └── types.ts          # TypeScript tipleri
│  constants/
│   │   └── countries.ts      # Ülke/şehir sabitleri
│   └── utils.ts              # Yardımcı fonksiyonlar
├── components/
│   └── ui/                   # shadcn/ui componentleri
├── supabase-schema.sql       # Veritabanı şeması
├── vercel.json              # Vercel Cron config
└── package.json
```

## 🗄️ Veritabanı Şeması

### Tablolar
- `user_profiles` - Kullanıcı profilleri
- `user_preferences` - Kullanıcı tercihleri (ülkeler, şehirler, bildirimler)
- `appointments` - Bulunan randevular
- `notification_history` - Bildirim geçmişi
- `check_history` - Kontrol geçmişi

### Views
- `user_stats` - Kullanıcı istatistikleri

## 🔧 API Endpoints

### Appointments
- `POST /api/appointments/check` - Manuel kontrol
- `GET /api/appointments` - Randevu listesi

### Preferences
- `GET /api/preferences` - Tercihleri getir
- `POST /api/preferences` - Tercihleri güncelle

### Telegram
- `POST /api/telegram/test` - Test bildirimi

### Cron
- `GET /api/cron/check` - Otomatik kontrol (Vercel Cron)

### Stats
- `GET /api/stats` - Kullanıcı istatistikleri

## 🌍 Desteklenen Ülkeler

| Ülke | Bayrak | Ülke | Bayrak |
|------|--------|------|--------|
| Fransa | 🇫🇷 | Hollanda | 🇳🇱 |
| Almanya | 🇩🇪 | İspanya | 🇪🇸 |
| İtalya | 🇮🇹 | İsveç | 🇸🇪 |
| Çekya | 🇨🇿 | Hırvatistan | 🇭🇷 |
| Bulgaristan | 🇧🇬 | Finlandiya | 🇫🇮 |
| Slovenya | 🇸🇮 | Danimarka | 🇩🇰 |
| Norveç | 🇳🇴 | Estonya | 🇪🇪
// Manunya | 🇱🇹 | Lüksemburg | 🇱🇺 |
| Letonya | 🇱🇻 | | |

## 🚀 Deployment

### Vercel (Önerilen)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ibidi/schengen-visa-appointment-bot)

```bash
# Vercel CLI ile
npm i -g vercel
vercel

# Environment variables ekle
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add TELEGRAM_BOT_TOKEN
vercel env add CRON_SECRET
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## ⚙️ Environment Variables

```env
# Supabase (Zorunlu)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Telegram Bot (Opsiyonel)
TELEGRAM_BOT_TOKEN=your-bot-token

# Cron Secret (Güvenlik için)
CRON_SECRET=your-random-secret
```

## 🔒 Güvenlik

- ✅ Supabase Row Level Security (RLS)
- ✅ Environment variables
- ✅ Cron job authentication
- ✅ HTTPS only (production)
- ✅ Rate limiting

## ⚠️ Yasal Uyarı

Bu proje **sadece eğitim ve bilgilendirme amaçlıdır**.

### ❌ KULLANMAYIN:
- Otomatik randevu rezervasyonu için
- Ticari amaçlar için
- Spam veya kötüye kullanım için

### ✅ KULLANIN:
- Eğitim ve öğrenme için
- Kişisel randevu takibi için
- Açık kaynak katkı için

**Resmi randevu işlemleri için mutlaka resmi kanalları kullanın!**

## 📊 Performans

- **Build Size:** ~122 KB (First Load JS)
- **API Response:** <500ms
- **Cron Frequency:** 5 dakika
- **Database:** PostgreSQL (Supabase)

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz!

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing`)
3. Commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Push edin (`git push origin feature/amazing`)
5. Pull Request açın

## 📝 Lisans

MIT License © [İhsan Baki Doğan](https://github.com/ibidi)

## 🔗 Bağlantılar

- **GitHub:** https://github.com/ibidi/schengen-visa-appointment-bot
- **NPM Modülü:** https://www.npmjs.com/package/schengen-randevu-checker
- **Demo:** Coming soon
- **Docs:** [Wiki](https://github.com/ibidi/schengen-visa-appointment-bot/wiki)

## 👨‍💻 Geliştirici

**İhsan Baki Doğan**
- Email: info@ihsanbakidogan.com
- GitHub: [@ibidi](https://github.com/ibidi)
- LinkedIn: [İhsan Baki Doğan](https://linkedin.com/in/ihsanbakidogan)

## 🙏 Teşekkürler

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Vercel](https://vercel.com/) - Deployment platform
- [Schengen Visa Appointments API](https://api.schengenvisaappointments.com/)

---

⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın!

**Made with ❤️ in Turkey 🇹🇷**
