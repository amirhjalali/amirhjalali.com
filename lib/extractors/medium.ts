/**
 * Medium & Substack Platform Extractor
 *
 * Both platforms have good OG tags and structured data.
 * Uses:
 * 1. OG tags for metadata
 * 2. JSON-LD structured data for rich info
 * 3. Readability-style content extraction
 */

import type { ExtractionResult, AuthorInfo, MediaItem } from '@/lib/types'
import {
  PlatformExtractor,
  EXTRACTOR_VERSION,
  createSuccessResult,
  createFailureResult,
  cleanText,
  generateExcerpt,
  extractUrls,
  parseEngagementNumber,
  fetchWithTimeout,
} from './base'

export class MediumExtractor implements PlatformExtractor {
  platform = 'medium' as const
  version = EXTRACTOR_VERSION

  canHandle(url: string): boolean {
    return /^https?:\/\/(www\.)?medium\.com\//i.test(url) ||
           /^https?:\/\/[a-z0-9-]+\.medium\.com\//i.test(url)
  }

  async extract(url: string): Promise<ExtractionResult> {
    try {
      const response = await fetchWithTimeout(url)

      if (!response.ok) {
        throw new Error(`Medium returned ${response.status}`)
      }

      const html = await response.text()

      // Extract metadata
      const metadata = this.extractMetadata(html)
      const jsonLd = this.extractJsonLd(html)
      const author = this.extractAuthor(html, metadata, jsonLd)
      const content = this.extractContent(html)
      const engagement = this.extractEngagement(html)

      // Extract images from content
      const mediaItems = this.extractMediaItems(html)

      return createSuccessResult('medium', {
        title: metadata.title || jsonLd?.headline,
        content,
        excerpt: generateExcerpt(metadata.description || content),
        author,
        thumbnailUrl: metadata.image || jsonLd?.image?.url,
        engagement,
        mediaItems: mediaItems.length > 0 ? mediaItems : undefined,
        mentionedLinks: extractUrls(content),
        platformData: {
          publishedAt: metadata.publishedTime || jsonLd?.datePublished,
          modifiedAt: metadata.modifiedTime || jsonLd?.dateModified,
          publication: metadata.siteName,
          readingTime: metadata.readingTime,
          wordCount: content.split(/\s+/).length,
          tags: metadata.tags,
        },
      })
    } catch (error) {
      return createFailureResult('medium', `Extraction failed: ${error}`)
    }
  }

  private extractMetadata(html: string): Record<string, any> {
    const getMetaContent = (property: string): string | undefined => {
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

    // Extract tags
    const tagMatches = html.matchAll(/<meta[^>]+property=["']article:tag["'][^>]+content=["']([^"']+)["']/gi)
    const tags = Array.from(tagMatches).map(m => m[1])

    // Try to find reading time
    const readingTimeMatch = html.match(/(\d+)\s*min\s*read/i)
    const readingTime = readingTimeMatch ? parseInt(readingTimeMatch[1], 10) : undefined

    return {
      title: getMetaContent('og:title') || getMetaContent('twitter:title'),
      description: getMetaContent('og:description') || getMetaContent('description'),
      image: getMetaContent('og:image'),
      siteName: getMetaContent('og:site_name'),
      author: getMetaContent('author'),
      publishedTime: getMetaContent('article:published_time'),
      modifiedTime: getMetaContent('article:modified_time'),
      tags,
      readingTime,
    }
  }

  private extractJsonLd(html: string): any {
    const jsonLdMatch = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i)
    if (!jsonLdMatch) return null

    try {
      const data = JSON.parse(jsonLdMatch[1])
      // Handle array of JSON-LD objects
      if (Array.isArray(data)) {
        return data.find(d => d['@type'] === 'Article' || d['@type'] === 'BlogPosting') || data[0]
      }
      return data
    } catch {
      return null
    }
  }

  private extractAuthor(html: string, metadata: Record<string, any>, jsonLd: any): AuthorInfo | undefined {
    let name = metadata.author
    let profileUrl: string | undefined

    // Try JSON-LD
    if (jsonLd?.author) {
      if (typeof jsonLd.author === 'string') {
        name = jsonLd.author
      } else if (jsonLd.author.name) {
        name = jsonLd.author.name
        profileUrl = jsonLd.author.url
      }
    }

    // Try to find author link in page
    if (!profileUrl) {
      const authorLinkMatch = html.match(/<a[^>]+href=["'](https?:\/\/medium\.com\/@[^"']+)["'][^>]*>/i)
      if (authorLinkMatch) {
        profileUrl = authorLinkMatch[1]
      }
    }

    // Extract handle from profile URL
    const handleMatch = profileUrl?.match(/@([a-zA-Z0-9_]+)/)
    const handle = handleMatch ? handleMatch[1] : undefined

    if (!name) return undefined

    return {
      name,
      handle,
      profileUrl,
    }
  }

  private extractContent(html: string): string {
    // Try to find article content
    // Medium uses various article containers
    const articlePatterns = [
      /<article[^>]*>([\s\S]*?)<\/article>/i,
      /<div[^>]+class=["'][^"']*postArticle-content[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
      /<section[^>]+data-field=["']body["'][^>]*>([\s\S]*?)<\/section>/i,
    ]

    let articleHtml = ''
    for (const pattern of articlePatterns) {
      const match = html.match(pattern)
      if (match) {
        articleHtml = match[1]
        break
      }
    }

    if (!articleHtml) {
      // Fall back to meta description
      const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
      return descMatch ? cleanText(this.decodeHtmlEntities(descMatch[1])) : ''
    }

    // Strip HTML and clean up
    const text = articleHtml
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    return cleanText(this.decodeHtmlEntities(text))
  }

  private extractEngagement(html: string): { claps?: number } | undefined {
    // Try to find clap count
    const clapMatch = html.match(/(\d+(?:\.\d+)?[KM]?)\s*claps?/i)
    if (clapMatch) {
      return { claps: parseEngagementNumber(clapMatch[1]) }
    }
    return undefined
  }

  private extractMediaItems(html: string): MediaItem[] {
    const items: MediaItem[] = []

    // Find images
    const imgRegex = /<img[^>]+src=["']([^"']+miro\.medium\.com[^"']+)["'][^>]*>/gi
    let match
    while ((match = imgRegex.exec(html)) !== null) {
      items.push({
        type: 'image',
        url: match[1],
      })
    }

    return items.slice(0, 10) // Limit to 10 images
  }

  private decodeHtmlEntities(str: string): string {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/&nbsp;/g, ' ')
  }
}

export class SubstackExtractor implements PlatformExtractor {
  platform = 'substack' as const
  version = EXTRACTOR_VERSION

  canHandle(url: string): boolean {
    return /^https?:\/\/[a-z0-9-]+\.substack\.com\//i.test(url)
  }

  async extract(url: string): Promise<ExtractionResult> {
    try {
      const response = await fetchWithTimeout(url)

      if (!response.ok) {
        throw new Error(`Substack returned ${response.status}`)
      }

      const html = await response.text()

      // Extract metadata
      const metadata = this.extractMetadata(html)
      const jsonLd = this.extractJsonLd(html)
      const author = this.extractAuthor(html, metadata, jsonLd)
      const content = this.extractContent(html)

      // Extract images
      const mediaItems = this.extractMediaItems(html)

      // Extract newsletter name from URL
      const newsletterMatch = url.match(/^https?:\/\/([a-z0-9-]+)\.substack\.com/i)
      const newsletter = newsletterMatch ? newsletterMatch[1] : undefined

      return createSuccessResult('substack', {
        title: metadata.title || jsonLd?.headline,
        content,
        excerpt: generateExcerpt(metadata.description || content),
        author,
        thumbnailUrl: metadata.image || jsonLd?.image?.url,
        mediaItems: mediaItems.length > 0 ? mediaItems : undefined,
        mentionedLinks: extractUrls(content),
        platformData: {
          publishedAt: metadata.publishedTime || jsonLd?.datePublished,
          modifiedAt: metadata.modifiedTime || jsonLd?.dateModified,
          newsletter,
          publication: metadata.siteName,
          wordCount: content.split(/\s+/).length,
        },
      })
    } catch (error) {
      return createFailureResult('substack', `Extraction failed: ${error}`)
    }
  }

  private extractMetadata(html: string): Record<string, any> {
    const getMetaContent = (property: string): string | undefined => {
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

    return {
      title: getMetaContent('og:title') || getMetaContent('twitter:title'),
      description: getMetaContent('og:description') || getMetaContent('description'),
      image: getMetaContent('og:image'),
      siteName: getMetaContent('og:site_name'),
      author: getMetaContent('author'),
      publishedTime: getMetaContent('article:published_time'),
      modifiedTime: getMetaContent('article:modified_time'),
    }
  }

  private extractJsonLd(html: string): any {
    const jsonLdMatch = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i)
    if (!jsonLdMatch) return null

    try {
      const data = JSON.parse(jsonLdMatch[1])
      if (Array.isArray(data)) {
        return data.find(d => d['@type'] === 'Article' || d['@type'] === 'BlogPosting') || data[0]
      }
      return data
    } catch {
      return null
    }
  }

  private extractAuthor(html: string, metadata: Record<string, any>, jsonLd: any): AuthorInfo | undefined {
    let name = metadata.author

    if (jsonLd?.author) {
      if (typeof jsonLd.author === 'string') {
        name = jsonLd.author
      } else if (jsonLd.author.name) {
        name = jsonLd.author.name
      }
    }

    // Try to find author in page
    if (!name) {
      const authorMatch = html.match(/<span[^>]+class=["'][^"']*author[^"']*["'][^>]*>([^<]+)<\/span>/i)
      if (authorMatch) {
        name = authorMatch[1].trim()
      }
    }

    if (!name) return undefined

    return { name }
  }

  private extractContent(html: string): string {
    // Substack uses specific class for post content
    const contentPatterns = [
      /<div[^>]+class=["'][^"']*body[^"']*markup[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]+class=["'][^"']*post-content[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
      /<article[^>]*>([\s\S]*?)<\/article>/i,
    ]

    let contentHtml = ''
    for (const pattern of contentPatterns) {
      const match = html.match(pattern)
      if (match) {
        contentHtml = match[1]
        break
      }
    }

    if (!contentHtml) {
      const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
      return descMatch ? cleanText(this.decodeHtmlEntities(descMatch[1])) : ''
    }

    const text = contentHtml
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    return cleanText(this.decodeHtmlEntities(text))
  }

  private extractMediaItems(html: string): MediaItem[] {
    const items: MediaItem[] = []

    // Find images
    const imgRegex = /<img[^>]+src=["']([^"']+substackcdn\.com[^"']+)["'][^>]*>/gi
    let match
    while ((match = imgRegex.exec(html)) !== null) {
      items.push({
        type: 'image',
        url: match[1],
      })
    }

    return items.slice(0, 10)
  }

  private decodeHtmlEntities(str: string): string {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/&nbsp;/g, ' ')
  }
}

export const mediumExtractor = new MediumExtractor()
export const substackExtractor = new SubstackExtractor()
