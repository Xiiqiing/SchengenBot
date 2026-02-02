'use client';

import { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Clock, TrendingUp, Settings, History } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { COUNTRIES, UK_CITIES, formatDateTR } from '@/lib/constants/countries';
import Link from 'next/link';
import { getOrCreateUserId } from '@/lib/user-id';

export default function DashboardPage() {
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
      alert('请先在设置中选择国家和城市!');
      return;
    }

    setCheckingUK(true);
    setUkResults([]);
    setCheckProgress('准备开始...');

    // Calculate total steps
    const totalSteps = cities.length * countries.length;
    let currentStep = 0;

    try {
      for (const city of cities) {
        for (const country of countries) {
          currentStep++;
          const cityObj = UK_CITIES.find(c => c.code === city);
          const countryObj = COUNTRIES.find(c => c.code === country);
          const cityName = cityObj ? cityObj.nameEn : city;
          const countryName = countryObj ? countryObj.nameTr : country;

          setCheckProgress(`正在检查 (${currentStep}/${totalSteps}): ${cityName} → ${countryName}`);


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
      setCheckProgress('Check Complete!');
    } catch (error) {
      console.error('UK Check error:', error);
      alert('检查失败!');
    } finally {
      setCheckingUK(false);
      setTimeout(() => setCheckProgress(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500">Schengen Visa Appointment Bot</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/dashboard/history">
                <Button variant="outline" size="sm">
                  <History className="w-4 h-4 mr-2" />
                  历史记录
                </Button>
              </Link>
              <Link href="/dashboard/settings">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  设置
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总检查次数</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ukCheckCount + (stats?.total_appointments || 0)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">已找到预约</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {appointments.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">通知</CardTitle>
              <Bell className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats?.total_notifications || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">自动检查</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <Badge variant={preferences?.auto_check_enabled ? "default" : "secondary"}>
                {preferences?.auto_check_enabled ? '已开启' : '已关闭'}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Panel - UK Check */}
          <div className="lg:col-span-2 space-y-6">
            {/* UK Appointment Check */}
            <Card className="border-2 border-purple-200 bg-purple-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🇬🇧 UK Appointment Check
                </CardTitle>
                <CardDescription>
                  检查所选城市和国家的签证预约
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Show selected countries and cities before checking */}
                {preferences ? (
                  <>
                    <div>
                      <p className="text-sm font-medium mb-2">已选国家:</p>
                      <div className="flex flex-wrap gap-2">
                        {preferences.countries?.length > 0 ? (
                          preferences.countries.map((code: string) => {
                            const country = COUNTRIES.find(c => c.code === code);
                            return (
                              <Badge key={code} variant="outline">
                                {country?.flag} {country?.nameTr || code}
                              </Badge>
                            );
                          })
                        ) : (
                          <span className="text-sm text-gray-500">默认: 🇵🇹 Portugal</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">已选城市:</p>
                      <div className="flex flex-wrap gap-2">
                        {preferences.cities?.length > 0 ? (
                          preferences.cities.map((code: string) => {
                            const city = UK_CITIES.find(c => c.code === code);
                            return (
                              <Badge key={code} variant="outline">
                                {city?.nameEn || code}
                              </Badge>
                            );
                          })
                        ) : (
                          <span className="text-sm text-gray-500">默认: Manchester</span>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 mb-4">尚未设置偏好，将使用默认设置 (Manchester → Portugal)</p>
                    <Link href="/dashboard/settings">
                      <Button variant="outline">
                        <Settings className="mr-2 h-4 w-4" />
                        前往设置
                      </Button>
                    </Link>
                  </div>
                )}

                <Button
                  onClick={handleUKCheck}
                  disabled={checkingUK}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  size="lg"
                >
                  {checkingUK ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      {checkProgress || '正在检查...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      开始检查
                    </>
                  )}
                </Button>

                {/* UK Results Display */}
                {ukResults.length > 0 && (
                  <div className="space-y-3">
                    {ukResults.map((result, idx) => {
                      const countryInfo = COUNTRIES.find(c => c.code.toLowerCase() === result.country?.toLowerCase());
                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-lg border ${result.isAvailable ? 'bg-green-50 border-green-200' : result.error ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-semibold text-lg">
                              {countryInfo?.flag || '🏳️'} {result.country} - {result.city}
                            </span>
                            <Badge variant={result.isAvailable ? "default" : "secondary"}>
                              {result.isAvailable ? `${result.totalSlots} Slots` : 'No Slots'}
                            </Badge>
                          </div>

                          {result.isAvailable ? (
                            <div className="space-y-3">
                              <p className="text-sm text-green-700 font-medium">
                                ✅ {result.totalSlots} appointments available over {result.totalDays} days
                              </p>

                              {result.slots?.slice(0, 3).map((slot: any, i: number) => (
                                <div key={i} className="text-sm bg-white p-3 rounded border">
                                  <p className="font-medium">📅 {slot.date}</p>
                                  <p className="text-gray-600">{slot.slotsAvailable} slots - seen {slot.lastSeen}</p>
                                </div>
                              ))}

                              {result.bookingLink && (
                                <a
                                  href={result.bookingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block w-full text-center py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                >
                                  Book at VFS →
                                </a>
                              )}

                              {result.lastChecked && (
                                <p className="text-xs text-gray-400">最后检查: {result.lastChecked}</p>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-600">
                              <p>❌ No appointments available</p>
                              {result.lastChecked && (
                                <p className={`mt-1 text-xs ${result.error ? 'text-red-500' : 'text-gray-400'}`}>
                                  最后检查: {result.lastChecked}
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
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>最近找到的预约</CardTitle>
                <CardDescription>最近10条记录</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {appointments.length > 0 ? (
                    appointments.map((apt) => (
                      <div key={apt.id} className="p-3 rounded-lg border text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">
                            {COUNTRIES.find(c => c.code === apt.country)?.flag} {apt.country}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {formatDateTR(apt.appointment_date)}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">{apt.center_name}</p>
                        {apt.book_now_link && (
                          <a
                            href={apt.book_now_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            立即预约 →
                          </a>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      暂未找到预约
                    </p>
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
