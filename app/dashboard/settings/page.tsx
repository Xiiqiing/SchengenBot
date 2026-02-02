'use client';

import React, { useState, useEffect } from 'react';
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
  const [testingEmail, setTestingEmail] = useState(false);

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

  const handleTestEmail = async () => {
    if (!preferences.email_address) {
      alert('请输入接收邮箱!');
      return;
    }

    setTestingEmail(true);
    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: preferences.email_address,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ 测试邮件已发送! 请检查您的收件箱 (包括垃圾邮件文件夹)。');
      } else {
        alert(`❌ 发送失败: ${data.error}`);
      }
    } catch (error) {
      console.error('Email test error:', error);
      alert('测试过程中发生错误!');
    } finally {
      setTestingEmail(false);
    }
  };

  const toggleCountry = (code: string) => {
    setPreferences((prev: any) => ({
      ...prev,
      countries: prev.countries.includes(code)
        ? prev.countries.filter((c: string) => c !== code)
        : [...prev.countries, code],
    }));
  };

  const toggleCity = (code: string) => {
    setPreferences((prev: any) => ({
      ...prev,
      cities: prev.cities.includes(code)
        ? prev.cities.filter((c: string) => c !== code)
        : [...prev.cities, code],
    }));
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Header */}
      <header className="bg-surface/80 backdrop-blur-md sticky top-0 z-50 border-b border-outline/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="m3-button-pill bg-surface-variant/50 text-on-surface-variant hover:bg-surface-variant">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回主页
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-black tracking-tight">偏好设置</h1>
              <p className="text-sm font-medium text-on-surface-variant">自定您的监控策略与通知方式</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="space-y-8">
          {/* Ülke Seçimi */}
          <Card className="m3-card p-6 bg-surface border border-outline/10 shadow-sm">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <Globe className="w-6 h-6 text-primary" />
                目标国家监控
              </CardTitle>
              <CardDescription className="text-sm font-medium text-on-surface-variant">
                选择您希望实时追踪预约名额的国家
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {COUNTRIES.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => toggleCountry(country.code)}
                    className={`p-4 rounded-[20px] transition-all flex flex-col items-center justify-center gap-2 border-2 ${preferences.countries.includes(country.code)
                      ? 'border-primary bg-primary-container text-on-primary-container shadow-md'
                      : 'border-outline/10 bg-surface-variant/10 hover:border-outline/30'
                      }`}
                  >
                    <div className="text-3xl">{country.flag}</div>
                    <div className="text-xs font-black uppercase tracking-tight">{country.nameTr}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* UK城市选择 */}
          <Card className="m3-card p-6 bg-surface border border-outline/10 shadow-sm">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                🇬🇧 英国城市选择
              </CardTitle>
              <CardDescription className="text-sm font-medium text-on-surface-variant">
                选定英国境内的签证中心位置
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {UK_CITIES.map((city) => (
                  <button
                    key={city.code}
                    onClick={() => toggleCity(city.code)}
                    className={`p-3 rounded-[20px] transition-all border-2 text-sm font-black uppercase tracking-tighter ${preferences.cities.includes(city.code)
                      ? 'border-tertiary bg-tertiary-container text-on-tertiary-container'
                      : 'border-outline/10 bg-surface-variant/10 hover:border-outline/30'
                      }`}
                  >
                    {city.nameEn}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 通知渠道 - Telegram */}
          <Card className="m3-card p-6 bg-surface border border-outline/10 shadow-sm">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <Bell className="w-6 h-6 text-primary" />
                Telegram 即时推送
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-6">
              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-primary/5 to-primary/10 rounded-3xl border border-primary/20">
                <div className="space-y-1">
                  <span className="text-base font-bold text-on-surface">开启 TG 通知</span>
                  <p className="text-sm text-on-surface-variant">通过 Telegram Bot 接收秒级同步: @visashengenuk_xq_bot</p>
                </div>
                <button
                  onClick={() => setPreferences(prev => ({ ...prev, telegram_enabled: !prev.telegram_enabled }))}
                  className={`relative inline-flex h-9 w-16 items-center rounded-full transition-all duration-300 shadow-inner ${preferences.telegram_enabled
                    ? 'bg-primary shadow-lg shadow-primary/30'
                    : 'bg-surface-variant border-2 border-outline/30'}`}
                >
                  <span className={`inline-block h-7 w-7 transform rounded-full shadow-md transition-all duration-300 ${preferences.telegram_enabled
                    ? 'translate-x-8 bg-white'
                    : 'translate-x-1 bg-on-surface-variant/30'}`} />
                </button>
              </div>

              {preferences.telegram_enabled && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60">Bot Token</label>
                    <input
                      type="text"
                      value={botToken}
                      onChange={(e) => setBotToken(e.target.value)}
                      placeholder="API TOKEN FROM @BOTFATHER"
                      className="w-full px-4 py-3 rounded-2xl bg-surface-variant/20 border border-outline/10 focus:border-primary outline-none transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60">Chat ID</label>
                    <input
                      type="text"
                      value={preferences.telegram_chat_id}
                      onChange={(e) => setPreferences(prev => ({ ...prev, telegram_chat_id: e.target.value }))}
                      placeholder="YOUR NUMERIC CHAT ID"
                      className="w-full px-4 py-3 rounded-2xl bg-surface-variant/20 border border-outline/10 focus:border-primary outline-none transition-all font-medium"
                    />
                  </div>

                  <Button
                    onClick={handleTestTelegram}
                    disabled={testing}
                    variant="outline"
                    className="w-full m3-button-pill border-2 border-primary text-primary hover:bg-primary/10 h-12 font-bold"
                  >
                    {testing ? <Clock className="animate-spin h-5 w-5" /> : <><TestTube className="mr-2 h-4 w-4" /> 发送测试指令</>}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 通知渠道 - Email */}
          <Card className="m3-card p-6 bg-surface border border-outline/10 shadow-sm">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <Mail className="w-6 h-6 text-tertiary" />
                电子邮件提醒
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-6">
              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-tertiary/5 to-tertiary/10 rounded-3xl border border-tertiary/20">
                <div className="space-y-1">
                  <span className="text-base font-bold text-on-surface">开启邮件通知</span>
                  <p className="text-sm text-on-surface-variant">通过电子邮件接收最新预约通知</p>
                </div>
                <button
                  onClick={() => setPreferences(prev => ({ ...prev, email_enabled: !prev.email_enabled }))}
                  className={`relative inline-flex h-9 w-16 items-center rounded-full transition-all duration-300 shadow-inner ${preferences.email_enabled
                    ? 'bg-tertiary shadow-lg shadow-tertiary/30'
                    : 'bg-surface-variant border-2 border-outline/30'}`}
                >
                  <span className={`inline-block h-7 w-7 transform rounded-full shadow-md transition-all duration-300 ${preferences.email_enabled
                    ? 'translate-x-8 bg-white'
                    : 'translate-x-1 bg-on-surface-variant/30'}`} />
                </button>
              </div>

              {preferences.email_enabled && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60">接收邮箱</label>
                    <input
                      type="email"
                      value={preferences.email_address || ''}
                      onChange={(e) => setPreferences(prev => ({ ...prev, email_address: e.target.value }))}
                      placeholder="NAME@DOMAIN.COM"
                      className="w-full px-4 py-3 rounded-2xl bg-surface-variant/20 border border-outline/10 focus:border-tertiary outline-none transition-all font-medium"
                    />
                  </div>
                  <Button
                    onClick={handleTestEmail}
                    disabled={testingEmail}
                    variant="outline"
                    className="w-full m3-button-pill border-2 border-tertiary text-tertiary hover:bg-tertiary/10 h-12 font-bold"
                  >
                    {testingEmail ? <Clock className="animate-spin h-5 w-5" /> : <><TestTube className="mr-2 h-4 w-4" /> 发送测试邮件</>}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 自动检查配置 */}
          <Card className="m3-card p-6 bg-surface border border-outline/10 shadow-sm">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <Clock className="w-6 h-6 text-primary" />
                后台自动爬取
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-6">
              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-green-500/5 to-green-500/10 rounded-3xl border border-green-500/20">
                <div className="space-y-1">
                  <span className="text-base font-bold text-on-surface">激活自动模式</span>
                  <p className="text-sm text-on-surface-variant">后台自动定时爵取数据</p>
                </div>
                <button
                  onClick={() => setPreferences(prev => ({ ...prev, auto_check_enabled: !prev.auto_check_enabled }))}
                  className={`relative inline-flex h-9 w-16 items-center rounded-full transition-all duration-300 shadow-inner ${preferences.auto_check_enabled
                    ? 'bg-green-500 shadow-lg shadow-green-500/30'
                    : 'bg-surface-variant border-2 border-outline/30'}`}
                >
                  <span className={`inline-block h-7 w-7 transform rounded-full shadow-md transition-all duration-300 ${preferences.auto_check_enabled
                    ? 'translate-x-8 bg-white'
                    : 'translate-x-1 bg-on-surface-variant/30'}`} />
                </button>
              </div>

              {preferences.auto_check_enabled && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60">频率 (分钟)</label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={preferences.check_frequency}
                    onChange={(e) => setPreferences(prev => ({ ...prev, check_frequency: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 rounded-2xl bg-surface-variant/20 border border-outline/10 focus:border-primary outline-none font-black text-xl"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* 保存按钮 */}
          <div className="pt-6">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full m3-button-pill bg-primary text-on-primary h-16 text-xl font-black tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.98]"
            >
              {saving ? <Clock className="animate-spin h-7 w-7" /> : <><Save className="mr-3 h-6 w-6" /> 保存所有配置</>}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
