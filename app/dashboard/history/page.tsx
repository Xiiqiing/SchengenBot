'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Bell, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { COUNTRIES, formatDateTR } from '@/lib/constants/countries';
import Link from 'next/link';

const MOCK_USER_ID = 'user-123';

export default function HistoryPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'appointments' | 'notifications'>('appointments');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Randevuları yükle
      const apptsRes = await fetch(`/api/appointments?userId=${MOCK_USER_ID}&limit=100`);
      if (apptsRes.ok) {
        const data = await apptsRes.json();
        setAppointments(data.appointments);
      }

      // Bildirimleri yükle (TODO: API endpoint ekle)
      // const notifsRes = await fetch(`/api/notifications?userId=${MOCK_USER_ID}`);
      // if (notifsRes.ok) {
      //   const data = await notifsRes.json();
      //   setNotifications(data.notifications);
      // }
    } catch (error) {
      console.error('Error loading data:', error);
    }
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
              <h1 className="text-2xl font-bold text-gray-900">Geçmiş</h1>
              <p className="text-sm text-gray-500">Randevu ve bildirim geçmişi</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'appointments' ? 'default' : 'outline'}
            onClick={() => setActiveTab('appointments')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Randevular ({appointments.length})
          </Button>
          <Button
            variant={activeTab === 'notifications' ? 'default' : 'outline'}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell className="w-4 h-4 mr-2" />
            Bildirimler ({notifications.length})
          </Button>
        </div>

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <Card>
            <CardHeader>
              <CardTitle>Bulunan Randevular</CardTitle>
              <CardDescription>
                Sistemin bulduğu tüm randevular
              </CardDescription>
            </CardHeader>
            <CardContent>
              {appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((apt) => {
                    const country = COUNTRIES.find(c => c.code === apt.country);
                    return (
                      <div
                        key={apt.id}
                        className="p-4 rounded-lg border hover:border-blue-500 transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{country?.flag}</span>
                            <div>
                              <h3 className="font-semibold text-lg">
                                {country?.nameTr || apt.country}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {apt.center_name}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={apt.notified ? "default" : "secondary"}>
                              {apt.notified ? 'Bildirildi' : 'Bekliyor'}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Randevu Tarihi:</span>
                            <p className="font-medium">
                              {formatDateTR(apt.appointment_date)}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Kategori:</span>
                            <p className="font-medium">{apt.visa_category}</p>
                          </div>
                          {apt.visa_subcategory && (
                            <div>
                              <span className="text-gray-500">Alt Kategori:</span>
                              <p className="font-medium">{apt.visa_subcategory}</p>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-500">Bulunma Tarihi:</span>
                            <p className="font-medium">
                              {new Date(apt.created_at).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                        </div>

                        {apt.book_now_link && (
                          <div className="mt-3 pt-3 border-t">
                            <a
                              href={apt.book_now_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm font-medium"
                            >
                              Randevu Almak İçin Tıklayın →
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Henüz randevu bulunamadı</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Kontrol başlattığınızda bulunan randevular burada görünecek
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <Card>
            <CardHeader>
              <CardTitle>Bildirim Geçmişi</CardTitle>
              <CardDescription>
                Gönderilen tüm bildirimler
              </CardDescription>
            </CardHeader>
            <CardContent>
              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="p-4 rounded-lg border"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-blue-600" />
                          <span className="font-medium capitalize">{notif.type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {notif.success ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <span className="text-red-600 text-sm">Başarısız</span>
                          )}
                          <span className="text-sm text-gray-500">
                            {new Date(notif.sent_at).toLocaleString('tr-TR')}
                          </span>
                        </div>
                      </div>
                      {notif.message && (
                        <p className="text-sm text-gray-600 mt-2">
                          {notif.message.substring(0, 150)}...
                        </p>
                      )}
                      {notif.error_message && (
                        <p className="text-sm text-red-600 mt-2">
                          Hata: {notif.error_message}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Henüz bildirim gönderilmedi</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Randevu bulunduğunda bildirimler burada görünecek
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
