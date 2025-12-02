import { getPublishedArticles } from '@/lib/data'
import ThoughtsPageClient from './ThoughtsPageClient'

export default async function ThoughtsPage() {
  const articles = await getPublishedArticles()
  return <ThoughtsPageClient articles={articles} />
}
