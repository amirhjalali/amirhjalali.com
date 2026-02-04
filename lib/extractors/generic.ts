/**
 * Generic Fallback Extractor
 *
 * Handles any URL not matched by platform-specific extractors.
 * Uses multiple strategies:
 * 1. OG tags for metadata
 * 2. JSON-LD structured data
 * 3. Readability-style content extraction
 * 4. Schema.org microdata
 * 5. Firecrawl fallback for blocked/paywalled content
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
  extractDomain,
  fetchWithTimeout,
} from './base'
import { getSummarizeService } from '@/lib/summarize-service'

// Minimum content length to consider extraction successful
const MIN_CONTENT_LENGTH = 100

// Signs that content might be blocked/paywalled
const BLOCKED_INDICATORS = [
  'subscribe to continue',
  'sign up to read',
  'create an account',
  'premium content',
  'members only',
  'paywall',
  'javascript required',
  'enable javascript',
  'please enable cookies',
  'access denied',
  'forbidden',
  '403',
  'captcha',
]

export class GenericExtractor implements PlatformExtractor {
  platform = 'generic' as const
  version = EXTRACTOR_VERSION

  canHandle(_url: string): boolean {
    // Generic extractor handles everything as a fallback
    return true
  }

  async extract(url: string): Promise<ExtractionResult> {
    try {
      const response = await fetchWithTimeout(url)
      const domain = extractDomain(url)

      // Check for HTTP errors that might indicate blocked content
      if (!response.ok) {
        // Try Firecrawl fallback for 403/blocked responses
        if (response.status === 403 || response.status === 401) {
          console.log('[Generic] Access denied, trying Firecrawl fallback')
          const firecrawlResult = await this.tryFirecrawlFallback(url)
          if (firecrawlResult) {
            return firecrawlResult
          }
        }
        throw new Error(`Request returned ${response.status}`)
      }

      const html = await response.text()

      // Extract data from multiple sources
      const ogData = this.extractOgTags(html)
      const jsonLd = this.extractJsonLd(html)
      const schemaOrg = this.extractSchemaOrg(html)
      const mainContent = this.extractMainContent(html)
      const mediaItems = this.extractMediaItems(html, url)

      // Merge data with priority: OG > JSON-LD > Schema.org > Content extraction
      const title = ogData.title || jsonLd?.headline || jsonLd?.name || schemaOrg?.headline || this.extractTitle(html)
      const description = ogData.description || jsonLd?.description || schemaOrg?.description
      const image = ogData.image || jsonLd?.image?.url || jsonLd?.image || schemaOrg?.image
      const content = mainContent || description || ''

      // Check if content seems blocked or too thin
      const isBlocked = this.isContentBlocked(content, html)
      const isThin = content.length < MIN_CONTENT_LENGTH

      // Try Firecrawl fallback for blocked or thin content
      if ((isBlocked || isThin) && this.shouldTryFirecrawl()) {
        console.log('[Generic] Content appears blocked/thin, trying Firecrawl fallback', {
          isBlocked,
          isThin,
          contentLength: content.length,
        })
        const firecrawlResult = await this.tryFirecrawlFallback(url)
        if (firecrawlResult) {
          return firecrawlResult
        }
      }

      // Author extraction
      const author = this.extractAuthor(ogData, jsonLd, schemaOrg, html)

      // Published date
      const publishedAt = ogData.publishedTime ||
        jsonLd?.datePublished ||
        schemaOrg?.datePublished ||
        this.extractPublishDate(html)

      return createSuccessResult('generic', {
        title,
        content,
        excerpt: generateExcerpt(description || content),
        author,
        thumbnailUrl: image,
        mediaItems: mediaItems.length > 0 ? mediaItems : undefined,
        mentionedLinks: extractUrls(content),
        platformData: {
          domain,
          siteName: ogData.siteName || jsonLd?.publisher?.name,
          publishedAt,
          modifiedAt: ogData.modifiedTime || jsonLd?.dateModified,
          type: ogData.type || jsonLd?.['@type'],
          locale: ogData.locale,
          wordCount: content.split(/\s+/).filter(Boolean).length,
          firecrawlUsed: false,
        },
      })
    } catch (error) {
      return createFailureResult('generic', `Extraction failed: ${error}`)
    }
  }

  /**
   * Check if content appears to be blocked or paywalled
   */
  private isContentBlocked(content: string, html: string): boolean {
    const lowerContent = content.toLowerCase()
    const lowerHtml = html.toLowerCase()

    return BLOCKED_INDICATORS.some(indicator =>
      lowerContent.includes(indicator) || lowerHtml.includes(indicator)
    )
  }

  /**
   * Check if Firecrawl should be attempted
   */
  private shouldTryFirecrawl(): boolean {
    const service = getSummarizeService()
    return service.isFirecrawlAvailable()
  }

  /**
   * Try Firecrawl as a fallback for blocked content
   */
  private async tryFirecrawlFallback(url: string): Promise<ExtractionResult | null> {
    try {
      const service = getSummarizeService()

      if (!service.isFirecrawlAvailable()) {
        return null
      }

      console.log('[Generic] Attempting Firecrawl extraction')

      const result = await service.extract(url, {
        firecrawl: 'always',
        format: 'markdown',
      })

      if (!result.success || !result.content) {
        console.log('[Generic] Firecrawl extraction failed')
        return null
      }

      console.log('[Generic] Firecrawl extraction successful', {
        wordCount: result.wordCount,
        firecrawlUsed: result.diagnostics?.firecrawlUsed,
      })

      const domain = extractDomain(url)

      return createSuccessResult('generic', {
        title: result.title ?? undefined,
        content: result.content,
        excerpt: generateExcerpt(result.description || result.content),
        thumbnailUrl: undefined,
        platformData: {
          domain,
          siteName: result.siteName,
          wordCount: result.wordCount,
          firecrawlUsed: true,
          extractionMethod: 'firecrawl',
        },
      })
    } catch (error) {
      console.error('[Generic] Firecrawl fallback error:', error)
      return null
    }
  }

  private extractOgTags(html: string): Record<string, string | undefined> {
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
      description: getMetaContent('og:description') || getMetaContent('twitter:description') || getMetaContent('description'),
      image: getMetaContent('og:image') || getMetaContent('twitter:image'),
      siteName: getMetaContent('og:site_name'),
      type: getMetaContent('og:type'),
      locale: getMetaContent('og:locale'),
      author: getMetaContent('author') || getMetaContent('article:author'),
      publishedTime: getMetaContent('article:published_time'),
      modifiedTime: getMetaContent('article:modified_time'),
    }
  }

  private extractJsonLd(html: string): any {
    const jsonLdMatches = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)

    for (const match of jsonLdMatches) {
      try {
        const data = JSON.parse(match[1])

        // Handle array of JSON-LD objects
        if (Array.isArray(data)) {
          // Look for Article, BlogPosting, NewsArticle first
          const article = data.find(d =>
            ['Article', 'BlogPosting', 'NewsArticle', 'WebPage'].includes(d['@type'])
          )
          if (article) return article
          return data[0]
        }

        // Handle @graph format
        if (data['@graph']) {
          const article = data['@graph'].find((d: any) =>
            ['Article', 'BlogPosting', 'NewsArticle', 'WebPage'].includes(d['@type'])
          )
          if (article) return article
          return data['@graph'][0]
        }

        return data
      } catch {
        // Continue to next JSON-LD block
      }
    }

    return null
  }

  private extractSchemaOrg(html: string): any {
    // Extract schema.org microdata (itemscope/itemprop)
    const result: Record<string, any> = {}

    // Find headline
    const headlineMatch = html.match(/<[^>]+itemprop=["']headline["'][^>]*>([^<]+)</i)
    if (headlineMatch) result.headline = this.decodeHtmlEntities(headlineMatch[1])

    // Find description
    const descMatch = html.match(/<[^>]+itemprop=["']description["'][^>]*>([^<]+)</i)
    if (descMatch) result.description = this.decodeHtmlEntities(descMatch[1])

    // Find author
    const authorMatch = html.match(/<[^>]+itemprop=["']author["'][^>]*>([^<]+)</i)
    if (authorMatch) result.author = this.decodeHtmlEntities(authorMatch[1])

    // Find datePublished
    const dateMatch = html.match(/<[^>]+itemprop=["']datePublished["'][^>]+content=["']([^"']+)["']/i)
    if (dateMatch) result.datePublished = dateMatch[1]

    // Find image
    const imgMatch = html.match(/<[^>]+itemprop=["']image["'][^>]+(?:content|src)=["']([^"']+)["']/i)
    if (imgMatch) result.image = imgMatch[1]

    return Object.keys(result).length > 0 ? result : null
  }

  private extractTitle(html: string): string | undefined {
    // Try <title> tag
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    if (titleMatch) {
      return this.decodeHtmlEntities(titleMatch[1]).trim()
    }

    // Try <h1>
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
    if (h1Match) {
      return this.decodeHtmlEntities(h1Match[1]).trim()
    }

    return undefined
  }

  private extractMainContent(html: string): string {
    // Remove scripts, styles, and other non-content elements
    let cleanHtml = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')

    // Try to find article content in order of specificity
    const contentPatterns = [
      /<article[^>]*>([\s\S]*?)<\/article>/i,
      /<main[^>]*>([\s\S]*?)<\/main>/i,
      /<div[^>]+class=["'][^"']*(?:content|article|post|entry)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]+id=["'](?:content|article|post|entry)["'][^>]*>([\s\S]*?)<\/div>/i,
    ]

    let contentHtml = ''
    for (const pattern of contentPatterns) {
      const match = cleanHtml.match(pattern)
      if (match) {
        contentHtml = match[1]
        break
      }
    }

    if (!contentHtml) {
      // Fall back to body
      const bodyMatch = cleanHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
      if (bodyMatch) {
        contentHtml = bodyMatch[1]
      }
    }

    // Strip remaining HTML tags
    const text = contentHtml
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    return cleanText(this.decodeHtmlEntities(text))
  }

  private extractAuthor(
    ogData: Record<string, string | undefined>,
    jsonLd: any,
    schemaOrg: any,
    html: string
  ): AuthorInfo | undefined {
    let name: string | undefined
    let profileUrl: string | undefined

    // Try OG data
    if (ogData.author) {
      name = ogData.author
    }

    // Try JSON-LD
    if (jsonLd?.author) {
      if (typeof jsonLd.author === 'string') {
        name = jsonLd.author
      } else if (Array.isArray(jsonLd.author)) {
        name = jsonLd.author[0]?.name || jsonLd.author[0]
        profileUrl = jsonLd.author[0]?.url
      } else {
        name = jsonLd.author.name
        profileUrl = jsonLd.author.url
      }
    }

    // Try schema.org
    if (!name && schemaOrg?.author) {
      name = schemaOrg.author
    }

    // Try rel="author"
    if (!name) {
      const relAuthorMatch = html.match(/<a[^>]+rel=["']author["'][^>]*>([^<]+)</i)
      if (relAuthorMatch) {
        name = this.decodeHtmlEntities(relAuthorMatch[1])
      }
    }

    // Try byline classes
    if (!name) {
      const bylineMatch = html.match(/<[^>]+class=["'][^"']*(?:byline|author)[^"']*["'][^>]*>([^<]+)</i)
      if (bylineMatch) {
        name = this.decodeHtmlEntities(bylineMatch[1]).replace(/^by\s+/i, '')
      }
    }

    if (!name) return undefined

    return {
      name,
      profileUrl,
    }
  }

  private extractPublishDate(html: string): string | undefined {
    // Try time element with datetime
    const timeMatch = html.match(/<time[^>]+datetime=["']([^"']+)["']/i)
    if (timeMatch) return timeMatch[1]

    // Try common date patterns in content
    const datePatterns = [
      /(?:published|posted|date)[:\s]+(\d{4}-\d{2}-\d{2})/i,
      /(?:published|posted|date)[:\s]+(\w+\s+\d{1,2},?\s+\d{4})/i,
    ]

    for (const pattern of datePatterns) {
      const match = html.match(pattern)
      if (match) {
        try {
          const date = new Date(match[1])
          if (!isNaN(date.getTime())) {
            return date.toISOString()
          }
        } catch {
          // Invalid date
        }
      }
    }

    return undefined
  }

  private extractMediaItems(html: string, baseUrl: string): MediaItem[] {
    const items: MediaItem[] = []
    const seenUrls = new Set<string>()

    // Find images in content
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
    let match

    while ((match = imgRegex.exec(html)) !== null) {
      let imgUrl = match[1]

      // Skip data URLs, tracking pixels, and tiny images
      if (imgUrl.startsWith('data:') ||
          imgUrl.includes('pixel') ||
          imgUrl.includes('tracking') ||
          imgUrl.includes('1x1')) {
        continue
      }

      // Resolve relative URLs
      if (!imgUrl.startsWith('http')) {
        try {
          imgUrl = new URL(imgUrl, baseUrl).href
        } catch {
          continue
        }
      }

      if (seenUrls.has(imgUrl)) continue
      seenUrls.add(imgUrl)

      // Try to get dimensions
      const widthMatch = match[0].match(/width=["']?(\d+)["']?/i)
      const heightMatch = match[0].match(/height=["']?(\d+)["']?/i)
      const altMatch = match[0].match(/alt=["']([^"']+)["']/i)

      items.push({
        type: 'image',
        url: imgUrl,
        width: widthMatch ? parseInt(widthMatch[1], 10) : undefined,
        height: heightMatch ? parseInt(heightMatch[1], 10) : undefined,
        alt: altMatch ? this.decodeHtmlEntities(altMatch[1]) : undefined,
      })
    }

    return items.slice(0, 20) // Limit to 20 images
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
      .replace(/&#(\d+);/g, (_match, dec) => String.fromCharCode(dec))
      .replace(/&#x([0-9a-f]+);/gi, (_match, hex) => String.fromCharCode(parseInt(hex, 16)))
  }
}

export const genericExtractor = new GenericExtractor()
