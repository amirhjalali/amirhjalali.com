import { Readability } from '@mozilla/readability'
import { JSDOM } from 'jsdom'
import crypto from 'crypto'

export interface ExtractedContent {
  title: string | null
  content: string | null
  textContent: string | null
  excerpt: string | null
  byline: string | null
  siteName: string | null
  favicon: string | null
  ogImage: string | null
  publishedTime: string | null
  wordCount: number
  readingTime: number
  domain: string
  sourceType: 'article' | 'video' | 'social' | 'document' | 'unknown'
  contentHash: string
  metadata: Record<string, string>
}

export interface VideoInfo {
  platform: 'youtube' | 'vimeo' | 'twitter' | 'unknown'
  videoId: string | null
  embedUrl: string | null
  thumbnailUrl: string | null
  title: string | null
  description: string | null
  duration: string | null
}

// Extract domain from URL
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace('www.', '')
  } catch {
    return 'unknown'
  }
}

// Detect source type based on URL and content
function detectSourceType(url: string, dom: JSDOM): ExtractedContent['sourceType'] {
  const domain = extractDomain(url)

  // Video platforms
  if (domain.includes('youtube.com') || domain.includes('youtu.be') ||
      domain.includes('vimeo.com') || domain.includes('twitch.tv')) {
    return 'video'
  }

  // Social platforms
  if (domain.includes('twitter.com') || domain.includes('x.com') ||
      domain.includes('linkedin.com') || domain.includes('facebook.com') ||
      domain.includes('instagram.com') || domain.includes('threads.net')) {
    return 'social'
  }

  // Check for article indicators
  const doc = dom.window.document
  const hasArticle = doc.querySelector('article') !== null
  const hasAuthor = doc.querySelector('[rel="author"], .author, .byline') !== null
  const hasPublishDate = doc.querySelector('time, [datetime], .publish-date, .date') !== null

  if (hasArticle || (hasAuthor && hasPublishDate)) {
    return 'article'
  }

  return 'unknown'
}

// Extract video info from URL
export function extractVideoInfo(url: string): VideoInfo | null {
  const domain = extractDomain(url)

  // YouTube
  if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
    let videoId: string | null = null

    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || null
    } else if (url.includes('watch?v=')) {
      videoId = new URL(url).searchParams.get('v')
    } else if (url.includes('/embed/')) {
      videoId = url.split('/embed/')[1]?.split('?')[0] || null
    }

    if (videoId) {
      return {
        platform: 'youtube',
        videoId,
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        title: null,
        description: null,
        duration: null,
      }
    }
  }

  // Vimeo
  if (domain.includes('vimeo.com')) {
    const match = url.match(/vimeo\.com\/(\d+)/)
    if (match) {
      return {
        platform: 'vimeo',
        videoId: match[1],
        embedUrl: `https://player.vimeo.com/video/${match[1]}`,
        thumbnailUrl: null,
        title: null,
        description: null,
        duration: null,
      }
    }
  }

  // Twitter/X video
  if (domain.includes('twitter.com') || domain.includes('x.com')) {
    const match = url.match(/status\/(\d+)/)
    if (match) {
      return {
        platform: 'twitter',
        videoId: match[1],
        embedUrl: null,
        thumbnailUrl: null,
        title: null,
        description: null,
        duration: null,
      }
    }
  }

  return null
}

// Calculate reading time (avg 200 words per minute)
function calculateReadingTime(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 200))
}

// Generate content hash for deduplication
function generateContentHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16)
}

// Extract metadata from HTML
function extractMetadata(doc: Document): Record<string, string> {
  const metadata: Record<string, string> = {}

  // Open Graph tags
  const ogTags = doc.querySelectorAll('meta[property^="og:"]')
  ogTags.forEach(tag => {
    const property = tag.getAttribute('property')?.replace('og:', '')
    const content = tag.getAttribute('content')
    if (property && content) {
      metadata[`og_${property}`] = content
    }
  })

  // Twitter tags
  const twitterTags = doc.querySelectorAll('meta[name^="twitter:"]')
  twitterTags.forEach(tag => {
    const name = tag.getAttribute('name')?.replace('twitter:', '')
    const content = tag.getAttribute('content')
    if (name && content) {
      metadata[`twitter_${name}`] = content
    }
  })

  // Article tags
  const articleTags = doc.querySelectorAll('meta[property^="article:"]')
  articleTags.forEach(tag => {
    const property = tag.getAttribute('property')?.replace('article:', '')
    const content = tag.getAttribute('content')
    if (property && content) {
      metadata[`article_${property}`] = content
    }
  })

  // Standard meta tags
  const description = doc.querySelector('meta[name="description"]')?.getAttribute('content')
  if (description) metadata.description = description

  const keywords = doc.querySelector('meta[name="keywords"]')?.getAttribute('content')
  if (keywords) metadata.keywords = keywords

  const author = doc.querySelector('meta[name="author"]')?.getAttribute('content')
  if (author) metadata.author = author

  return metadata
}

// Extract favicon
function extractFavicon(doc: Document, baseUrl: string): string | null {
  // Try various favicon locations
  const selectors = [
    'link[rel="icon"]',
    'link[rel="shortcut icon"]',
    'link[rel="apple-touch-icon"]',
    'link[rel="apple-touch-icon-precomposed"]',
  ]

  for (const selector of selectors) {
    const link = doc.querySelector(selector)
    if (link) {
      const href = link.getAttribute('href')
      if (href) {
        // Handle relative URLs
        if (href.startsWith('http')) return href
        if (href.startsWith('//')) return `https:${href}`
        try {
          const url = new URL(baseUrl)
          return `${url.origin}${href.startsWith('/') ? '' : '/'}${href}`
        } catch {
          return null
        }
      }
    }
  }

  // Default to /favicon.ico
  try {
    const url = new URL(baseUrl)
    return `${url.origin}/favicon.ico`
  } catch {
    return null
  }
}

// Main content extraction function
export async function extractContentFromUrl(url: string): Promise<ExtractedContent> {
  const domain = extractDomain(url)

  try {
    // Fetch with timeout
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; KnowNote/1.0; +https://amirhjalali.com)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    })

    clearTimeout(timeout)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()
    const dom = new JSDOM(html, { url })
    const doc = dom.window.document

    // Use Readability to extract main content
    const reader = new Readability(doc.cloneNode(true) as Document)
    const article = reader.parse()

    // Extract metadata
    const metadata = extractMetadata(doc)

    // Get OG image
    const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
                    doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content') ||
                    null

    // Get site name
    const siteName = doc.querySelector('meta[property="og:site_name"]')?.getAttribute('content') ||
                     domain

    // Get published time
    const publishedTime = doc.querySelector('meta[property="article:published_time"]')?.getAttribute('content') ||
                          doc.querySelector('time')?.getAttribute('datetime') ||
                          null

    // Calculate word count
    const textContent = article?.textContent || ''
    const wordCount = textContent.split(/\s+/).filter(w => w.length > 0).length

    return {
      title: article?.title || doc.title || null,
      content: article?.content || null,
      textContent: textContent || null,
      excerpt: article?.excerpt || metadata.description || null,
      byline: article?.byline || metadata.author || null,
      siteName,
      favicon: extractFavicon(doc, url),
      ogImage,
      publishedTime,
      wordCount,
      readingTime: calculateReadingTime(wordCount),
      domain,
      sourceType: detectSourceType(url, dom),
      contentHash: generateContentHash(textContent),
      metadata,
    }
  } catch (error) {
    // Return minimal info on error
    return {
      title: null,
      content: null,
      textContent: null,
      excerpt: null,
      byline: null,
      siteName: domain,
      favicon: null,
      ogImage: null,
      publishedTime: null,
      wordCount: 0,
      readingTime: 0,
      domain,
      sourceType: 'unknown',
      contentHash: generateContentHash(url),
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
    }
  }
}

// Chunk text content for embedding
export function chunkContent(
  text: string,
  options: {
    maxChunkSize?: number
    overlap?: number
    separator?: string
  } = {}
): { content: string; startOffset: number; endOffset: number }[] {
  const {
    maxChunkSize = 1000,
    overlap = 100,
    separator = '\n\n'
  } = options

  if (!text || text.length === 0) {
    return []
  }

  const chunks: { content: string; startOffset: number; endOffset: number }[] = []

  // First, split by paragraphs
  const paragraphs = text.split(separator).filter(p => p.trim().length > 0)

  let currentChunk = ''
  let currentStart = 0
  let offset = 0

  for (const paragraph of paragraphs) {
    const paragraphWithSep = paragraph + separator

    if (currentChunk.length + paragraphWithSep.length > maxChunkSize && currentChunk.length > 0) {
      // Save current chunk
      chunks.push({
        content: currentChunk.trim(),
        startOffset: currentStart,
        endOffset: offset,
      })

      // Start new chunk with overlap
      const overlapStart = Math.max(0, currentChunk.length - overlap)
      currentChunk = currentChunk.substring(overlapStart) + paragraphWithSep
      currentStart = offset - (currentChunk.length - paragraphWithSep.length)
    } else {
      currentChunk += paragraphWithSep
    }

    offset += paragraphWithSep.length
  }

  // Don't forget the last chunk
  if (currentChunk.trim().length > 0) {
    chunks.push({
      content: currentChunk.trim(),
      startOffset: currentStart,
      endOffset: offset,
    })
  }

  return chunks
}

// Clean and normalize text content
export function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')           // Normalize whitespace
    .replace(/\n{3,}/g, '\n\n')      // Max 2 newlines
    .replace(/[^\S\n]+/g, ' ')       // Single spaces
    .trim()
}
