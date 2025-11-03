import { getPublishedArticles } from '@/lib/server/articles'
import { getTrendingTopics } from '@/lib/server/topics'
import ThoughtsPageClient from './ThoughtsPageClient'

export default async function ThoughtsPage() {
  const [articles, topics] = await Promise.all([
    getPublishedArticles(),
    getTrendingTopics()
  ])
  return <ThoughtsPageClient articles={articles} topics={topics} />
}
