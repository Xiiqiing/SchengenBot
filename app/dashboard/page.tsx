'use client';

import { useState, useEffect } from 'react';
import { Bell, CheckCircle2, XCircle, Clock, TrendingUp, Settings, History } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { COUNTRIES, CITIES, UK_CITIES, formatDateTR } from '@/lib/constants/countries';
import Link from 'next/link';
import { getOrCreateUserId } from '@/lib/user-id';

export default function DashboardPage() {
  const [userId] = useState(() => getOrCreateUserId());
  const [preferences, setPreferences] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  // UK appointment state
  const [checkingUK, setCheckingUK] = useState(false);
  const [ukResult, setUkResult] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      // Tercihleri yükle
      const prefsRes = await fetch(`/api/preferences?userId=${userId}`);
      if (prefsRes.ok) {
        const data = await prefsRes.json();
        setPreferences(data.preferences);
      }

      // Randevuları yükle
      const apptsRes = await fetch(`/api/appointments?userId=${userId}&limit=10`);
      if (apptsRes.ok) {
        const data = await apptsRes.json();
        setAppointments(data.appointments);
      }

      // İstatistikleri yükle
      const statsRes = await fetch(`/api/stats?userId=${userId}`);
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleManualCheck = async () => {
    if (!preferences?.countries?.length || !preferences?.cities?.length) {
      alert('Lütfen önce ayarlardan ülke ve şehir seçin!');
      return;
    }

    setChecking(true);
    setResults([]);

    try {
      const response = await fetch('/api/appointments/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countries: preferences.countries,
          cities: preferences.cities,
          userId: userId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.results);
        await loadData(); // Verileri yenile
      }
    } catch (error) {
      console.error('Check error:', error);
      alert('Kontrol sırasında hata oluştu!');
    } finally {
      setChecking(false);
    }
  };

  // UK (Manchester -> Portugal) check handler
  const handleUKCheck = async () => {
    setCheckingUK(true);
    setUkResult(null);

    try {
      const response = await fetch('/api/appointments/check?source=UK&city=manchester&country=portugal');
      const data = await response.json();

      if (data.success) {
        setUkResult(data.result);
      }
    } catch (error) {
      console.error('UK Check error:', error);
      alert('UK check failed!');
    } finally {
      setCheckingUK(false);
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
              <div className="text-2xl font-bold">{stats?.total_appointments || 0}</div>
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
          {/* Sol Panel - Kontrol */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>手动检查</CardTitle>
                <CardDescription>
                  立即检查您选择的国家的预约
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {preferences ? (
                  <>
                    <div>
                      <p className="text-sm font-medium mb-2">已选国家:</p>
                      <div className="flex flex-wrap gap-2">
                        {preferences.countries?.map((code: string) => {
                          const country = COUNTRIES.find(c => c.code === code);
                          return (
                            <Badge key={code} variant="outline">
                              {country?.flag} {country?.nameTr}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">已选城市:</p>
                      <div className="flex flex-wrap gap-2">
                        {preferences.cities?.map((code: string) => {
                          const city = CITIES.find(c => c.code === code);
                          return (
                            <Badge key={code} variant="outline">
                              {city?.nameTr}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>

                    <Button
                      onClick={handleManualCheck}
                      disabled={checking}
                      className="w-full"
                      size="lg"
                    >
                      {checking ? (
                        <>
                          <Clock className="mr-2 h-4 w-4 animate-spin" />
                          检查中...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          开始检查
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">尚未设置偏好</p>
                    <Link href="/dashboard/settings">
                      <Button>
                        <Settings className="mr-2 h-4 w-4" />
                        前往设置
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* UK Appointment Check - Manchester -> Portugal */}
            <Card className="border-2 border-purple-200 bg-purple-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🇬🇧 UK → 🇵🇹 Portugal Check
                </CardTitle>
                <CardDescription>
                  Check Portugal visa appointments from Manchester.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleUKCheck}
                  disabled={checkingUK}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  size="lg"
                >
                  {checkingUK ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Checking Manchester...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Check Manchester → Portugal
                    </>
                  )}
                </Button>

                {/* UK Result Display */}
                {ukResult && (
                  <div className={`p-4 rounded-lg border ${ukResult.isAvailable ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-lg">
                        🇵🇹 Portugal - Manchester
                      </span>
                      <Badge variant={ukResult.isAvailable ? "default" : "secondary"}>
                        {ukResult.isAvailable ? `${ukResult.totalSlots} Slots` : 'No Slots'}
                      </Badge>
                    </div>

                    {ukResult.isAvailable ? (
                      <div className="space-y-3">
                        <p className="text-sm text-green-700 font-medium">
                          ✅ {ukResult.totalSlots} appointments available over {ukResult.totalDays} days
                        </p>

                        {ukResult.slots?.map((slot: any, i: number) => (
                          <div key={i} className="text-sm bg-white p-3 rounded border">
                            <p className="font-medium">📅 {slot.date}</p>
                            <p className="text-gray-600">{slot.slotsAvailable} slots - seen {slot.lastSeen}</p>
                          </div>
                        ))}

                        {ukResult.bookingLink && (
                          <a
                            href={ukResult.bookingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full text-center py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                          >
                            Book at VFS →
                          </a>
                        )}

                        {ukResult.lastChecked && (
                          <p className="text-xs text-gray-400">最后检查: {ukResult.lastChecked}</p>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">
                        <p>❌ No appointments available</p>
                        {ukResult.lastChecked && (
                          <p className="mt-1 text-xs text-gray-400">最后检查: {ukResult.lastChecked}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sonuçlar */}
            {results.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>检查结果</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {results.map((result, idx) => (
                      <div key={idx} className="p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">
                              {COUNTRIES.find(c => c.code === result.country)?.flag}
                            </span>
                            <span className="font-semibold">
                              {COUNTRIES.find(c => c.code === result.country)?.nameTr} - {result.city}
                            </span>
                          </div>
                          <Badge variant={result.appointments.length > 0 ? "default" : "secondary"}>
                            {result.appointments.length} 个预约
                          </Badge>
                        </div>

                        {result.appointments.length > 0 ? (
                          <div className="space-y-2 mt-3">
                            {result.appointments.map((apt: any, i: number) => (
                              <div key={i} className="text-sm bg-green-50 p-3 rounded">
                                <p className="font-medium">📅 {formatDateTR(apt.appointment_date)}</p>
                                <p className="text-gray-600">{apt.center_name}</p>
                                <a
                                  href={apt.book_now_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  立即预约 →
                                </a>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">暂无可用预约</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sağ Panel - Son Randevular */}
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
