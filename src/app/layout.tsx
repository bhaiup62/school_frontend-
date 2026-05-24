import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Providers } from '@/components/Providers'
import { ToastProvider } from '@/components/ui/ToastProvider'

export const metadata: Metadata = {
  title: 'Saraswati Public School | Excellence in Education',
  description: 'Saraswati Public School - Nurturing minds, building futures. Varanasi\'s premier institution for holistic education since 1985.',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Lato:wght@300;400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans">
        <ToastProvider>
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </Providers>
        </ToastProvider>
      </body>
    </html>
  )
}
