import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import './globals.css'

export const metadata: Metadata = {
  title: 'Amir H. Jalali - AI Consultant & Data Engineering Expert',
  description: 'Generative AI consultant with 14 years experience in Data Warehousing, Business Intelligence, and AI Strategy. Currently CTO at AVENU AI.',
  keywords: 'Amir Jalali, AI Consultant, Generative AI, Data Engineering, Business Intelligence, Data Warehousing, LLMs, AI Strategy, AVENU AI',
  authors: [{ name: 'Amir H. Jalali' }],
  openGraph: {
    title: 'Amir H. Jalali - AI Consultant & Data Engineering Expert',
    description: 'Generative AI consultant with 14 years experience. Transforming data into opportunity with AI.',
    url: 'https://amirhjalali.com',
    siteName: 'Amir H. Jalali',
    type: 'website',
    images: [
      {
        url: 'https://amirhjalali.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Amir H. Jalali - AI Consultant',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Amir H. Jalali - AI Consultant',
    description: 'Generative AI consultant transforming data into opportunity with AI',
    images: ['https://amirhjalali.com/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#00FF88" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-dark-bg font-inter">
        <Navigation />
        <div className="pt-20">
          {children}
        </div>
      </body>
    </html>
  )
}