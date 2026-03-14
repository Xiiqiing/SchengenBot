'use client';

import { useState, useEffect } from 'react';
import { Calendar, Bell, CheckCircle2, AlertCircle, History } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { COUNTRIES } from '@/lib/constants/countries';
import { cn } from '@/lib/utils';

import { useLocale, useTranslations, useFormatter } from 'next-intl';

export default function HistoryPage() {
  const t = useTranslations('History');
  const tCountries = useTranslations('Countries');
  const format = useFormatter();
  const locale = useLocale();
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#ffffff_0%,#f7f8fb_44%,#eef2f7_100%)]">
      {/* Header */}
      <PageHeader
        title={t('title')}
        description={t('description')}
        backHref={`/${locale}/dashboard`}
        backLabel={t('backLabel') || 'Back'}
        icon={<History className="w-5 h-5 text-[#86868b]" />}
      />

      <main className="container mx-auto max-w-6xl px-4 pb-12">
        {/* Tabs */}
        <div className="mb-10 inline-flex w-fit gap-1 rounded-full bg-[#f3f3f5] p-1">
          <button
            onClick={() => setActiveTab('appointments')}
            className={cn(
              'flex items-center rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 outline-none',
              activeTab === 'appointments'
                ? 'bg-white text-[#1d1d1f] shadow-[0_1px_2px_rgba(15,23,42,0.08)]'
                : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            )}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {t('tabs.appointments')} ({appointments.length})
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={cn(
              'flex items-center rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 outline-none',
              activeTab === 'notifications'
                ? 'bg-white text-[#1d1d1f] shadow-[0_1px_2px_rgba(15,23,42,0.08)]'
                : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            )}
          >
            <Bell className="mr-2 h-4 w-4" />
            {t('tabs.notifications')} ({notifications.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'appointments' ? (
            //  Appointments List
            appointments.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {appointments.map((apt) => {
                  const country = COUNTRIES.find(c => c.code === apt.country);
                  return (
                    <div
                      key={apt.id}
                      className="group relative rounded-[32px] border border-black/[0.04] bg-white p-6 shadow-[0_12px_36px_rgba(15,23,42,0.035)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.05)]"
                    >
                      <div className="flex items-start justify-between mb-5">
                        <div className="flex items-center gap-4">
                          <span className="text-4xl filter drop-shadow-sm transition-transform group-hover:scale-110 duration-300">{country?.flag}</span>
                          <div>
                            <h3 className="text-lg font-semibold leading-tight tracking-[-0.02em] text-[#1d1d1f]">
                              {country ? tCountries(country.code) : apt.country}
                            </h3>
                            <p className="mt-0.5 text-[13px] font-medium text-[#6e6e73]">
                              {apt.center_name}
                            </p>
                          </div>
                        </div>
                        <div className={cn(
                          'rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.08em]',
                          apt.notified ? 'bg-[#e8fff0] text-[#199947]' : 'bg-[#f5f5f7] text-[#6e6e73]'
                        )}>
                          {apt.notified ? t('status.notified') : t('status.pending')}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-black/5 py-2 text-[13px]">
                          <span className="font-medium text-[#8e8e93]">{t('labels.date')}</span>
                          <span className="font-semibold text-[#4a4a4f]">
                            {format.dateTime(new Date(apt.appointment_date), { year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-b border-black/5 py-2 text-[13px]">
                          <span className="font-medium text-[#8e8e93]">{t('labels.category')}</span>
                          <span className="font-semibold text-[#4a4a4f]">{apt.visa_category}</span>
                        </div>
                        {apt.visa_subcategory && (
                          <div className="flex items-center justify-between border-b border-black/5 py-2 text-[13px]">
                            <span className="font-medium text-[#8e8e93]">{t('labels.subcategory')}</span>
                            <span className="max-w-[150px] truncate font-semibold text-[#4a4a4f]">{apt.visa_subcategory}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-1 text-[13px]">
                          <span className="font-medium text-[#8e8e93]">{t('labels.foundAt')}</span>
                          <span className="font-semibold text-[#4a4a4f]">
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
                            className="flex h-10 w-full items-center justify-center rounded-full bg-[#0071e3] text-[13px] font-semibold text-white shadow-[0_10px_25px_rgba(0,113,227,0.24)] transition-all hover:bg-[#0077ed]"
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
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_12px_24px_rgba(15,23,42,0.06)]">
                  <Calendar className="h-8 w-8 text-[#8e8e93]" />
                </div>
                <h3 className="text-lg font-semibold text-[#1d1d1f]">{t('emptyAppointments.title')}</h3>
                <p className="mt-2 max-w-sm text-[#6e6e73]">
                  {t('emptyAppointments.description')}
                </p>
              </div>
            )
          ) : (
            // Notifications List
            notifications.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="rounded-[32px] border border-black/[0.04] bg-white p-6 shadow-[0_12px_36px_rgba(15,23,42,0.035)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.05)]"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f8ff]">
                          <Bell className="h-5 w-5 text-[#0071e3]" />
                        </div>
                        <div>
                          <span className="block font-semibold capitalize text-[#1d1d1f]">{notif.type}</span>
                          <span className="text-xs font-medium text-[#8e8e93]">
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
                      <p className="rounded-[20px] bg-[#f5f5f7] p-3 text-[13px] leading-relaxed text-[#4a4a4f]">
                        {notif.message.substring(0, 150)}...
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_12px_24px_rgba(15,23,42,0.06)]">
                  <Bell className="h-8 w-8 text-[#8e8e93]" />
                </div>
                <h3 className="text-lg font-semibold text-[#1d1d1f]">{t('emptyNotifications.title')}</h3>
                <p className="mt-2 text-[#6e6e73]">
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
