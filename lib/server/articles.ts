import { publishedArticles } from '@/data/published.mjs'
import type { Article } from '@/lib/articles'

const articlesById = new Map<string, Article>(
  publishedArticles.map((article) => [article.id, article as Article])
)

export async function getPublishedArticles(): Promise<Article[]> {
  return [...publishedArticles]
    .map((article) => ({ ...article }))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}

export async function getPublishedArticleById(id: string): Promise<Article | null> {
  const match = articlesById.get(id)
  return match ? { ...match } : null
}
