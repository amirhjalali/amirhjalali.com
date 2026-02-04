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
  metadataBase: new URL('https://amirhjalali.com'),
  title: {
    default: 'Amir H. Jalali - AI Strategy Consultant',
    template: '%s | Amir H. Jalali'
  },
  manifest: '/manifest.json',
  description: 'AI Strategy Consultant with 14+ years experience in Generative AI, Data Engineering, and Business Intelligence. Helping organizations navigate the AI transformation.',
  keywords: [
    'Amir Jalali',
    'AI Consultant',
    'AI Strategy',
    'Generative AI',
    'Data Engineering',
    'Business Intelligence',
    'LLMs',
    'Large Language Models',
    'Prompt Engineering',
    'Machine Learning',
    'Artificial Intelligence',
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
    title: 'Amir H. Jalali - AI Strategy Consultant',
    description: 'AI Strategy Consultant with 14+ years experience in Generative AI, Data Engineering, and Business Intelligence.',
    url: 'https://amirhjalali.com',
    siteName: 'Amir H. Jalali',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Amir H. Jalali - AI Strategy Consultant',
    description: 'AI Strategy Consultant with 14+ years experience in Generative AI, Data Engineering, and Business Intelligence.',
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
        {/* Preload critical resources for LCP */}
        <link rel="preload" href="/AmirPortraitWebsite.webp" as="image" type="image/webp" fetchPriority="high" />
        <link rel="preload" href="/fonts/Satoshi-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />

        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />

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