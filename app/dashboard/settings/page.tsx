'use client';

import { useState, useEffect } from 'react';
import { Save, TestTube, ArrowLeft, Bell, Globe, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { COUNTRIES, CITIES } from '@/lib/constants/countries';
import Link from 'next/link';
import { getOrCreateUserId } from '@/lib/user-id';

export default function SettingsPage() {
  const [userId] = useState(() => getOrCreateUserId());
  const [preferences, setPreferences] = useState({
    countries: [] as string[],
    cities: [] as string[],
    check_frequency: 5,
    telegram_enabled: false,
    telegram_chat_id: '',
    web_enabled: true,
    sound_enabled: true,
    auto_check_enabled: false,
  });

  const [botToken, setBotToken] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await fetch(`/api/preferences?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.preferences) {
          setPreferences({
            ...preferences,
            ...data.preferences,
          });
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          ...preferences,
        }),
      });

      if (response.ok) {
        alert('Ayarlar kaydedildi!');
      } else {
        alert('Kaydetme hatası!');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Kaydetme hatası!');
    } finally {
      setSaving(false);
    }
  };

  const handleTestTelegram = async () => {
    if (!preferences.telegram_chat_id || !botToken) {
      alert('Lütfen bot token ve chat ID girin!');
      return;
    }

    setTesting(true);
    try {
      const response = await fetch('/api/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: preferences.telegram_chat_id,
          botToken,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('✅ Test bildirimi gönderildi! Telegram\'ı kontrol edin.');
      } else {
        alert(`❌ Hata: ${data.error}`);
      }
    } catch (error) {
      console.error('Test error:', error);
      alert('Test sırasında hata oluştu!');
    } finally {
      setTesting(false);
    }
  };

  const toggleCountry = (code: string) => {
    setPreferences(prev => ({
      ...prev,
      countries: prev.countries.includes(code)
        ? prev.countries.filter(c => c !== code)
        : [...prev.countries, code],
    }));
  };

  const toggleCity = (code: string) => {
    setPreferences(prev => ({
      ...prev,
      cities: prev.cities.includes(code)
        ? prev.cities.filter(c => c !== code)
        : [...prev.cities, code],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ayarlar</h1>
              <p className="text-sm text-gray-500">Tercihlerinizi yapılandırın</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Ülke Seçimi */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Ülke Seçimi
              </CardTitle>
              <CardDescription>
                Randevu kontrolü yapmak istediğiniz ülkeleri seçin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {COUNTRIES.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => toggleCountry(country.code)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      preferences.countries.includes(country.code)
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{country.flag}</div>
                    <div className="text-sm font-medium">{country.nameTr}</div>
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Seçili: {preferences.countries.length} ülke
              </p>
            </CardContent>
          </Card>

          {/* Şehir Seçimi */}
          <Card>
            <CardHeader>
              <CardTitle>Şehir Seçimi</CardTitle>
              <CardDescription>
                Randevu kontrolü yapmak istediğiniz şehirleri seçin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {CITIES.map((city) => (
                  <button
                    key={city.code}
                    onClick={() => toggleCity(city.code)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      preferences.cities.includes(city.code)
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-medium">{city.nameTr}</div>
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Seçili: {preferences.cities.length} şehir
              </p>
            </CardContent>
          </Card>

          {/* Telegram Ayarları */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Telegram Bildirimleri
              </CardTitle>
              <CardDescription>
                Müsait randevu bulunduğunda Telegram'dan bildirim alın
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Telegram Bildirimleri</span>
                <button
                  onClick={() => setPreferences(prev => ({ ...prev, telegram_enabled: !prev.telegram_enabled }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.telegram_enabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.telegram_enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {preferences.telegram_enabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Bot Token (Admin)
                    </label>
                    <input
                      type="text"
                      value={botToken}
                      onChange={(e) => setBotToken(e.target.value)}
                      placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      @BotFather'dan aldığınız token
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Chat ID
                    </label>
                    <input
                      type="text"
                      value={preferences.telegram_chat_id}
                      onChange={(e) => setPreferences(prev => ({ ...prev, telegram_chat_id: e.target.value }))}
                      placeholder="123456789"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Bot ile konuşup /start gönderdikten sonra getUpdates ile alın
                    </p>
                  </div>

                  <Button
                    onClick={handleTestTelegram}
                    disabled={testing}
                    variant="outline"
                    className="w-full"
                  >
                    {testing ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Test Ediliyor...
                      </>
                    ) : (
                      <>
                        <TestTube className="mr-2 h-4 w-4" />
                        Test Bildirimi Gönder
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Otomatik Kontrol */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Otomatik Kontrol
              </CardTitle>
              <CardDescription>
                Belirli aralıklarla otomatik randevu kontrolü
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Otomatik Kontrol</span>
                <button
                  onClick={() => setPreferences(prev => ({ ...prev, auto_check_enabled: !prev.auto_check_enabled }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.auto_check_enabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.auto_check_enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {preferences.auto_check_enabled && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Kontrol Sıklığı (dakika)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={preferences.check_frequency}
                    onChange={(e) => setPreferences(prev => ({ ...prev, check_frequency: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 5, maksimum 60 dakika
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Kaydet */}
          <Button
            onClick={handleSave}
            disabled={saving}
            size="lg"
            className="w-full"
          >
            {saving ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Ayarları Kaydet
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
