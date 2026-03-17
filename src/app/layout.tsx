import type { Metadata } from 'next'
import { Syne, DM_Mono } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { TradeStoreProvider } from '@/context/TradeStoreProvider'
import { Toaster } from 'react-hot-toast'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '600', '700', '800'],
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['300', '400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'EdgeLog · Trading Journal',
  description: 'Professional forex trading journal. Track every pip.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmMono.variable}`}>
      <body className="bg-night-400 text-white antialiased">
        <AuthProvider>
          <TradeStoreProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#161920',
                  color: '#fff',
                  border: '1px solid rgba(245,158,11,0.25)',
                  fontSize: '13px',
                  fontFamily: 'var(--font-display)',
                },
                success: { iconTheme: { primary: '#10b981', secondary: '#000' } },
                error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
              }}
            />
          </TradeStoreProvider>
        </AuthProvider>
      </body>
    </html>
  )
}