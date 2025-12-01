import { notFound } from 'next/navigation'
import ThoughtPageClient from './ThoughtPageClient'
import { publishedArticles } from '@/data/published.mjs'

// Generate static params for all article IDs
export async function generateStaticParams() {
  return publishedArticles.map((article) => ({ id: article.id }))
}

interface ThoughtPageParams {
  id: string
}

export default async function ThoughtPage({ params }: { params: Promise<ThoughtPageParams> }) {
  const { id } = await params
  const article = publishedArticles.find(a => a.id === id)

  if (!article) {
    notFound()
  }

  return <ThoughtPageClient id={id} initialArticle={article} />
}
