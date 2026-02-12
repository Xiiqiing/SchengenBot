'use client';

import React, { useState, useEffect } from 'react';
import { Save, TestTube, ArrowLeft, Bell, Globe, Clock, Mail, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { COUNTRIES, UK_CITIES } from '@/lib/constants/countries';
import Link from 'next/link';
import { getOrCreateUserId } from '@/lib/user-id';

import { useTranslations } from 'next-intl';

export default function SettingsPage() {
  const t = useTranslations('Settings');
  const tCountries = useTranslations('Countries');
  const tCities = useTranslations('Cities');
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
        alert(t('alerts.saved'));
      } else {
        // Show actual error from API
        const errorMsg = data.error || t('alerts.saveFailed');
        console.error('Save failed:', data);
        alert(`${t('alerts.saveFailed')}${errorMsg}`);
      }
    } catch (error: any) {
      console.error('Save error:', error);
      alert(`${t('alerts.saveFailed')}${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleTestTelegram = async () => {
    if (!preferences.telegram_chat_id || !botToken) {
      alert(t('alerts.enterTgCreds'));
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
        alert(t('alerts.testTgSuccess'));
      } else {
        alert(`${t('alerts.testTgError')}${data.error}`);
      }
    } catch (error) {
      console.error('Test error:', error);
      alert(t('alerts.testError'));
    } finally {
      setTesting(false);
    }
  };

  const handleTestEmail = async () => {
    if (!preferences.email_address) {
      alert(t('alerts.enterEmail'));
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
        alert(t('alerts.testEmailSuccess'));
      } else {
        alert(`${t('alerts.testEmailError')}${data.error}`);
      }
    } catch (error) {
      console.error('Email test error:', error);
      alert(t('alerts.testError'));
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
      <PageHeader
        title={t('title')}
        description={t('description')}
        backHref="/dashboard"
        backLabel={t('backLabel') || 'Back'}
        icon={<Settings className="w-5 h-5 text-[#f5f5f7]" />}
      />

      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="space-y-8">
          {/* Country Selection */}
          <section className="m3-card p-6">
            <div className="mb-6">
              <h2 className="title-large text-on-surface flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                {t('sections.countries.title')}
              </h2>
              <p className="body-medium text-on-surface-variant mt-1">
                {t('sections.countries.description')}
              </p>
            </div>
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {COUNTRIES.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => toggleCountry(country.code)}
                    className={`relative p-4 rounded-2xl transition-all duration-200 flex flex-col items-center justify-center gap-2 border active:scale-[0.96] ${preferences.countries.includes(country.code)
                      ? 'border-primary border-2 bg-white shadow-md shadow-blue-500/10'
                      : 'border-transparent bg-white shadow-sm hover:shadow-md hover:scale-[1.02]'}`}
                  >
                    <div className="text-3xl filter drop-shadow-sm">{country.flag}</div>
                    <div className={`text-sm font-semibold ${preferences.countries.includes(country.code) ? 'text-primary' : 'text-gray-900'}`}>
                      {tCountries(country.code)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* UK City Selection */}
          <Card className="bg-white rounded-2xl shadow-sm border-none p-6">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                🇬🇧 {t('sections.cities.title')}
              </CardTitle>
              <CardDescription className="text-sm font-medium text-on-surface-variant">
                {t('sections.cities.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {UK_CITIES.map((city) => (
                  <button
                    key={city.code}
                    onClick={() => toggleCity(city.code)}
                    className={`relative p-3 rounded-2xl transition-all duration-200 border text-sm font-semibold active:scale-[0.96] ${preferences.cities.includes(city.code)
                      ? 'border-tertiary border-2 bg-white shadow-md text-tertiary'
                      : 'border-transparent bg-white shadow-sm hover:shadow-md hover:scale-[1.02] text-gray-700'
                      }`}
                  >
                    {tCities(city.code)}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notification Channel - Telegram */}
          <Card className="bg-white rounded-2xl shadow-sm border-none p-6">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <Bell className="w-6 h-6 text-primary" />
                {t('sections.telegram.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-6">
              <div className="flex items-center justify-between p-4 bg-[#F5F5F7] rounded-xl">
                <div className="space-y-0.5">
                  <span className="body-large font-medium text-on-surface">{t('sections.telegram.enable')}</span>
                  <p className="body-medium text-on-surface-variant">{t('sections.telegram.description')}</p>
                </div>
                <button
                  onClick={() => setPreferences(prev => ({ ...prev, telegram_enabled: !prev.telegram_enabled }))}
                  className={`relative inline-flex h-[31px] w-[51px] items-center rounded-full transition-colors duration-200 focus:outline-none ${preferences.telegram_enabled
                    ? 'bg-[#0071e3]'
                    : 'bg-[#E9E9EA]'}`}
                >
                  <span className={`inline-block h-[27px] w-[27px] transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${preferences.telegram_enabled
                    ? 'translate-x-[22px]'
                    : 'translate-x-[2px]'}`} />
                </button>
              </div>

              {preferences.telegram_enabled && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60">{t('sections.telegram.botToken')}</label>
                    <input
                      type="text"
                      value={botToken}
                      onChange={(e) => setBotToken(e.target.value)}
                      placeholder="API TOKEN FROM @BOTFATHER"
                      className="w-full px-4 py-3 rounded-2xl bg-surface-variant/20 border border-outline/10 focus:border-primary outline-none transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60">{t('sections.telegram.chatId')}</label>
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
                    {testing ? <Clock className="animate-spin h-5 w-5" /> : <><TestTube className="mr-2 h-4 w-4" /> {t('sections.telegram.test')}</>}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notification Channel - Email */}
          <Card className="bg-white rounded-2xl shadow-sm border-none p-6">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <Mail className="w-6 h-6 text-tertiary" />
                {t('sections.email.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-6">
              <div className="flex items-center justify-between p-4 bg-[#F5F5F7] rounded-xl">
                <div className="space-y-0.5">
                  <span className="body-large font-medium text-on-surface">{t('sections.email.enable')}</span>
                  <p className="body-medium text-on-surface-variant">{t('sections.email.description')}</p>
                </div>
                <button
                  onClick={() => setPreferences(prev => ({ ...prev, email_enabled: !prev.email_enabled }))}
                  className={`relative inline-flex h-[31px] w-[51px] items-center rounded-full transition-colors duration-200 focus:outline-none ${preferences.email_enabled
                    ? 'bg-[#0071e3]'
                    : 'bg-[#E9E9EA]'}`}
                >
                  <span className={`inline-block h-[27px] w-[27px] transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${preferences.email_enabled
                    ? 'translate-x-[22px]'
                    : 'translate-x-[2px]'}`} />
                </button>
              </div>

              {preferences.email_enabled && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60">{t('sections.email.address')}</label>
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
                    {testingEmail ? <Clock className="animate-spin h-5 w-5" /> : <><TestTube className="mr-2 h-4 w-4" /> {t('sections.email.test')}</>}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Auto Check Configuration */}
          <Card className="bg-white rounded-2xl shadow-sm border-none p-6">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <Clock className="w-6 h-6 text-primary" />
                {t('sections.autoCheck.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-6">
              <div className="flex items-center justify-between p-4 bg-[#F5F5F7] rounded-xl">
                <div className="space-y-0.5">
                  <span className="body-large font-medium text-on-surface">{t('sections.autoCheck.enable')}</span>
                  <p className="body-medium text-on-surface-variant">{t('sections.autoCheck.description')}</p>
                </div>
                <button
                  onClick={() => setPreferences(prev => ({ ...prev, auto_check_enabled: !prev.auto_check_enabled }))}
                  className={`relative inline-flex h-[31px] w-[51px] items-center rounded-full transition-colors duration-200 focus:outline-none ${preferences.auto_check_enabled
                    ? 'bg-[#0071e3]'
                    : 'bg-[#E9E9EA]'}`}
                >
                  <span className={`inline-block h-[27px] w-[27px] transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${preferences.auto_check_enabled
                    ? 'translate-x-[22px]'
                    : 'translate-x-[2px]'}`} />
                </button>
              </div>

              {preferences.auto_check_enabled && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60">{t('sections.autoCheck.frequency')}</label>
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

          {/* Save Button */}
          <div className="pt-6">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full h-14 text-base"
            >
              {saving ? <Clock className="animate-spin h-5 w-5" /> : <><Save className="h-5 w-5 mr-2" /> {t('actions.save')}</>}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
