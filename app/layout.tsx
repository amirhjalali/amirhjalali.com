import type { Metadata } from 'next'
import NavigationEnhanced from '@/components/NavigationEnhanced'
import SkipNavigation from '@/components/SkipNavigation'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import StructuredData from '@/components/StructuredData'
import AIChatbot from '@/components/AIChatbot'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Amir H. Jalali - AI Consultant & Data Engineering Expert',
    template: '%s | Amir H. Jalali'
  },
  description: 'Generative AI consultant with 14 years experience in Data Warehousing, Business Intelligence, and AI Strategy. Currently CTO at AVENU AI. Specializing in LLMs, prompt engineering, and AI-driven solutions.',
  keywords: [
    'Amir Jalali',
    'AI Consultant', 
    'Generative AI',
    'Data Engineering',
    'Business Intelligence',
    'Data Warehousing',
    'LLMs',
    'Large Language Models',
    'AI Strategy',
    'AVENU AI',
    'Prompt Engineering',
    'Machine Learning',
    'Artificial Intelligence',
    'CTO',
    'Data Science',
    'AI Implementation',
    'Digital Transformation'
  ],
  authors: [{ name: 'Amir H. Jalali', url: 'https://amirhjalali.com' }],
  creator: 'Amir H. Jalali',
  publisher: 'Amir H. Jalali',
  category: 'Technology',
  classification: 'AI Consulting',
  openGraph: {
    title: 'Amir H. Jalali - AI Consultant & Data Engineering Expert',
    description: 'Generative AI consultant with 14 years experience. Transforming data into opportunity with AI.',
    url: 'https://amirhjalali.com',
    siteName: 'Amir H. Jalali',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://amirhjalali.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Amir H. Jalali - AI Consultant & Data Engineering Expert',
        type: 'image/png',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Amir H. Jalali - AI Consultant & Data Engineering Expert',
    description: 'Generative AI consultant with 14 years experience. Transforming data into opportunity with AI.',
    images: ['https://amirhjalali.com/og-image.png'],
    creator: '@amirhjalali',
    site: '@amirhjalali',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  alternates: {
    canonical: 'https://amirhjalali.com',
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
      <body className="min-h-screen font-inter antialiased">
        <GoogleAnalytics />
        <StructuredData />
        <SkipNavigation />
        <NavigationEnhanced />
        <main id="main-content" className="pt-20" role="main">
          {children}
        </main>
        <AIChatbot />
      </body>
    </html>
  )
}