import { getPublishedArticles } from '@/lib/data'

export const revalidate = 0

import ThoughtsPageClient from './ThoughtsPageClient'

export default async function ThoughtsPage() {
  const articles = await getPublishedArticles()
  return <ThoughtsPageClient articles={articles} />
}
