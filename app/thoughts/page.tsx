import { getPublishedArticles } from '@/lib/server/articles'
import ThoughtsPageClient from './ThoughtsPageClient'

export default async function ThoughtsPage() {
  const articles = await getPublishedArticles()
  return <ThoughtsPageClient articles={articles} />
}
