import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import { Inter } from 'next/font/google'
import { AppleGlobalNav } from '@/components/apple-global-nav'
import { ScrollTitleProvider } from '@/components/scroll-title-context'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Schengen Visa Appointment Bot',
  description: 'Real-time Schengen visa appointment notification system',
  keywords: ['schengen', 'visa', 'appointment', 'bot'],
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
}

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode,
  params: { locale: string }
}) {
  const { locale } = await params;
  if (!['en', 'zh'].includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.className} tracking-tight antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <ScrollTitleProvider>
            <AppleGlobalNav />
            <div className="pt-[48px] min-h-screen bg-[#f5f5f7]">
              {children}
            </div>
          </ScrollTitleProvider>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  )
}
