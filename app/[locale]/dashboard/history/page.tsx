'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Bell, CheckCircle2, AlertCircle, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { COUNTRIES, formatDate } from '@/lib/constants/countries';
import Link from 'next/link';
import { cn } from '@/lib/utils';

import { useTranslations, useFormatter } from 'next-intl';

export default function HistoryPage() {
  const t = useTranslations('History');
  const tCountries = useTranslations('Countries');
  const format = useFormatter();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'appointments' | 'notifications'>('appointments');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('@/lib/user-id').then(({ getUserId }) => {
      const userId = getUserId();
      if (userId) {
        loadData(userId);
      }
    });
  }, []);

  const loadData = async (userId: string) => {
    try {
      setLoading(true);
      // Load Appointments
      const apptsRes = await fetch(`/api/appointments?userId=${userId}&limit=100`);
      if (apptsRes.ok) {
        const data = await apptsRes.json();
        setAppointments(data.appointments || []);
      }

      // Load Notifications
      const notifsRes = await fetch(`/api/notifications?userId=${userId}`);
      if (notifsRes.ok) {
        const data = await notifsRes.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header */}
      <PageHeader
        title={t('title')}
        description={t('description')}
        backHref="/dashboard"
        backLabel={t('backLabel') || 'Back'}
        icon={<History className="w-5 h-5 text-[#f5f5f7]" />}
      />

      <main className="container mx-auto px-4 pb-12 max-w-6xl">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-gray-200/50 p-1.5 rounded-full w-fit backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('appointments')}
            className={cn(
              "flex items-center px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 outline-none",
              activeTab === 'appointments'
                ? "bg-white text-black shadow-sm"
                : "text-gray-500 hover:text-black hover:bg-white/30"
            )}
          >
            <Calendar className="w-4 h-4 mr-2" />
            {t('tabs.appointments')} ({appointments.length})
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={cn(
              "flex items-center px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 outline-none",
              activeTab === 'notifications'
                ? "bg-white text-black shadow-sm"
                : "text-gray-500 hover:text-black hover:bg-white/30"
            )}
          >
            <Bell className="w-4 h-4 mr-2" />
            {t('tabs.notifications')} ({notifications.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'appointments' ? (
            //  Appointments List
            appointments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appointments.map((apt) => {
                  const country = COUNTRIES.find(c => c.code === apt.country);
                  return (
                    <div
                      key={apt.id}
                      className="group relative p-6 bg-white rounded-[24px] shadow-sm hover:shadow-md transition-all duration-300 border border-transparent hover:border-blue-500/10"
                    >
                      <div className="flex items-start justify-between mb-5">
                        <div className="flex items-center gap-4">
                          <span className="text-4xl filter drop-shadow-sm transition-transform group-hover:scale-110 duration-300">{country?.flag}</span>
                          <div>
                            <h3 className="font-bold text-lg text-[#1d1d1f] leading-tight">
                              {/* Try to translate country name, fallback to hardcoded name or code */}
                              {country ? tCountries(country.code) : apt.country}
                            </h3>
                            <p className="text-[13px] font-medium text-gray-500 mt-0.5">
                              {apt.center_name}
                            </p>
                          </div>
                        </div>
                        <div className={cn(
                          "px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider",
                          apt.notified ? "bg-green-100/80 text-green-700" : "bg-gray-100 text-gray-500"
                        )}>
                          {apt.notified ? t('status.notified') : t('status.pending')}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-50 text-[13px]">
                          <span className="text-gray-400 font-medium">{t('labels.date')}</span>
                          <span className="font-semibold text-gray-700">
                            {/* Parse date string and format */}
                            {format.dateTime(new Date(apt.appointment_date), { year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-50 text-[13px]">
                          <span className="text-gray-400 font-medium">{t('labels.category')}</span>
                          <span className="font-semibold text-gray-700">{apt.visa_category}</span>
                        </div>
                        {apt.visa_subcategory && (
                          <div className="flex justify-between items-center py-2 border-b border-gray-50 text-[13px]">
                            <span className="text-gray-400 font-medium">{t('labels.subcategory')}</span>
                            <span className="font-semibold text-gray-700 truncate max-w-[150px]">{apt.visa_subcategory}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-1 text-[13px]">
                          <span className="text-gray-400 font-medium">{t('labels.foundAt')}</span>
                          <span className="font-semibold text-gray-700">
                            {format.dateTime(new Date(apt.created_at), { dateStyle: 'medium' })}
                          </span>
                        </div>
                      </div>

                      {apt.book_now_link && (
                        <div className="mt-5 pt-0">
                          <a
                            href={apt.book_now_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-full h-9 bg-[#0071e3] hover:bg-[#0077ED] text-white text-[13px] font-semibold rounded-full transition-all active:scale-95 shadow-sm hover:shadow"
                          >
                            {t('bookNow') || 'Book Now'}
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{t('emptyAppointments.title')}</h3>
                <p className="text-gray-500 mt-2 max-w-sm">
                  {t('emptyAppointments.description')}
                </p>
              </div>
            )
          ) : (
            // Notifications List
            notifications.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-6 bg-white rounded-[24px] shadow-sm border-none hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                          <Bell className="w-5 h-5 text-[#0071e3]" />
                        </div>
                        <div>
                          <span className="block font-bold text-[#1d1d1f] capitalize">{notif.type}</span>
                          <span className="text-xs text-gray-400 font-medium">
                            {format.dateTime(new Date(notif.sent_at), { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </div>
                      </div>
                      <div>
                        {notif.success ? (
                          <CheckCircle2 className="w-5 h-5 text-[#34C759]" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    </div>
                    {notif.message && (
                      <p className="text-[13px] text-gray-600 bg-gray-50 p-3 rounded-xl leading-relaxed">
                        {notif.message.substring(0, 150)}...
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Bell className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{t('emptyNotifications.title')}</h3>
                <p className="text-gray-500 mt-2">
                  {t('emptyNotifications.description')}
                </p>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}
