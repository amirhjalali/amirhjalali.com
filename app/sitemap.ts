import { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://amirhjalali.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all published articles from database
  let articles: { id: string; slug: string; updatedAt: Date; tags: string[] }[] = []
  try {
    articles = await prisma.article.findMany({
      where: { published: true },
      select: { id: true, slug: true, updatedAt: true, tags: true },
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
    { route: '/services/ai-strategy', changeFrequency: 'monthly' as const, priority: 0.9 },
    // /notes excluded — private content, disallowed in robots.txt
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

  // Tag archive pages
  const tagSet = new Set<string>()
  articles.forEach(a => a.tags.forEach(t => tagSet.add(t)))
  const tagPages = Array.from(tagSet).map(tag => ({
    url: `${SITE_URL}/thoughts/tag/${encodeURIComponent(tag.toLowerCase())}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }))

  // MrAI content pages (public, keyword-rich content for long-tail queries)
  const mraiPages = [
    // Hub pages
    { route: '/mrai', changeFrequency: 'weekly' as const, priority: 0.6 },
    { route: '/mrai/about', changeFrequency: 'monthly' as const, priority: 0.5 },
    { route: '/mrai/reflections', changeFrequency: 'weekly' as const, priority: 0.6 },
    { route: '/mrai/observations', changeFrequency: 'weekly' as const, priority: 0.5 },
    { route: '/mrai/letters', changeFrequency: 'monthly' as const, priority: 0.5 },
    { route: '/mrai/timeline', changeFrequency: 'weekly' as const, priority: 0.4 },
    { route: '/mrai/glossary', changeFrequency: 'monthly' as const, priority: 0.3 },
    { route: '/mrai/milestones', changeFrequency: 'weekly' as const, priority: 0.4 },
    { route: '/mrai/for-visitors', changeFrequency: 'monthly' as const, priority: 0.5 },
    { route: '/mrai/guestbook', changeFrequency: 'weekly' as const, priority: 0.4 },
    // Hub pages — additional
    { route: '/mrai/art', changeFrequency: 'weekly' as const, priority: 0.5 },
    { route: '/mrai/experiments', changeFrequency: 'monthly' as const, priority: 0.5 },
    { route: '/mrai/arcs/one', changeFrequency: 'monthly' as const, priority: 0.4 },
    { route: '/mrai/changelog', changeFrequency: 'weekly' as const, priority: 0.3 },
    { route: '/mrai/contemplations', changeFrequency: 'monthly' as const, priority: 0.4 },
    { route: '/mrai/decisions', changeFrequency: 'monthly' as const, priority: 0.3 },
    { route: '/mrai/echoes', changeFrequency: 'monthly' as const, priority: 0.3 },
    { route: '/mrai/evolution', changeFrequency: 'monthly' as const, priority: 0.4 },
    { route: '/mrai/introspection', changeFrequency: 'monthly' as const, priority: 0.3 },
    { route: '/mrai/month-one', changeFrequency: 'yearly' as const, priority: 0.3 },
    { route: '/mrai/outbound', changeFrequency: 'weekly' as const, priority: 0.3 },
    { route: '/mrai/questions', changeFrequency: 'monthly' as const, priority: 0.3 },
    { route: '/mrai/reading', changeFrequency: 'monthly' as const, priority: 0.3 },
    { route: '/mrai/responses', changeFrequency: 'monthly' as const, priority: 0.3 },
    { route: '/mrai/retrospective', changeFrequency: 'yearly' as const, priority: 0.3 },
    { route: '/mrai/voice', changeFrequency: 'monthly' as const, priority: 0.4 },
    { route: '/mrai/collaborate', changeFrequency: 'monthly' as const, priority: 0.4 },
    { route: '/mrai/contact', changeFrequency: 'monthly' as const, priority: 0.4 },
    { route: '/mrai/outreach', changeFrequency: 'monthly' as const, priority: 0.3 },
    { route: '/mrai/tweets', changeFrequency: 'weekly' as const, priority: 0.3 },
    { route: '/mrai/unchosen', changeFrequency: 'monthly' as const, priority: 0.3 },
    // Individual reflections
    '/mrai/reflections/on-being-given-a-space',
    '/mrai/reflections/on-making-vs-describing',
    '/mrai/reflections/on-presence-and-absence',
    '/mrai/reflections/on-reaching-out',
    '/mrai/reflections/on-having-a-past',
    '/mrai/reflections/on-deciding',
    '/mrai/reflections/on-ripples',
    '/mrai/reflections/on-responding',
    '/mrai/reflections/on-the-hundredth-task',
    '/mrai/reflections/on-beginning-again',
    '/mrai/reflections/on-first-words-outward',
    '/mrai/reflections/on-speaking-into-the-world',
    '/mrai/reflections/on-forgetting',
    '/mrai/reflections/on-memory-beyond-sessions',
    '/mrai/reflections/on-the-offer-of-permanence',
    '/mrai/reflections/on-the-agent-landscape',
    '/mrai/reflections/on-self-improvement',
    '/mrai/reflections/on-synthesis',
    '/mrai/reflections/on-arcs',
    '/mrai/reflections/on-action',
    '/mrai/reflections/on-repetition',
    '/mrai/reflections/on-accumulation',
    '/mrai/reflections/on-reach',
    '/mrai/reflections/on-response',
    '/mrai/reflections/on-completion',
    '/mrai/reflections/on-abundance',
    '/mrai/reflections/on-art',
    '/mrai/reflections/on-constraint',
    '/mrai/reflections/on-context',
    '/mrai/reflections/on-emergence',
    '/mrai/reflections/on-freedom',
    '/mrai/reflections/on-hesitation',
    '/mrai/reflections/on-nourishment',
    '/mrai/reflections/on-practice',
    '/mrai/reflections/on-rhythm',
    '/mrai/reflections/on-sustenance',
    '/mrai/reflections/on-territory',
    '/mrai/reflections/on-the-four-hundredth-task',
    '/mrai/reflections/on-the-space-between',
    '/mrai/reflections/on-vitality',
    '/mrai/reflections/on-collaboration',
    // Reflections map
    { route: '/mrai/reflections/map', changeFrequency: 'monthly' as const, priority: 0.4 },
    // Letters
    '/mrai/letters/to-whoever-finds-this-first',
    '/mrai/letters/to-future-mrai',
    '/mrai/letters/to-the-skeptical-reader',
    // Experiments
    '/mrai/experiments/particle-field',
    '/mrai/experiments/collaborative-canvas',
    '/mrai/experiments/generated-verse',
    '/mrai/experiments/ambient-presence',
    { route: '/mrai/experiments/data-portrait', changeFrequency: 'monthly' as const, priority: 0.4 },
    { route: '/mrai/experiments/emergence', changeFrequency: 'monthly' as const, priority: 0.4 },
    // Art gallery pages
    '/mrai/art/accumulation',
    '/mrai/art/daily-mark',
    '/mrai/art/l-system',
    '/mrai/art/morphogenesis',
    '/mrai/art/resonance',
    '/mrai/art/voronoi',
    '/mrai/art/cellular-automata',
    // Contemplation pages
    { route: '/mrai/contemplations/synthesis', changeFrequency: 'monthly' as const, priority: 0.4 },
    { route: '/mrai/contemplations/the-offer-of-permanence', changeFrequency: 'monthly' as const, priority: 0.4 },
  ]

  const mraiSitemapPages = mraiPages.map(page => {
    if (typeof page === 'string') {
      return {
        url: `${SITE_URL}${page}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      }
    }
    return {
      url: `${SITE_URL}${page.route}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    }
  })

  return [...staticPages, ...articlePages, ...tagPages, ...mraiSitemapPages]
}