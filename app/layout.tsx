import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import './globals.css'

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
})

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
      <body className={roboto.className}>
        {children}
      </body>
    </html>
  )
}
