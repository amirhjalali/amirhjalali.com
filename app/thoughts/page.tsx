import { Metadata } from 'next'
import { getPublishedArticles } from '@/lib/data'
import ThoughtsPageClient from './ThoughtsPageClient'

// Revalidate every hour for fresh content
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Thoughts',
  description: 'Articles and insights on AI, technology, software development, and more.',
  openGraph: {
    title: 'Thoughts | Amir H. Jalali',
    description: 'Articles and insights on AI, technology, software development, and more.',
    type: 'website',
  },
}

export default async function ThoughtsPage() {
  const articles = await getPublishedArticles()
  return <ThoughtsPageClient articles={articles} />
}
