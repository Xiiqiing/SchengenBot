import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Schengen Visa Appointment Bot',
  description: 'Gerçek zamanlı Schengen vize randevu bildirim sistemi - 17 ülke desteği',
  keywords: ['schengen', 'visa', 'appointment', 'vize', 'randevu', 'telegram', 'bot'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
