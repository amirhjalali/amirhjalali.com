import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://amirhjalali.com'
  
  const routes = [
    '',
    '/projects',
    '/thoughts', 
    '/ai-tools',
    '/resume',
    '/resources',
    '/generate',
    '/contact',
  ]
  
  return routes.map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.8,
  }))
}