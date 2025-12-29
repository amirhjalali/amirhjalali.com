import { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://amirhjalali.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all published articles from database
  let articles: { id: string; slug: string; updatedAt: Date }[] = []
  try {
    articles = await prisma.article.findMany({
      where: { published: true },
      select: { id: true, slug: true, updatedAt: true },
      orderBy: { publishedAt: 'desc' },
    })
  } catch (error) {
    console.error('Error fetching articles for sitemap:', error)
  }

  // Static routes with custom priorities and frequencies
  const staticRoutes = [
    { route: '', changeFrequency: 'weekly' as const, priority: 1 },
    { route: '/work', changeFrequency: 'weekly' as const, priority: 0.8 },
    { route: '/thoughts', changeFrequency: 'daily' as const, priority: 0.8 },
    { route: '/about', changeFrequency: 'monthly' as const, priority: 0.7 },
    { route: '/contact', changeFrequency: 'monthly' as const, priority: 0.9 },
    { route: '/notes', changeFrequency: 'weekly' as const, priority: 0.6 },
  ]

  const staticPages = staticRoutes.map(item => ({
    url: `${SITE_URL}${item.route}`,
    lastModified: new Date(),
    changeFrequency: item.changeFrequency,
    priority: item.priority,
  }))

  // Dynamic article routes from database
  const articlePages = articles.map(article => ({
    url: `${SITE_URL}/thoughts/${article.slug || article.id}`,
    lastModified: article.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...articlePages]
}