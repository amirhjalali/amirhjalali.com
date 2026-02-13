/**
 * Generate OpenGraph metadata for any page.
 * Uses the dynamic /api/og route to generate images.
 *
 * Usage in page.tsx:
 *   import { ogMeta } from '@/lib/og'
 *   export const metadata = {
 *     title: 'My Page',
 *     description: '...',
 *     ...ogMeta({ title: 'My Page', subtitle: '...', section: 'MrAI' }),
 *   }
 */

const BASE_URL = 'https://amirhjalali.com'

interface OgOptions {
  title: string
  subtitle?: string
  section?: string
  path?: string // URL path for canonical/og:url
}

export function ogImageUrl(opts: Omit<OgOptions, 'path'>): string {
  const params = new URLSearchParams()
  params.set('title', opts.title)
  if (opts.subtitle) params.set('subtitle', opts.subtitle)
  if (opts.section) params.set('section', opts.section)
  return `${BASE_URL}/api/og?${params.toString()}`
}

export function ogMeta(opts: OgOptions) {
  const imageUrl = ogImageUrl(opts)
  return {
    openGraph: {
      title: opts.title,
      ...(opts.subtitle && { description: opts.subtitle }),
      ...(opts.path && { url: `${BASE_URL}${opts.path}` }),
      images: [{ url: imageUrl, width: 1200, height: 630, alt: opts.title }],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: opts.title,
      ...(opts.subtitle && { description: opts.subtitle }),
      images: [imageUrl],
    },
  }
}
