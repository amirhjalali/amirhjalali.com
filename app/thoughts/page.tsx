import { Metadata } from 'next'
import { getPublishedArticles } from '@/lib/data'
import ThoughtsPageClient from './ThoughtsPageClient'

// Force dynamic rendering so DB changes are reflected immediately
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Thoughts',
  description: 'Articles and insights on AI, technology, software development, and more.',
  openGraph: {
    title: 'Thoughts | Amir H. Jalali',
    description: 'Articles and insights on AI, technology, software development, and more.',
    type: 'website',
    images: [{ url: 'https://amirhjalali.com/og-image.webp', width: 1200, height: 630, alt: 'Thoughts - Amir H. Jalali' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['https://amirhjalali.com/og-image.webp'],
  },
}

export default async function ThoughtsPage() {
  const articles = await getPublishedArticles()
  return <ThoughtsPageClient articles={articles} />
}
