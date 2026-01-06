/**
 * Podcast Service
 * Handles podcast RSS feed parsing and episode extraction
 */

import { XMLParser } from 'fast-xml-parser'

export interface PodcastFeed {
  title: string
  description: string
  link: string
  image?: string
  author?: string
  language?: string
  categories?: string[]
  episodes: PodcastEpisode[]
}

export interface PodcastEpisode {
  title: string
  description: string
  link?: string
  guid: string
  pubDate: string
  duration?: string
  durationSeconds?: number
  audioUrl: string
  audioType?: string
  audioSize?: number
  image?: string
  season?: number
  episode?: number
  explicit?: boolean
}

// Known podcast platform URL patterns
const PODCAST_PATTERNS = [
  { pattern: /podcasts\.apple\.com/, type: 'apple' },
  { pattern: /open\.spotify\.com\/show/, type: 'spotify' },
  { pattern: /overcast\.fm/, type: 'overcast' },
  { pattern: /pocketcasts\.com/, type: 'pocketcasts' },
  { pattern: /castro\.fm/, type: 'castro' },
  { pattern: /anchor\.fm/, type: 'anchor' },
  { pattern: /rss\.com/, type: 'rss' },
] as const

/**
 * Detect if a URL is a podcast platform URL
 */
export function isPodcastUrl(url: string): boolean {
  return PODCAST_PATTERNS.some(({ pattern }) => pattern.test(url))
}

/**
 * Get podcast platform type from URL
 */
export function getPodcastPlatform(url: string): string | null {
  const match = PODCAST_PATTERNS.find(({ pattern }) => pattern.test(url))
  return match?.type || null
}

/**
 * Parse a podcast RSS feed
 */
export async function parsePodcastFeed(feedUrl: string): Promise<PodcastFeed> {
  try {
    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; KnowNote/1.0)',
        Accept: 'application/rss+xml, application/xml, text/xml',
      },
      signal: AbortSignal.timeout(30000),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch feed: ${response.status} ${response.statusText}`)
    }

    const xml = await response.text()
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
    })

    const result = parser.parse(xml)
    const channel = result.rss?.channel

    if (!channel) {
      throw new Error('Invalid RSS feed: no channel found')
    }

    // Extract feed metadata
    const feed: PodcastFeed = {
      title: channel.title || 'Unknown Podcast',
      description: cleanDescription(channel.description || channel['itunes:summary'] || ''),
      link: channel.link || '',
      image: extractImage(channel),
      author: channel['itunes:author'] || channel.author || '',
      language: channel.language || 'en',
      categories: extractCategories(channel),
      episodes: [],
    }

    // Extract episodes
    const items = Array.isArray(channel.item) ? channel.item : [channel.item].filter(Boolean)

    feed.episodes = items.map((item: any) => parseEpisode(item)).filter(Boolean)

    return feed
  } catch (error: any) {
    console.error('Failed to parse podcast feed:', error.message)
    throw error
  }
}

/**
 * Parse a single episode from RSS item
 */
function parseEpisode(item: any): PodcastEpisode | null {
  if (!item) return null

  // Get enclosure (audio file)
  const enclosure = item.enclosure
  const audioUrl = enclosure?.['@_url'] || item['media:content']?.['@_url']

  if (!audioUrl) {
    return null // Skip items without audio
  }

  // Parse duration
  const durationStr = item['itunes:duration'] || ''
  const durationSeconds = parseDuration(durationStr)

  return {
    title: item.title || 'Untitled Episode',
    description: cleanDescription(item.description || item['itunes:summary'] || item['content:encoded'] || ''),
    link: item.link || '',
    guid: item.guid?.['#text'] || item.guid || audioUrl,
    pubDate: item.pubDate || '',
    duration: durationStr,
    durationSeconds,
    audioUrl,
    audioType: enclosure?.['@_type'] || 'audio/mpeg',
    audioSize: parseInt(enclosure?.['@_length'] || '0', 10) || undefined,
    image: item['itunes:image']?.['@_href'] || item['media:thumbnail']?.['@_url'],
    season: parseInt(item['itunes:season'] || '0', 10) || undefined,
    episode: parseInt(item['itunes:episode'] || '0', 10) || undefined,
    explicit: item['itunes:explicit'] === 'yes' || item['itunes:explicit'] === 'true',
  }
}

/**
 * Extract image URL from channel
 */
function extractImage(channel: any): string | undefined {
  // Try iTunes image first
  if (channel['itunes:image']?.['@_href']) {
    return channel['itunes:image']['@_href']
  }

  // Try standard RSS image
  if (channel.image?.url) {
    return channel.image.url
  }

  // Try media thumbnail
  if (channel['media:thumbnail']?.['@_url']) {
    return channel['media:thumbnail']['@_url']
  }

  return undefined
}

/**
 * Extract categories from channel
 */
function extractCategories(channel: any): string[] {
  const categories: string[] = []

  // iTunes categories
  const itunesCategory = channel['itunes:category']
  if (itunesCategory) {
    const cats = Array.isArray(itunesCategory) ? itunesCategory : [itunesCategory]
    for (const cat of cats) {
      if (cat['@_text']) {
        categories.push(cat['@_text'])
      }
      // Subcategories
      if (cat['itunes:category']?.['@_text']) {
        categories.push(cat['itunes:category']['@_text'])
      }
    }
  }

  // Standard RSS categories
  const rssCategory = channel.category
  if (rssCategory) {
    const cats = Array.isArray(rssCategory) ? rssCategory : [rssCategory]
    for (const cat of cats) {
      const catText = typeof cat === 'string' ? cat : cat['#text']
      if (catText) {
        categories.push(catText)
      }
    }
  }

  return [...new Set(categories)]
}

/**
 * Clean HTML from description
 */
function cleanDescription(html: string): string {
  if (!html) return ''

  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 2000) // Limit description length
}

/**
 * Parse duration string to seconds
 */
function parseDuration(duration: string): number | undefined {
  if (!duration) return undefined

  // If it's already a number (seconds)
  if (/^\d+$/.test(duration)) {
    return parseInt(duration, 10)
  }

  // Parse HH:MM:SS or MM:SS format
  const parts = duration.split(':').map(Number)

  if (parts.length === 3) {
    // HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  } else if (parts.length === 2) {
    // MM:SS
    return parts[0] * 60 + parts[1]
  }

  return undefined
}

/**
 * Format duration seconds to readable string
 */
export function formatDuration(seconds: number | undefined): string {
  if (!seconds) return ''

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

/**
 * Try to find RSS feed URL from a podcast platform page
 */
export async function findPodcastFeedUrl(pageUrl: string): Promise<string | null> {
  try {
    // Some platforms have predictable RSS patterns
    const platform = getPodcastPlatform(pageUrl)

    // For Apple Podcasts, we can construct a lookup URL
    if (platform === 'apple') {
      const match = pageUrl.match(/\/id(\d+)/)
      if (match) {
        const lookupUrl = `https://itunes.apple.com/lookup?id=${match[1]}&entity=podcast`
        const response = await fetch(lookupUrl)
        const data = await response.json()
        if (data.results?.[0]?.feedUrl) {
          return data.results[0].feedUrl
        }
      }
    }

    // Try to extract from page content
    const response = await fetch(pageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; KnowNote/1.0)',
      },
      signal: AbortSignal.timeout(15000),
    })

    const html = await response.text()

    // Look for RSS link in page
    const rssMatch = html.match(/<link[^>]*type=["']application\/rss\+xml["'][^>]*href=["']([^"']+)["']/i)
    if (rssMatch) {
      return rssMatch[1]
    }

    // Look for feed URL in JSON-LD or other structured data
    const feedMatch = html.match(/["']feedUrl["']\s*:\s*["']([^"']+)["']/i)
    if (feedMatch) {
      return feedMatch[1]
    }

    return null
  } catch (error) {
    console.error('Failed to find podcast feed URL:', error)
    return null
  }
}

/**
 * Get podcast info from a URL (either RSS feed or platform URL)
 */
export async function getPodcastInfo(url: string): Promise<PodcastFeed | null> {
  try {
    // Check if it's an RSS feed directly
    if (url.includes('.xml') || url.includes('/feed') || url.includes('/rss')) {
      return await parsePodcastFeed(url)
    }

    // Try to find the RSS feed URL
    const feedUrl = await findPodcastFeedUrl(url)
    if (feedUrl) {
      return await parsePodcastFeed(feedUrl)
    }

    return null
  } catch (error) {
    console.error('Failed to get podcast info:', error)
    return null
  }
}
