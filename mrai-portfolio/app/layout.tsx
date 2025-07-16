import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import './globals.css'

export const metadata: Metadata = {
  title: 'MR AI - Amir Jalali Portfolio',
  description: 'AI-powered portfolio showcasing innovative projects and thoughts',
  keywords: 'AI, Machine Learning, Portfolio, Amir Jalali, MR AI',
  authors: [{ name: 'Amir Jalali' }],
  openGraph: {
    title: 'MR AI - Amir Jalali',
    description: 'AI-powered portfolio showcasing innovative projects',
    url: 'https://amirhjalali.com',
    siteName: 'MR AI',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-dark-bg font-inter">
        <Navigation />
        <div className="pt-16">
          {children}
        </div>
      </body>
    </html>
  )
}