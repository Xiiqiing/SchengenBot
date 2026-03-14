'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, TestTube, Bell, Globe, Clock, Mail, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { COUNTRIES, UK_CITIES } from '@/lib/constants/countries';
import { clearUserId, getOrCreateUserId } from '@/lib/user-id';
import {
  getExistingPushSubscription,
  isWebPushSupported,
  serializePushSubscription,
  subscribeToPush,
  unsubscribeFromPush,
} from '@/lib/push/browser';

import { useLocale, useTranslations } from 'next-intl';

const appleFieldClassName =
  'w-full rounded-[20px] border border-black/6 bg-[#f5f5f7] px-4 py-3.5 text-[15px] font-medium text-[#1d1d1f] outline-none transition-all placeholder:text-[#8e8e93] focus:border-[#0071e3] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,113,227,0.12)]';

const appleLabelClassName =
  'text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86868b]';

export default function SettingsPage() {
  const t = useTranslations('Settings');
  const tNav = useTranslations('Dashboard.nav');
  const tCountries = useTranslations('Countries');
  const tCities = useTranslations('Cities');
  const locale = useLocale();
  const router = useRouter();
  const [userId] = useState(() => getOrCreateUserId());
  const [preferences, setPreferences] = useState({
    countries: [] as string[],
    cities: [] as string[],
    check_frequency: 5,
    same_slot_cooldown_hours: 24,
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
  const [loggingOut, setLoggingOut] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushConfigReady, setPushConfigReady] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushTesting, setPushTesting] = useState(false);
  const [vapidPublicKey, setVapidPublicKey] = useState('');
  const [pushConfigError, setPushConfigError] = useState('');

  useEffect(() => {
    loadPreferences();
  }, []);

  useEffect(() => {
    setPushSupported(isWebPushSupported());

    if (typeof window !== 'undefined' && isWebPushSupported()) {
      loadPushStatus();
    }
  }, [userId]);

  const loadPreferences = async () => {
    try {
      const response = await fetch(`/api/preferences?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.preferences) {
          setPreferences(prev => ({
            ...prev,
            ...data.preferences,
          }));
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const loadPushStatus = async () => {
    try {
      const [apiResponse, existingSubscription] = await Promise.all([
        fetch(`/api/push/subscription?userId=${userId}`),
        getExistingPushSubscription(),
      ]);

      if (apiResponse.ok) {
        const data = await apiResponse.json();
        setPushConfigReady(!!data.configured);
        setVapidPublicKey(data.vapidPublicKey || '');
        setPushConfigError(data.configurationError || '');
        const existingEndpoint = existingSubscription?.endpoint;
        const matchedSubscription = data.subscriptions?.some(
          (subscription: { endpoint: string }) => subscription.endpoint === existingEndpoint
        );
        setPushSubscribed(Boolean(existingEndpoint) && Boolean(matchedSubscription));
      } else {
        const data = await apiResponse.json().catch(() => null);
        setPushConfigError(data?.error || 'Failed to load push configuration');
      }
    } catch (error) {
      console.error('Error loading push status:', error);
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

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearUserId();
      router.replace(`/${locale}`);
      router.refresh();
      setLoggingOut(false);
    }
  };

  const handlePushSubscriptionToggle = async () => {
    if (!pushSupported) {
      alert(t('sections.webPush.unsupported'));
      return;
    }

    if (!pushConfigReady || !vapidPublicKey) {
      alert(pushConfigError || t('alerts.pushUnavailable'));
      return;
    }

    setPushLoading(true);

    try {
      if (pushSubscribed) {
        const existingSubscription = await getExistingPushSubscription();

        if (existingSubscription) {
          const payload = serializePushSubscription(existingSubscription);

          await fetch('/api/push/subscription', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              endpoint: payload.endpoint,
            }),
          });

          await unsubscribeFromPush();
        }

        setPushSubscribed(false);
        alert(t('alerts.pushUnsubscribed'));
        return;
      }

      const subscription = await subscribeToPush(vapidPublicKey);
      const payload = serializePushSubscription(subscription);

      const response = await fetch('/api/push/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...payload,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }

      setPushSubscribed(true);
      alert(t('alerts.pushSubscribed'));
    } catch (error: any) {
      console.error('Push subscription error:', error);
      alert(`${t('alerts.pushFailed')}${error.message || 'Unknown error'}`);
    } finally {
      setPushLoading(false);
    }
  };

  const handleTestPush = async () => {
    if (!pushSubscribed) {
      alert(t('sections.webPush.statusNotReady'));
      return;
    }

    setPushTesting(true);

    try {
      const existingSubscription = await getExistingPushSubscription();
      const endpoint = existingSubscription?.endpoint;

      const response = await fetch('/api/push/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          endpoint,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to send test push');
      }

      alert(t('alerts.pushTestSuccess'));
    } catch (error: any) {
      console.error('Push test error:', error);
      alert(`${t('alerts.pushTestFailed')}${error.message || 'Unknown error'}`);
    } finally {
      setPushTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#ffffff_0%,#f7f8fb_44%,#eef2f7_100%)] text-on-surface">
      {/* Header */}
      <PageHeader
        title={t('title')}
        description={t('description')}
        backHref={`/${locale}/dashboard`}
        backLabel={t('backLabel') || 'Back'}
        icon={<Settings className="w-5 h-5 text-[#86868b]" />}
      />

      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="space-y-8">
          <Card className="overflow-hidden rounded-[36px] border border-black/5 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] text-[#1d1d1f] shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
                <div className="max-w-xl">
                  <h2 className="mt-3 text-[34px] font-semibold tracking-[-0.05em] text-[#1d1d1f] md:text-[48px] md:leading-[0.98]">
                    {t('title')}
                  </h2>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-[#6e6e73]">
                    {t('description')}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-2.5">
                <Badge className={`rounded-full border border-black/5 px-4 py-1.5 text-[12px] font-semibold shadow-sm ${preferences.telegram_enabled ? 'bg-white text-[#1d1d1f]' : 'bg-white/55 text-[#86868b]'}`}>
                  Telegram {preferences.telegram_enabled ? t('summary.enabled') : t('summary.disabled')}
                </Badge>
                <Badge className={`rounded-full border border-black/5 px-4 py-1.5 text-[12px] font-semibold shadow-sm ${preferences.email_enabled ? 'bg-white text-[#1d1d1f]' : 'bg-white/55 text-[#86868b]'}`}>
                  Email {preferences.email_enabled ? t('summary.enabled') : t('summary.disabled')}
                </Badge>
                <Badge className={`rounded-full border border-black/5 px-4 py-1.5 text-[12px] font-semibold shadow-sm ${preferences.web_enabled ? 'bg-white text-[#1d1d1f]' : 'bg-white/55 text-[#86868b]'}`}>
                  Web Push {preferences.web_enabled ? t('summary.enabled') : t('summary.disabled')}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <section className="rounded-[32px] border border-black/5 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
            <div className="mb-6">
              <h2 className="flex items-center gap-2 text-[24px] font-semibold tracking-[-0.03em] text-[#1d1d1f]">
                <Globe className="h-5 w-5 text-[#86868b]" />
                {t('sections.countries.title')}
              </h2>
              <p className="mt-1 text-sm leading-6 text-[#6e6e73]">
                {t('sections.countries.description')}
              </p>
            </div>
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {COUNTRIES.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => toggleCountry(country.code)}
                    className={`relative flex flex-col items-center justify-center gap-2 rounded-[24px] border p-4 transition-all duration-200 active:scale-[0.98] ${preferences.countries.includes(country.code)
                      ? 'border-[#0071e3] bg-[#f0f7ff] shadow-[0_10px_24px_rgba(0,113,227,0.12)]'
                      : 'border-black/5 bg-[#fbfbfd] hover:border-black/10 hover:bg-white hover:shadow-[0_10px_24px_rgba(15,23,42,0.05)]'}`}
                  >
                    <div className="text-3xl filter drop-shadow-sm">{country.flag}</div>
                    <div className={`text-sm font-semibold ${preferences.countries.includes(country.code) ? 'text-[#0071e3]' : 'text-[#1d1d1f]'}`}>
                      {tCountries(country.code)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <Card className="rounded-[32px] border border-black/5 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="flex items-center gap-2 text-[24px] font-semibold tracking-[-0.03em] text-[#1d1d1f]">
                🇬🇧 {t('sections.cities.title')}
              </CardTitle>
              <CardDescription className="text-sm leading-6 text-[#6e6e73]">
                {t('sections.cities.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {UK_CITIES.map((city) => (
                  <button
                    key={city.code}
                    onClick={() => toggleCity(city.code)}
                    className={`relative rounded-[22px] border p-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${preferences.cities.includes(city.code)
                      ? 'border-[#34c759] bg-[#f3fff7] text-[#199947] shadow-[0_10px_24px_rgba(52,199,89,0.10)]'
                      : 'border-black/5 bg-[#fbfbfd] text-[#4b5563] hover:border-black/10 hover:bg-white hover:shadow-[0_10px_24px_rgba(15,23,42,0.05)]'
                      }`}
                  >
                    {tCities(city.code)}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border border-black/5 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="flex items-center gap-2 text-[24px] font-semibold tracking-[-0.03em] text-[#1d1d1f]">
                <Bell className="h-5 w-5 text-[#86868b]" />
                {t('sections.telegram.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-6">
              <div className="flex flex-col gap-4 rounded-[24px] border border-black/5 bg-[#f5f5f7] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1 space-y-0.5">
                  <span className="text-base font-semibold text-[#1d1d1f]">{t('sections.telegram.enable')}</span>
                  <p className="text-sm leading-6 text-[#6e6e73]">{t('sections.telegram.description')}</p>
                </div>
                <button
                  onClick={() => setPreferences(prev => ({ ...prev, telegram_enabled: !prev.telegram_enabled }))}
                  className={`relative inline-flex h-[31px] w-[51px] shrink-0 self-end rounded-full transition-colors duration-200 focus:outline-none sm:self-auto ${preferences.telegram_enabled
                    ? 'bg-[#34c759]'
                    : 'bg-[#d2d2d7]'}`}
                >
                  <span className={`inline-block h-[27px] w-[27px] transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${preferences.telegram_enabled
                    ? 'translate-x-[22px]'
                    : 'translate-x-[2px]'}`} />
                </button>
              </div>

              {preferences.telegram_enabled && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <label className={appleLabelClassName}>{t('sections.telegram.botToken')}</label>
                    <input
                      type="text"
                      value={botToken}
                      onChange={(e) => setBotToken(e.target.value)}
                      placeholder="API TOKEN FROM @BOTFATHER"
                      className={appleFieldClassName}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className={appleLabelClassName}>{t('sections.telegram.chatId')}</label>
                    <input
                      type="text"
                      value={preferences.telegram_chat_id}
                      onChange={(e) => setPreferences(prev => ({ ...prev, telegram_chat_id: e.target.value }))}
                      placeholder="YOUR NUMERIC CHAT ID"
                      className={appleFieldClassName}
                    />
                  </div>

                  <Button
                    onClick={handleTestTelegram}
                    disabled={testing}
                    variant="outline"
                    className="h-12 w-full rounded-full border-black/8 bg-white text-[#1d1d1f] hover:bg-black/[0.03]"
                  >
                    {testing ? <Clock className="animate-spin h-5 w-5" /> : <><TestTube className="mr-2 h-4 w-4" /> {t('sections.telegram.test')}</>}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border border-black/5 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="flex items-center gap-2 text-[24px] font-semibold tracking-[-0.03em] text-[#1d1d1f]">
                <Mail className="h-5 w-5 text-[#86868b]" />
                {t('sections.email.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-6">
              <div className="flex flex-col gap-4 rounded-[24px] border border-black/5 bg-[#f5f5f7] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1 space-y-0.5">
                  <span className="text-base font-semibold text-[#1d1d1f]">{t('sections.email.enable')}</span>
                  <p className="text-sm leading-6 text-[#6e6e73]">{t('sections.email.description')}</p>
                </div>
                <button
                  onClick={() => setPreferences(prev => ({ ...prev, email_enabled: !prev.email_enabled }))}
                  className={`relative inline-flex h-[31px] w-[51px] shrink-0 self-end rounded-full transition-colors duration-200 focus:outline-none sm:self-auto ${preferences.email_enabled
                    ? 'bg-[#34c759]'
                    : 'bg-[#d2d2d7]'}`}
                >
                  <span className={`inline-block h-[27px] w-[27px] transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${preferences.email_enabled
                    ? 'translate-x-[22px]'
                    : 'translate-x-[2px]'}`} />
                </button>
              </div>

              {preferences.email_enabled && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <label className={appleLabelClassName}>{t('sections.email.address')}</label>
                    <input
                      type="email"
                      value={preferences.email_address || ''}
                      onChange={(e) => setPreferences(prev => ({ ...prev, email_address: e.target.value }))}
                      placeholder="NAME@DOMAIN.COM"
                      className={appleFieldClassName}
                    />
                  </div>
                  <Button
                    onClick={handleTestEmail}
                    disabled={testingEmail}
                    variant="outline"
                    className="h-12 w-full rounded-full border-black/8 bg-white text-[#1d1d1f] hover:bg-black/[0.03]"
                  >
                    {testingEmail ? <Clock className="animate-spin h-5 w-5" /> : <><TestTube className="mr-2 h-4 w-4" /> {t('sections.email.test')}</>}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border border-black/5 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="flex items-center gap-2 text-[24px] font-semibold tracking-[-0.03em] text-[#1d1d1f]">
                <Clock className="h-5 w-5 text-[#86868b]" />
                {t('sections.autoCheck.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-6">
              <div className="flex flex-col gap-4 rounded-[24px] border border-black/5 bg-[#f5f5f7] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1 space-y-0.5">
                  <span className="text-base font-semibold text-[#1d1d1f]">{t('sections.autoCheck.enable')}</span>
                  <p className="text-sm leading-6 text-[#6e6e73]">{t('sections.autoCheck.description')}</p>
                </div>
                <button
                  onClick={() => setPreferences(prev => ({ ...prev, auto_check_enabled: !prev.auto_check_enabled }))}
                  className={`relative inline-flex h-[31px] w-[51px] shrink-0 self-end rounded-full transition-colors duration-200 focus:outline-none sm:self-auto ${preferences.auto_check_enabled
                    ? 'bg-[#34c759]'
                    : 'bg-[#d2d2d7]'}`}
                >
                  <span className={`inline-block h-[27px] w-[27px] transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${preferences.auto_check_enabled
                    ? 'translate-x-[22px]'
                    : 'translate-x-[2px]'}`} />
                </button>
              </div>

              {preferences.auto_check_enabled && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <label className={appleLabelClassName}>{t('sections.autoCheck.frequency')}</label>
                    <input
                      type="number"
                      min="5"
                      max="60"
                      value={preferences.check_frequency}
                      onChange={(e) => setPreferences(prev => ({ ...prev, check_frequency: Number.parseInt(e.target.value, 10) || 5 }))}
                      className={`${appleFieldClassName} text-lg font-semibold`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className={appleLabelClassName}>{t('sections.autoCheck.sameSlotCooldown')}</label>
                    <input
                      type="number"
                      min="0"
                      max="168"
                      value={preferences.same_slot_cooldown_hours}
                      onChange={(e) => setPreferences(prev => ({ ...prev, same_slot_cooldown_hours: Number.parseInt(e.target.value, 10) || 0 }))}
                      className={`${appleFieldClassName} text-lg font-semibold`}
                    />
                    <p className="text-sm leading-6 text-[#6e6e73]">
                      {t('sections.autoCheck.sameSlotCooldownDescription')}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border border-black/5 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="flex items-center gap-2 text-[24px] font-semibold tracking-[-0.03em] text-[#1d1d1f]">
                <Bell className="h-5 w-5 text-[#86868b]" />
                {t('sections.webPush.title')}
              </CardTitle>
              <CardDescription className="text-sm leading-6 text-[#6e6e73]">
                {t('sections.webPush.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <div className="flex flex-col gap-4 rounded-[24px] border border-black/5 bg-[#f5f5f7] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1 space-y-0.5">
                  <span className="text-base font-semibold text-[#1d1d1f]">{t('sections.webPush.enable')}</span>
                  <p className="text-sm leading-6 text-[#6e6e73]">
                    {pushSubscribed ? t('sections.webPush.statusReady') : t('sections.webPush.statusNotReady')}
                  </p>
                </div>
                <button
                  onClick={() => setPreferences(prev => ({ ...prev, web_enabled: !prev.web_enabled }))}
                  className={`relative inline-flex h-[31px] w-[51px] shrink-0 self-end rounded-full transition-colors duration-200 focus:outline-none sm:self-auto ${preferences.web_enabled
                    ? 'bg-[#34c759]'
                    : 'bg-[#d2d2d7]'}`}
                >
                  <span className={`inline-block h-[27px] w-[27px] transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${preferences.web_enabled
                    ? 'translate-x-[22px]'
                    : 'translate-x-[2px]'}`} />
                </button>
              </div>

              {preferences.web_enabled && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <p className="text-sm leading-6 text-[#6e6e73]">
                    {pushSupported ? t('sections.webPush.hint') : t('sections.webPush.unsupported')}
                  </p>

                  <div className="rounded-[24px] border border-[#dbe7f7] bg-[#f7fbff] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0066cc]">
                      {t('sections.webPush.stepsTitle')}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#1d1d1f]">
                      {t('sections.webPush.steps')}
                    </p>
                  </div>

                  {pushConfigError && (
                    <p className="text-sm text-red-600">
                      {pushConfigError}
                    </p>
                  )}

                  <Button
                    onClick={handlePushSubscriptionToggle}
                    disabled={pushLoading || !pushSupported}
                    variant="outline"
                    className="h-12 w-full rounded-full border-black/8 bg-white text-[#1d1d1f] hover:bg-black/[0.03]"
                  >
                    {pushLoading
                      ? <Clock className="animate-spin h-5 w-5" />
                      : pushSubscribed
                        ? t('sections.webPush.unsubscribe')
                        : t('sections.webPush.subscribe')}
                  </Button>

                  <Button
                    onClick={handleTestPush}
                    disabled={pushTesting || !pushSupported || !pushSubscribed}
                    variant="outline"
                    className="h-12 w-full rounded-full border-black/8 bg-white text-[#1d1d1f] hover:bg-black/[0.03]"
                  >
                    {pushTesting
                      ? <Clock className="animate-spin h-5 w-5" />
                      : t('sections.webPush.test')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border border-black/5 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
            <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86868b]">
                  {t('actions.save')}
                </p>
                <p className="mt-2 text-sm leading-6 text-[#6e6e73]">
                  {t('description')}
                </p>
              </div>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="h-14 min-w-[220px] rounded-full bg-[#0071e3] text-white shadow-[0_10px_25px_rgba(0,113,227,0.24)] hover:bg-[#0077ed]"
              >
                {saving ? <Clock className="animate-spin h-5 w-5" /> : <><Save className="mr-2 h-5 w-5" /> {t('actions.save')}</>}
              </Button>
            </CardContent>
          </Card>

          <div className="pt-2">
            <Button
              onClick={handleLogout}
              disabled={loggingOut}
              variant="outline"
              className="h-12 w-full rounded-full border-red-200 bg-white/80 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              {loggingOut ? <Clock className="animate-spin h-5 w-5" /> : tNav('logout')}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
