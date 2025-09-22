import { MetadataRoute } from 'next'
import { getArticles } from '@/lib/articles'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://amirhjalali.com'

  // Static routes with custom priorities and frequencies
  const staticRoutes = [
    { route: '', changeFrequency: 'weekly' as const, priority: 1 },
    { route: '/projects', changeFrequency: 'weekly' as const, priority: 0.8 },
    { route: '/thoughts', changeFrequency: 'daily' as const, priority: 0.8 },
    { route: '/resume', changeFrequency: 'monthly' as const, priority: 0.7 },
    { route: '/resources', changeFrequency: 'weekly' as const, priority: 0.7 },
    { route: '/contact', changeFrequency: 'monthly' as const, priority: 0.9 },
    { route: '/book', changeFrequency: 'monthly' as const, priority: 0.8 },
  ]

  const staticPages = staticRoutes.map(item => ({
    url: `${baseUrl}${item.route}`,
    lastModified: new Date(),
    changeFrequency: item.changeFrequency,
    priority: item.priority,
  }))

  // Get dynamic article routes
  const articles = getArticles()
  const articlePages = articles.map(article => ({
    url: `${baseUrl}/thoughts/${article.id}`,
    lastModified: new Date(article.publishedAt),
    changeFrequency: 'yearly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...articlePages]
}