import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AppleGlobalNav } from '@/components/apple-global-nav'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Schengen Visa Appointment Bot',
  description: 'Real-time Schengen visa appointment notification system',
  keywords: ['schengen', 'visa', 'appointment', 'bot'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={inter.className}>
        <AppleGlobalNav />
        <div className="pt-[48px] min-h-screen bg-[#f5f5f7]">
          {children}
        </div>
      </body>
    </html>
  )
}
