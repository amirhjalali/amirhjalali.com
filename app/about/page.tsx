import { Metadata } from 'next'
import AboutPageClient from './AboutPageClient'

export const metadata: Metadata = {
  title: 'About',
  description: 'Amir H. Jalali - AI Strategy Consultant with 14+ years experience in AI, Data Engineering, and Business Intelligence.',
  openGraph: {
    title: 'About | Amir H. Jalali',
    description: 'AI Strategy Consultant with 14+ years experience in AI, Data Engineering, and Business Intelligence.',
    type: 'profile',
    images: [{ url: 'https://amirhjalali.com/og-image.webp', width: 1200, height: 630, alt: 'About - Amir H. Jalali' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['https://amirhjalali.com/og-image.webp'],
  },
}

export default function AboutPage() {
  return <AboutPageClient />
}
