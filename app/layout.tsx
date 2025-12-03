import type { Metadata } from 'next'
import { Cormorant_Garamond, JetBrains_Mono } from 'next/font/google'
import NavigationEnhanced from '@/components/NavigationEnhanced'
import SkipNavigation from '@/components/SkipNavigation'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import StructuredData from '@/components/StructuredData'
import { ThemeProvider } from '@/components/ThemeProvider'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Amir H. Jalali - Human Consultant',
    template: '%s | Amir H. Jalali'
  },
  manifest: '/manifest.json',
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
    title: 'Amir H. Jalali - Human Consultant',
    description: 'Generative AI consultant with 14 years experience. Transforming data into opportunity with AI.',
    url: 'https://gaboojabrothers.cloud',
    siteName: 'Amir H. Jalali',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://gaboojabrothers.cloud/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Amir H. Jalali - AI Consultant & Data Engineering Expert',
        type: 'image/png',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Amir H. Jalali - Human Consultant',
    description: 'Generative AI consultant with 14 years experience. Transforming data into opportunity with AI.',
    images: ['https://gaboojabrothers.cloud/og-image.png'],
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
    canonical: 'https://gaboojabrothers.cloud',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${cormorant.variable} ${jetbrains.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#050505" />
      </head>
      <body className="min-h-screen font-sans antialiased bg-[#050505] text-[#EAEAEA] selection:bg-white selection:text-black">
        <ThemeProvider defaultTheme="dark">
          <GoogleAnalytics />
          <StructuredData />
          <SkipNavigation />
          <NavigationEnhanced />
          <main id="main-content" className="pt-20" role="main">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}