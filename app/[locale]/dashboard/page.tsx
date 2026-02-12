'use client';

import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Clock, TrendingUp, Settings, History, Zap, LayoutGrid } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/page-header';
import { COUNTRIES, UK_CITIES, formatDate } from '@/lib/constants/countries';
import Link from 'next/link';
import { getOrCreateUserId } from '@/lib/user-id';

import { useTranslations, useFormatter } from 'next-intl';

export default function DashboardPage() {
  const t = useTranslations('DashboardHome');
  const tDash = useTranslations('Dashboard');
  const tCountries = useTranslations('Countries');
  const tCities = useTranslations('Cities');
  const format = useFormatter();
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
    <div className="min-h-screen bg-background text-on-surface">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-[48px] z-40 border-b border-black/5">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-black">{t('title')}</h1>
                <p className="text-sm font-medium text-gray-500">{t('overview')}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-7xl">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: t('stats.totalChecks'), value: ukCheckCount + (stats?.total_appointments || 0), icon: TrendingUp, color: 'text-primary' },
            { label: t('stats.slotsFound'), value: appointments.length, icon: CheckCircle2, color: 'text-tertiary' },
            { label: t('stats.notificationsSent'), value: stats?.total_notifications || 0, icon: Bell, color: 'text-secondary' },
            { label: t('stats.autoMonitor'), value: preferences?.auto_check_enabled ? t('stats.active') : t('stats.inactive'), icon: Clock, color: preferences?.auto_check_enabled ? 'text-green-600' : 'text-on-surface-variant/50' }
          ].map((stat, i) => (
            <Card key={i} className="bg-white rounded-2xl shadow-sm p-6 border-none hover:shadow-md transition-shadow duration-300">
              <div className="flex flex-row items-center justify-between mb-4">
                <span className="text-sm font-bold uppercase tracking-widest text-gray-400">{stat.label}</span>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="text-3xl font-bold text-black">{stat.value}</div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Panel - UK Check */}
          <div className="lg:col-span-8 space-y-8">
            <Card className="bg-white rounded-2xl shadow-sm border-none p-2 block overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-2xl font-bold flex items-center gap-3 text-black">
                  {t('ukCheck.title')}
                </CardTitle>
                <CardDescription className="text-base text-gray-500">
                  {t('ukCheck.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-2 space-y-6">
                {preferences ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-[#F5F5F7] rounded-xl border-none">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60 mb-3">{t('ukCheck.monitoredCountries')}</p>
                      <div className="flex flex-wrap gap-2">
                        {preferences.countries?.length > 0 ? (
                          preferences.countries.map((code: string) => {
                            const country = COUNTRIES.find(c => c.code === code);
                            return (
                              <div key={code} className="px-3 py-1.5 bg-primary-container text-on-primary-container rounded-full text-xs font-bold flex items-center gap-1.5">
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
                      <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60 mb-3">{t('ukCheck.targetCities')}</p>
                      <div className="flex flex-wrap gap-2">
                        {preferences.cities?.length > 0 ? (
                          preferences.cities.map((code: string) => {
                            const city = UK_CITIES.find(c => c.code === code);
                            return (
                              <div key={code} className="px-3 py-1.5 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold">
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
                  <div className="text-center py-12 bg-surface rounded-[24px] border-2 border-dashed border-outline/20">
                    <p className="text-on-surface-variant font-medium mb-6">{t('ukCheck.noPrefs')}</p>
                    <Link href="/dashboard/settings">
                      <Button className="h-10 px-6 rounded-full bg-[#E9E9EA] text-black hover:bg-[#dcdcdd] font-medium text-[13px] shadow-none">
                        <Settings className="mr-2 h-4 w-4" />
                        {t('ukCheck.configureNow')}
                      </Button>
                    </Link>
                  </div>
                )}

                <Button
                  onClick={handleUKCheck}
                  disabled={checkingUK}
                  className={`w-full h-12 rounded-full text-[15px] font-semibold transition-all shadow-sm ${checkingUK ? 'bg-gray-100 text-gray-400' : 'bg-[#0071e3] text-white hover:bg-[#0077ED] active:scale-[0.98]'}`}
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
                          className={`p-6 rounded-[24px] transition-all border-l-8 ${result.isAvailable ? 'bg-green-50 border-green-600' : result.error ? 'bg-red-50 border-red-600' : 'bg-surface border-outline/20 shadow-sm'}`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-black text-xl flex items-center gap-2">
                              {countryInfo?.flag || '🏳️'} {countryInfo ? tCountries(countryInfo.code) : result.country}
                              <span className="text-on-surface-variant/30 px-2">|</span>
                              {tCities(result.city) || result.city}
                            </h3>
                            <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter ${result.isAvailable ? 'bg-green-600 text-white' : 'bg-surface-variant/50 text-on-surface-variant'}`}>
                              {result.isAvailable ? `${result.totalSlots} SLOTS` : 'NO DATA'}
                            </div>
                          </div>

                          {result.isAvailable ? (
                            <div className="space-y-4">
                              <p className="text-sm text-green-700 font-black flex items-center gap-2">
                                <Zap className="w-4 h-4" />
                                {t('ukCheck.slotsFound', { count: result.totalSlots, days: result.totalDays })}
                              </p>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {result.slots?.slice(0, 3).map((slot: any, i: number) => (
                                  <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-green-100">
                                    <p className="font-black text-on-surface">📅 {slot.date}</p>
                                    <p className="text-xs text-on-surface-variant font-bold mt-1 uppercase">{t('ukCheck.slotsAvailable', { count: slot.slotsAvailable })}</p>
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
                              <p className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 opacity-50" />
                                {t('ukCheck.noSlots')}
                              </p>
                              {result.lastChecked && (
                                <p className={`mt-3 text-[10px] font-black uppercase tracking-widest opacity-40`}>
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
            <Card className="bg-white rounded-2xl shadow-sm border-none p-2 h-full flex flex-col">
              <CardHeader className="p-6">
                <CardTitle className="text-xl font-bold text-[#1d1d1f]">{t('recent.title')}</CardTitle>
                <CardDescription className="text-sm font-medium text-gray-500">{t('recent.description')}</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 flex-1 overflow-y-auto max-h-[70vh] custom-scrollbar">
                <div className="space-y-4">
                  {appointments.length > 0 ? (
                    appointments.map((apt: any) => (
                      <div key={apt.id} className="p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all group">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-[#1d1d1f] flex items-center gap-1.5">
                            {COUNTRIES.find(c => c.code === apt.country)?.flag} {tCountries(apt.country) || apt.country}
                          </span>
                          <span className="text-[10px] font-bold text-gray-500 uppercase bg-gray-200/50 px-2 py-0.5 rounded-full">
                            {format.dateTime(new Date(apt.appointment_date), { dateStyle: 'medium' })}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-on-surface-variant mb-3">{apt.center_name}</p>
                        {apt.book_now_link && (
                          <a
                            href={apt.book_now_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-black text-primary hover:underline flex items-center gap-1"
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
