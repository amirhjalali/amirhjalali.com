import { prisma } from '@/lib/db'
import type { Article } from '@/lib/articles'

export async function getPublishedArticles(): Promise<Article[]> {
  const articles = await prisma.article.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      author: true,
      tags: true,
      imageUrl: true,
      readTime: true,
      aiGenerated: true,
      publishedAt: true,
    }
  })

  // Format to match Article type
  return articles.map((article: any): Article => ({
    ...article,
    publishedAt: article.publishedAt?.toISOString() || new Date().toISOString(),
  }))
}

export async function getPublishedArticleById(id: string): Promise<Article | null> {
  const article = await prisma.article.findFirst({
    where: {
      OR: [
        { id },
        { slug: id }
      ],
      published: true
    }
  })

  if (!article) return null

  return {
    ...article,
    publishedAt: article.publishedAt?.toISOString() || new Date().toISOString(),
  } as Article
}

export async function getPublishedArticleBySlug(slug: string): Promise<Article | null> {
  const article = await prisma.article.findUnique({
    where: { slug, published: true }
  })

  if (!article) return null

  return {
    ...article,
    publishedAt: article.publishedAt?.toISOString() || new Date().toISOString(),
  } as Article
}

export async function getDrafts() {
  return await prisma.draft.findMany({
    orderBy: { updatedAt: 'desc' }
  })
}

export async function getDraftById(id: string) {
  return await prisma.draft.findUnique({
    where: { id }
  })
}
