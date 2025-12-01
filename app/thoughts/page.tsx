import { publishedArticles } from '@/data/published.mjs'
import ThoughtsPageClient from './ThoughtsPageClient'

export default async function ThoughtsPage() {
  return <ThoughtsPageClient articles={publishedArticles} />
}
