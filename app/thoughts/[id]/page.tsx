import { notFound } from 'next/navigation'
import ThoughtPageClient from './ThoughtPageClient'
import { getPublishedArticleById, getPublishedArticles } from '@/lib/server/articles'

// Generate static params for all article IDs
export async function generateStaticParams() {
  const articles = await getPublishedArticles()
  return articles.map((article) => ({ id: article.id }))
}

interface ThoughtPageParams {
  id: string
}

export default async function ThoughtPage({ params }: { params: Promise<ThoughtPageParams> }) {
  const { id } = await params
  const article = await getPublishedArticleById(id)

  if (!article) {
    notFound()
  }

  return <ThoughtPageClient id={id} initialArticle={article} />
}
