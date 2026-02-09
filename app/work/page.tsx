import { Metadata } from 'next'
import WorkPageClient from './WorkPageClient'

export const metadata: Metadata = {
  title: 'Work',
  description: 'Explore AI and technology projects by Amir H. Jalali. From creator economy platforms to AI recruitment tools and content moderation systems.',
  openGraph: {
    title: 'Work | Amir H. Jalali',
    description: 'Explore AI and technology projects by Amir H. Jalali. From creator economy platforms to AI recruitment tools and content moderation systems.',
    type: 'website',
    images: [{ url: 'https://amirhjalali.com/og-image.webp', width: 1200, height: 630, alt: 'Work - Amir H. Jalali' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['https://amirhjalali.com/og-image.webp'],
  },
}

export default function WorkPage() {
  return <WorkPageClient />
}
