import type { Metadata } from 'next'
import { Cormorant_Garamond, JetBrains_Mono } from 'next/font/google'
import localFont from 'next/font/local'
import NavigationEnhanced from '@/components/NavigationEnhanced'
import SkipNavigation from '@/components/SkipNavigation'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import StructuredData from '@/components/StructuredData'
import { ThemeProvider } from '@/components/ThemeProvider'
import Footer from '@/components/Footer'
import './globals.css'

// Satoshi - Distinctive sans-serif to replace Inter
const satoshi = localFont({
  src: [
    { path: '../public/fonts/Satoshi-Light.woff2', weight: '300', style: 'normal' },
    { path: '../public/fonts/Satoshi-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/Satoshi-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../public/fonts/Satoshi-Bold.woff2', weight: '700', style: 'normal' },
    { path: '../public/fonts/Satoshi-Black.woff2', weight: '900', style: 'normal' },
  ],
  variable: '--font-satoshi',
  display: 'swap',
})

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
  description: 'Co-Founder & CPO at Gabooja. 14+ years experience in Generative AI, Data Warehousing, Business Intelligence, and AI Strategy. Building the future of creator-led commerce.',
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
    'Gabooja',
    'Creator Economy',
    'Prompt Engineering',
    'Machine Learning',
    'Artificial Intelligence',
    'CPO',
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
    title: 'Amir H. Jalali - Co-Founder & CPO at Gabooja',
    description: 'Co-Founder & CPO at Gabooja. Building the future of creator-led commerce with 14+ years in AI and data.',
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
    title: 'Amir H. Jalali - Co-Founder & CPO at Gabooja',
    description: 'Co-Founder & CPO at Gabooja. Building the future of creator-led commerce with 14+ years in AI and data.',
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
    <html lang="en" suppressHydrationWarning className={`${satoshi.variable} ${cormorant.variable} ${jetbrains.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
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
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}