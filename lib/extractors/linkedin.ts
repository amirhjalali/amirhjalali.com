/**
 * LinkedIn Platform Extractor
 *
 * LinkedIn heavily restricts scraping, so this extractor relies primarily on:
 * 1. OG tags (available without auth)
 * 2. Page metadata
 *
 * Note: Full content extraction requires authentication which we don't have
 */

import type { ExtractionResult, AuthorInfo } from '@/lib/types'
import {
  PlatformExtractor,
  EXTRACTOR_VERSION,
  createSuccessResult,
  createFailureResult,
  cleanText,
  generateExcerpt,
  fetchWithTimeout,
} from './base'

export class LinkedInExtractor implements PlatformExtractor {
  platform = 'linkedin' as const
  version = EXTRACTOR_VERSION

  canHandle(url: string): boolean {
    return /^https?:\/\/(www\.)?linkedin\.com\//i.test(url)
  }

  async extract(url: string): Promise<ExtractionResult> {
    try {
      // Determine content type from URL
      const contentType = this.detectContentType(url)

      const response = await fetchWithTimeout(url)

      if (!response.ok) {
        throw new Error(`LinkedIn returned ${response.status}`)
      }

      const html = await response.text()

      // Extract OG and meta tags
      const metadata = this.extractMetadata(html)

      if (!metadata.title && !metadata.description) {
        return createFailureResult('linkedin', 'Could not extract content from LinkedIn page')
      }

      // Try to parse author from various sources
      const author = this.parseAuthor(html, metadata, contentType)

      const content = cleanText(metadata.description || '')

      return createSuccessResult('linkedin', {
        title: metadata.title,
        content,
        excerpt: generateExcerpt(content),
        author,
        thumbnailUrl: metadata.image,
        platformData: {
          contentType,
          publishedAt: metadata.publishedTime,
          articleSection: metadata.articleSection,
        },
      })
    } catch (error) {
      return createFailureResult('linkedin', `Extraction failed: ${error}`)
    }
  }

  private detectContentType(url: string): string {
    if (url.includes('/posts/')) return 'post'
    if (url.includes('/pulse/')) return 'article'
    if (url.includes('/in/')) return 'profile'
    if (url.includes('/company/')) return 'company'
    if (url.includes('/jobs/')) return 'job'
    if (url.includes('/events/')) return 'event'
    return 'unknown'
  }

  private extractMetadata(html: string): Record<string, string | undefined> {
    const getMetaContent = (property: string): string | undefined => {
      // Try property first, then name
      const patterns = [
        new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
        new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i'),
        new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
        new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`, 'i'),
      ]

      for (const pattern of patterns) {
        const match = html.match(pattern)
        if (match) return this.decodeHtmlEntities(match[1])
      }
      return undefined
    }

    // Try to get title from og:title or page title
    let title = getMetaContent('og:title')
    if (!title) {
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
      if (titleMatch) title = this.decodeHtmlEntities(titleMatch[1])
    }

    return {
      title,
      description: getMetaContent('og:description') || getMetaContent('description'),
      image: getMetaContent('og:image') || getMetaContent('twitter:image'),
      type: getMetaContent('og:type'),
      author: getMetaContent('author'),
      publishedTime: getMetaContent('article:published_time'),
      articleSection: getMetaContent('article:section'),
    }
  }

  private parseAuthor(html: string, metadata: Record<string, string | undefined>, contentType: string): AuthorInfo | undefined {
    // Try to extract author from various sources
    let authorName = metadata.author

    // For posts, try to find author name in the page
    if (!authorName) {
      // LinkedIn often includes author in title like "Name on LinkedIn: post content"
      const titleAuthorMatch = metadata.title?.match(/^(.+?)\s+on\s+LinkedIn/i)
      if (titleAuthorMatch) {
        authorName = titleAuthorMatch[1]
      }
    }

    // Try to find profile link
    const profileMatch = html.match(/linkedin\.com\/in\/([a-zA-Z0-9-]+)/i)
    const profileHandle = profileMatch ? profileMatch[1] : undefined

    if (!authorName && !profileHandle) {
      return undefined
    }

    return {
      name: authorName,
      handle: profileHandle,
      profileUrl: profileHandle ? `https://www.linkedin.com/in/${profileHandle}` : undefined,
    }
  }

  private decodeHtmlEntities(str: string): string {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/')
      .replace(/&nbsp;/g, ' ')
  }
}

export const linkedinExtractor = new LinkedInExtractor()
