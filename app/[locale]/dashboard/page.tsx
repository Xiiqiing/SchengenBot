'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, Clock, Settings, History, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { COUNTRIES, UK_CITIES } from '@/lib/constants/countries';
import Link from 'next/link';
import { getOrCreateUserId } from '@/lib/user-id';

import { useLocale, useTranslations, useFormatter } from 'next-intl';

export default function DashboardPage() {
  const t = useTranslations('DashboardHome');
  const tCountries = useTranslations('Countries');
  const tCities = useTranslations('Cities');
  const format = useFormatter();
  const locale = useLocale();
  const [userId] = useState(() => getOrCreateUserId());
  const [preferences, setPreferences] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  // UK appointment state
  const [checkingUK, setCheckingUK] = useState(false);
  const [checkProgress, setCheckProgress] = useState('');
  const [ukResults, setUkResults] = useState<any[]>([]);
  const [ukCheckCount, setUkCheckCount] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`ukCheckCount_${getOrCreateUserId()}`);
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  // Save ukCheckCount to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && ukCheckCount > 0) {
      localStorage.setItem(`ukCheckCount_${userId}`, ukCheckCount.toString());
    }
  }, [ukCheckCount, userId]);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      const prefsRes = await fetch(`/api/preferences?userId=${userId}`);
      if (prefsRes.ok) {
        const data = await prefsRes.json();
        setPreferences(data.preferences);
      }

      const apptsRes = await fetch(`/api/appointments?userId=${userId}&limit=10`);
      if (apptsRes.ok) {
        const data = await apptsRes.json();
        setAppointments(data.appointments);
      }

      const statsRes = await fetch(`/api/stats?userId=${userId}`);
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // UK check handler - uses selected cities and countries from preferences
  const handleUKCheck = async () => {
    const cities = preferences?.cities?.length > 0 ? preferences.cities : ['manchester'];
    const countries = preferences?.countries?.length > 0 ? preferences.countries : ['Portugal'];

    if (cities.length === 0 || countries.length === 0) {
      alert(t('alertSelect'));
      return;
    }

    setCheckingUK(true);
    setUkResults([]);
    setCheckProgress(t('preparing'));

    // Calculate total steps
    const totalSteps = cities.length * countries.length;
    let currentStep = 0;

    try {
      for (const city of cities) {
        for (const country of countries) {
          currentStep++;
          const cityObj = UK_CITIES.find(c => c.code === city);
          const countryObj = COUNTRIES.find(c => c.code === country);
          const cityName = cityObj ? tCities(cityObj.code) : city;
          const countryName = countryObj ? tCountries(countryObj.code) : country;

          setCheckProgress(`${t('checking')} (${currentStep}/${totalSteps}): ${cityName} → ${countryName}`);


          // Always wait a bit (1-3s) to make sure user sees the progress
          console.log(`Step ${currentStep}: Delaying...`);
          await new Promise(r => setTimeout(r, Math.floor(Math.random() * 2000) + 1000));

          try {
            const response = await fetch(`/api/appointments/check?source=UK&city=${city}&country=${country}&userId=${userId}`);
            const data = await response.json();

            let resultItem;

            if (data.success) {
              resultItem = {
                ...data.result,
                city,
                country,
                checkedAt: data.checked_at
              };
            } else {
              resultItem = {
                city,
                country,
                isAvailable: false,
                totalSlots: 0,
                slots: [],
                lastChecked: data.error || 'Error',
                error: true
              };
            }

            // Incrementally add result
            setUkResults((prev: any[]) => [...prev, resultItem]);

          } catch (err) {
            console.error(`Error checking ${city}/${country}:`, err);
            setUkResults((prev: any[]) => [...prev, {
              city,
              country,
              isAvailable: false,
              totalSlots: 0,
              slots: [],
              lastChecked: 'Network error',
              error: true
            }]);
          }
        }
      }

      setUkCheckCount(prev => prev + 1);
      setCheckProgress(t('checkComplete'));
    } catch (error) {
      console.error('UK Check error:', error);
      alert(t('checkFailed'));
    } finally {
      setCheckingUK(false);
      setTimeout(() => setCheckProgress(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#ffffff_0%,#f7f8fb_44%,#eef2f7_100%)] text-on-surface">
      <main className="container mx-auto px-4 py-10 max-w-7xl">
        <section className="pb-12 pt-8 md:pb-16 md:pt-14">
          <div className="max-w-5xl">
            <h1 className="text-[44px] font-semibold tracking-[-0.065em] text-[#1d1d1f] md:text-[80px] md:leading-[0.92]">
              {t('title')}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-[#6e6e73] md:text-[21px] md:leading-8">
              {t('overview')}
            </p>
          </div>
        </section>

        <div className="mb-10 flex flex-col gap-4 border-b border-black/[0.06] pb-10 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-[#6e6e73]">
              {t('ukCheck.countriesCount', { count: preferences?.countries?.length || 0 })} · {t('ukCheck.citiesCount', { count: preferences?.cities?.length || 0 })} · {t('ukCheck.cooldownHours', { count: preferences?.same_slot_cooldown_hours || 24 })}
            </p>
            <div className="flex flex-wrap gap-3 text-sm font-semibold text-[#1d1d1f]">
              <Link href={`/${locale}/dashboard/settings`} className="inline-flex items-center gap-1.5 hover:text-[#0071e3]">
                {t('ukCheck.openSettings')}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={`/${locale}/dashboard/history`} className="inline-flex items-center gap-1.5 text-[#6e6e73] hover:text-[#1d1d1f]">
                {t('ukCheck.viewHistory')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-[1.55fr_0.75fr]">
          <Card className="overflow-hidden rounded-[44px] border border-black/[0.04] bg-white text-[#1d1d1f] shadow-[0_20px_60px_rgba(15,23,42,0.04)]">
            <CardContent className="p-8 md:p-12">
              <div className="max-w-3xl">
                <h2 className="text-[30px] font-semibold tracking-[-0.05em] text-[#1d1d1f] md:text-[52px] md:leading-[0.96]">
                  {t('ukCheck.title')}
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-7 text-[#6e6e73] md:text-[19px] md:leading-8">
                  {t('ukCheck.description')}
                </p>
              </div>

              <div className="mt-12 grid grid-cols-3 gap-8 border-t border-black/[0.06] pt-8 md:max-w-[640px]">
                <div>
                  <p className="text-[12px] font-medium text-[#86868b]">{t('stats.notificationsSent')}</p>
                  <p className="mt-2 text-[40px] font-semibold tracking-[-0.06em] text-[#1d1d1f]">{stats?.total_notifications || 0}</p>
                </div>
                <div>
                  <p className="text-[12px] font-medium text-[#86868b]">{t('stats.slotsFound')}</p>
                  <p className="mt-2 text-[40px] font-semibold tracking-[-0.06em] text-[#1d1d1f]">{appointments.length}</p>
                </div>
                <div>
                  <p className="text-[12px] font-medium text-[#86868b]">{t('stats.autoMonitor')}</p>
                  <p className="mt-3 text-lg font-semibold text-[#1d1d1f]">{preferences?.auto_check_enabled ? t('stats.active') : t('stats.inactive')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col justify-between rounded-[36px] border border-black/[0.04] bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.04)]">
            <div>
              <div className="mt-5 space-y-5">
                <div>
                  <p className="text-sm text-[#6e6e73]">{t('ukCheck.countriesCount', { count: preferences?.countries?.length || 0 })}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[#1d1d1f]">
                    {preferences?.countries?.slice(0, 2).map((code: string) => tCountries(code)).join(', ') || tCountries('Portugal')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#6e6e73]">{t('ukCheck.targetCities')}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[#1d1d1f]">
                    {preferences?.cities?.slice(0, 2).map((code: string) => tCities(code)).join(', ') || tCities('manchester')}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-3">
              <Link href={`/${locale}/dashboard/settings`}>
                <Button className="h-12 w-full justify-between rounded-full bg-[#0071e3] px-5 text-white shadow-none hover:bg-[#0077ed]">
                  <span className="font-semibold">{t('ukCheck.openSettings')}</span>
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
              <Link href={`/${locale}/dashboard/history`}>
                <Button variant="outline" className="h-12 w-full justify-between rounded-full border-black/10 bg-[#f5f5f7] px-5 hover:bg-[#ececf0]">
                  <span className="font-semibold">{t('ukCheck.viewHistory')}</span>
                  <History className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Panel - UK Check */}
          <div className="lg:col-span-8 space-y-8">
            <Card className="overflow-hidden rounded-[40px] border border-black/[0.04] bg-white p-2 shadow-[0_20px_60px_rgba(15,23,42,0.04)]">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="flex items-center gap-3 text-[28px] font-semibold tracking-[-0.03em] text-[#1d1d1f]">
                  {t('ukCheck.title')}
                </CardTitle>
                <CardDescription className="text-base leading-7 text-[#6e6e73]">
                  {t('ukCheck.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-2 space-y-6">
                {preferences ? (
                  <div className="grid grid-cols-1 gap-6 rounded-[32px] border border-black/[0.04] bg-[#f7f7f8] p-6 md:grid-cols-2">
                    <div>
                      <p className="mb-3 text-sm font-medium text-[#6e6e73]">{t('ukCheck.monitoredCountries')}</p>
                      <div className="flex flex-wrap gap-2">
                        {preferences.countries?.length > 0 ? (
                          preferences.countries.map((code: string) => {
                            const country = COUNTRIES.find(c => c.code === code);
                            return (
                              <div key={code} className="flex items-center gap-1.5 rounded-full border border-black/5 bg-white px-3 py-1.5 text-xs font-semibold text-[#1d1d1f] shadow-sm">
                                <span>{country?.flag}</span>
                                {country ? tCountries(country.code) : code}
                              </div>
                            );
                          })
                        ) : (
                          <div className="px-3 py-1.5 bg-surface-variant/50 text-on-surface-variant rounded-full text-xs font-bold">PT {tCountries('Portugal')}</div>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="mb-3 text-sm font-medium text-[#6e6e73]">{t('ukCheck.targetCities')}</p>
                      <div className="flex flex-wrap gap-2">
                        {preferences.cities?.length > 0 ? (
                          preferences.cities.map((code: string) => {
                            const city = UK_CITIES.find(c => c.code === code);
                            return (
                              <div key={code} className="rounded-full border border-black/5 bg-white px-3 py-1.5 text-xs font-semibold text-[#1d1d1f] shadow-sm">
                                {city ? tCities(city.code) : code}
                              </div>
                            );
                          })
                        ) : (
                          <div className="px-3 py-1.5 bg-surface-variant/50 text-on-surface-variant rounded-full text-xs font-bold">{tCities('manchester')}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[28px] border border-dashed border-black/10 bg-[#fbfbfd] py-12 text-center">
                    <p className="mb-6 font-medium text-[#6e6e73]">{t('ukCheck.noPrefs')}</p>
                    <Link href={`/${locale}/dashboard/settings`}>
                      <Button variant="outline" className="h-11 rounded-full border-black/10 bg-white px-6 text-[13px] font-semibold text-[#1d1d1f] hover:bg-black/[0.03]">
                        <Settings className="mr-2 h-4 w-4" />
                        {t('ukCheck.configureNow')}
                      </Button>
                    </Link>
                  </div>
                )}

                <Button
                  onClick={handleUKCheck}
                  disabled={checkingUK}
                  className={`h-12 w-full rounded-full text-[15px] font-semibold transition-all ${checkingUK ? 'bg-[#e8e8ed] text-[#86868b]' : 'bg-[#0071e3] text-white shadow-[0_10px_25px_rgba(0,113,227,0.24)] hover:bg-[#0077ed] active:scale-[0.98]'}`}
                >
                  {checkingUK ? (
                    <>
                      <Clock className="mr-3 h-6 w-6 animate-spin" />
                      {checkProgress || t('ukCheck.checking')}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-3 h-6 w-6" />
                      {t('ukCheck.startCheck')}
                    </>
                  )}
                </Button>

                {/* UK Results Display */}
                {ukResults.length > 0 && (
                  <div className="grid gap-4 pt-4">
                    {ukResults.map((result: any, idx: number) => {
                      const countryInfo = COUNTRIES.find(c => c.code.toLowerCase() === result.country?.toLowerCase());
                      return (
                        <div
                          key={idx}
                          className={`rounded-[28px] border p-6 transition-all ${result.isAvailable ? 'border-green-200 bg-[#f4fff7]' : result.error ? 'border-red-200 bg-[#fff5f5]' : 'border-black/5 bg-[#fbfbfd] shadow-sm'}`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="flex items-center gap-2 text-xl font-semibold tracking-[-0.02em] text-[#1d1d1f]">
                              {countryInfo?.flag || '🏳️'} {countryInfo ? tCountries(countryInfo.code) : result.country}
                              <span className="px-2 text-black/20">|</span>
                              {tCities(result.city) || result.city}
                            </h3>
                            <div className={`rounded-full px-4 py-1.5 text-xs font-semibold ${result.isAvailable ? 'bg-[#34c759] text-white' : 'bg-white text-[#6e6e73] border border-black/5'}`}>
                              {result.isAvailable ? `${result.totalSlots} SLOTS` : 'NO DATA'}
                            </div>
                          </div>

                          {result.isAvailable ? (
                            <div className="space-y-4">
                              <p className="flex items-center gap-2 text-sm font-semibold text-green-700">
                                <Zap className="w-4 h-4" />
                                {t('ukCheck.slotsFound', { count: result.totalSlots, days: result.totalDays })}
                              </p>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {result.slots?.slice(0, 3).map((slot: any, i: number) => (
                                  <div key={i} className="rounded-[22px] border border-green-100 bg-white p-4 shadow-sm">
                                    <p className="font-semibold text-[#1d1d1f]">📅 {slot.date}</p>
                                    <p className="mt-1 text-xs font-semibold text-[#6e6e73]">{t('ukCheck.slotsAvailable', { count: slot.slotsAvailable })}</p>
                                  </div>
                                ))}
                              </div>

                              {result.bookingLink && (
                                <a
                                  href={result.bookingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="m3-button-pill inline-flex items-center justify-center w-full h-12 bg-green-600 text-white hover:bg-green-700 font-black uppercase tracking-widest text-sm"
                                >
                                  {t('ukCheck.bookExternal')}
                                </a>
                              )}
                            </div>
                          ) : (
                            <div className="text-on-surface-variant font-medium">
                              <p className="flex items-center gap-2 text-sm text-[#6e6e73]">
                                <Clock className="w-4 h-4 opacity-50" />
                                {t('ukCheck.noSlots')}
                              </p>
                              {result.lastChecked && (
                                <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/35">
                                  {t('ukCheck.lastScan')}: {result.lastChecked}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Recent Appointments */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="flex h-full flex-col rounded-[36px] border border-black/[0.04] bg-white p-2 shadow-[0_20px_60px_rgba(15,23,42,0.04)]">
              <CardHeader className="p-6">
                <CardTitle className="text-[24px] font-semibold tracking-[-0.03em] text-[#1d1d1f]">{t('recent.title')}</CardTitle>
                <CardDescription className="text-sm leading-6 text-[#6e6e73]">{t('recent.description')}</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 flex-1 overflow-y-auto max-h-[70vh] custom-scrollbar">
                <div className="space-y-4">
                  {appointments.length > 0 ? (
                    appointments.map((apt: any) => (
                      <div key={apt.id} className="group rounded-[24px] border border-black/5 bg-[#fbfbfd] p-4 transition-all hover:border-black/10 hover:bg-white hover:shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="flex items-center gap-1.5 text-sm font-semibold text-[#1d1d1f]">
                            {COUNTRIES.find(c => c.code === apt.country)?.flag} {tCountries(apt.country) || apt.country}
                          </span>
                          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-[#6e6e73] border border-black/5">
                            {format.dateTime(new Date(apt.appointment_date), { dateStyle: 'medium' })}
                          </span>
                        </div>
                        <p className="mb-3 text-xs font-medium text-[#6e6e73]">{apt.center_name}</p>
                        {apt.book_now_link && (
                          <a
                            href={apt.book_now_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs font-semibold text-[#0071e3] hover:underline"
                          >
                            {t('recent.bookNow')} <Zap className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-20 opacity-30 select-none">
                      <History className="w-16 h-16 mx-auto mb-4" />
                      <p className="font-black uppercase tracking-widest text-sm">{t('recent.empty')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
