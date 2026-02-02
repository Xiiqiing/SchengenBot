'use client';

import { useState, useEffect } from 'react';
import { Save, TestTube, ArrowLeft, Bell, Globe, Clock, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { COUNTRIES, UK_CITIES } from '@/lib/constants/countries';
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
    email_enabled: false,
    email_address: '',
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

      const data = await response.json();

      if (response.ok && data.success) {
        alert('设置已保存!');
      } else {
        // Show actual error from API
        const errorMsg = data.error || '保存失败!';
        console.error('Save failed:', data);
        alert(`保存失败: ${errorMsg}`);
      }
    } catch (error: any) {
      console.error('Save error:', error);
      alert(`保存错误: ${error.message || '未知错误'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleTestTelegram = async () => {
    if (!preferences.telegram_chat_id || !botToken) {
      alert('请输入Bot Token和Chat ID!');
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
        alert('✅ 测试通知已发送! 请检查Telegram。');
      } else {
        alert(`❌ 错误: ${data.error}`);
      }
    } catch (error) {
      console.error('Test error:', error);
      alert('测试过程中发生错误!');
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
                返回
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">设置</h1>
              <p className="text-sm text-gray-500">配置您的偏好设置</p>
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
                国家选择
              </CardTitle>
              <CardDescription>
                选择您要检查预约的国家
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {COUNTRIES.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => toggleCountry(country.code)}
                    className={`p-4 rounded-lg border-2 transition-all ${preferences.countries.includes(country.code)
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
                已选: {preferences.countries.length} 个国家
              </p>
            </CardContent>
          </Card>

          {/* UK城市选择 */}
          <Card>
            <CardHeader>
              <CardTitle>🇬🇧 UK城市选择</CardTitle>
              <CardDescription>
                选择您要检查预约的英国城市
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {UK_CITIES.map((city) => (
                  <button
                    key={city.code}
                    onClick={() => toggleCity(city.code)}
                    className={`p-4 rounded-lg border-2 transition-all ${preferences.cities.includes(city.code)
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="text-sm font-medium">{city.nameEn}</div>
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-4">
                已选: {preferences.cities.length} 个城市
              </p>
            </CardContent>
          </Card>

          {/* Telegram Ayarları */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Telegram通知
              </CardTitle>
              <CardDescription>
                有可用预约时通过Telegram接收通知
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Telegram通知</span>
                <button
                  onClick={() => setPreferences(prev => ({ ...prev, telegram_enabled: !prev.telegram_enabled }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.telegram_enabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.telegram_enabled ? 'translate-x-6' : 'translate-x-1'
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
                      请输入从@BotFather获取的token
                    </p>
                    <p className="text-xs text-amber-600 mt-2 font-medium">
                      ⚠️ 注意: 此处输入仅供测试。自动检查需要您在 Vercel 环境变量中配置 TELEGRAM_BOT_TOKEN。
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
                      与Bot对话并发送/start后，通过getUpdates获取
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
                        测试中...
                      </>
                    ) : (
                      <>
                        <TestTube className="mr-2 h-4 w-4" />
                        发送测试通知
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Email Ayarları */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                邮件通知
              </CardTitle>
              <CardDescription>
                通过电子邮件接收预约通知
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">邮件通知</span>
                <button
                  onClick={() => setPreferences(prev => ({ ...prev, email_enabled: !prev.email_enabled }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.email_enabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.email_enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>

              {preferences.email_enabled && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    接收邮箱
                  </label>
                  <input
                    type="email"
                    value={preferences.email_address || ''}
                    onChange={(e) => setPreferences(prev => ({ ...prev, email_address: e.target.value }))}
                    placeholder="your-email@example.com"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    系统将通过此邮箱发送通知
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Otomatik Kontrol */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                自动检查
              </CardTitle>
              <CardDescription>
                定时自动检查预约
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">自动检查</span>
                <button
                  onClick={() => setPreferences(prev => ({ ...prev, auto_check_enabled: !prev.auto_check_enabled }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.auto_check_enabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.auto_check_enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>

              {preferences.auto_check_enabled && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    检查频率(分钟)
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
                    最少5分钟，最多60分钟
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
                保存中...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                保存设置
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
