import { notFound } from 'next/navigation'
import ThoughtPageClient from './ThoughtPageClient'
import { getArticle, getAllArticleIds, getDraft } from '@/lib/data'

// Generate static params for all article IDs
export async function generateStaticParams() {
  const articles = await getAllArticleIds()
  return articles.map((article) => ({ id: article.id }))
}

interface ThoughtPageParams {
  id: string
}

export default async function ThoughtPage({ params }: { params: Promise<ThoughtPageParams> }) {
  const { id } = await params
  let article = await getArticle(id)

  if (!article) {
    // Try fetching as draft (for preview)
    article = await getDraft(id)
  }

  if (!article) {
    notFound()
  }

  return <ThoughtPageClient id={id} initialArticle={article} />
}
