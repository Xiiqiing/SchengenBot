'use client';

import { useState } from 'react';
import { Bell, CheckCircle2, Clock, Globe, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { COUNTRIES } from '@/lib/constants/countries';

export default function LandingPage() {
  const [email, setEmail] = useState('');

  const handleGetStarted = () => {
    // TODO: Implement auth
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Gerçek Zamanlı Bildirim Sistemi
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Schengen Vize Randevusu
            <span className="block text-blue-600">Artık Kaçırmayın!</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            17 Schengen ülkesi için otomatik randevu takibi. Müsait randevu bulunduğunda anında Telegram bildirimi alın.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button size="lg" onClick={handleGetStarted} className="text-lg px-8">
              <Bell className="mr-2 h-5 w-5" />
              Hemen Başla
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Demo İzle
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-blue-600">17</div>
              <div className="text-sm text-gray-600">Ülke</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">7</div>
              <div className="text-sm text-gray-600">Şehir</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">24/7</div>
              <div className="text-sm text-gray-600">Otomatik Kontrol</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Özellikler</h2>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <Bell className="w-10 h-10 text-blue-600 mb-4" />
              <CardTitle>Anında Bildirim</CardTitle>
              <CardDescription>
                Müsait randevu bulunduğunda Telegram üzerinden anında bildirim alın
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Clock className="w-10 h-10 text-blue-600 mb-4" />
              <CardTitle>Otomatik Kontrol</CardTitle>
              <CardDescription>
                5 dakikada bir otomatik kontrol. Siz uyurken bile çalışır
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Globe className="w-10 h-10 text-blue-600 mb-4" />
              <CardTitle>17 Ülke Desteği</CardTitle>
              <CardDescription>
                Tüm popüler Schengen ülkeleri için randevu takibi
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CheckCircle2 className="w-10 h-10 text-blue-600 mb-4" />
              <CardTitle>Kolay Kurulum</CardTitle>
              <CardDescription>
                3 adımda kurulum. Telegram bot ile hemen başlayın
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="w-10 h-10 text-blue-600 mb-4" />
              <CardTitle>Güvenli</CardTitle>
              <CardDescription>
                Verileriniz Supabase'de güvenle saklanır. GDPR uyumlu
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="w-10 h-10 text-blue-600 mb-4" />
              <CardTitle>Hızlı</CardTitle>
              <CardDescription>
                Next.js 15 ve React 19 ile ultra hızlı performans
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Countries */}
      <div className="container mx-auto px-4 py-16 bg-white">
        <h2 className="text-3xl font-bold text-center mb-12">Desteklenen Ülkeler</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
          {COUNTRIES.map((country) => (
            <div
              key={country.code}
              className="flex flex-col items-center p-4 rounded-lg border hover:border-blue-500 hover:shadow-md transition-all"
            >
              <span className="text-4xl mb-2">{country.flag}</span>
              <span className="text-sm font-medium text-center">{country.nameTr}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-3xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-4">Hemen Başlayın</CardTitle>
            <CardDescription className="text-blue-100 text-lg">
              Ücretsiz hesap oluşturun ve randevu takibine başlayın
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button size="lg" variant="secondary" onClick={handleGetStarted} className="text-lg px-8">
              <Bell className="mr-2 h-5 w-5" />
              Ücretsiz Başla
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p className="mb-2">
            Made with ❤️ by{' '}
            <a href="https://github.com/ibidi" className="text-blue-600 hover:underline">
              İhsan Baki Doğan
            </a>
          </p>
          <p className="text-sm">
            ⚠️ Bu proje sadece eğitim ve bilgilendirme amaçlıdır. Resmi randevu için resmi kanalları kullanın.
          </p>
        </div>
      </footer>
    </div>
  );
}
