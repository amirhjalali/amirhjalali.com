/**
 * Podcast Platform Extractor
 *
 * Handles podcast URLs from various platforms:
 * - Apple Podcasts
 * - Spotify Podcasts
 * - Google Podcasts
 * - Pocket Casts
 * - RSS feeds with audio content
 *
 * Uses summarize-core for transcription via:
 * - Published podcast transcripts (when available)
 * - Whisper transcription (fallback)
 */

import type { ExtractionResult, AuthorInfo, MediaItem } from '@/lib/types'
import {
  PlatformExtractor,
  EXTRACTOR_VERSION,
  createSuccessResult,
  createFailureResult,
  cleanText,
  generateExcerpt,
  extractDomain,
  fetchWithTimeout,
} from './base'
import {
  getSummarizeService,
  isPodcastHost,
  type SummarizeResult,
} from '@/lib/summarize-service'

// Podcast URL patterns
const PODCAST_PATTERNS = [
  // Apple Podcasts
  /^https?:\/\/podcasts\.apple\.com\//i,
  /^https?:\/\/itunes\.apple\.com\/.*podcast/i,
  // Spotify Podcasts
  /^https?:\/\/open\.spotify\.com\/(?:show|episode)\//i,
  // Google Podcasts (deprecated but may still have URLs)
  /^https?:\/\/podcasts\.google\.com\//i,
  // Pocket Casts
  /^https?:\/\/pca\.st\//i,
  /^https?:\/\/pocketcasts\.com\//i,
  // Overcast
  /^https?:\/\/overcast\.fm\//i,
  // Castro
  /^https?:\/\/castro\.fm\//i,
  // RSS feeds (generic, check content-type)
  /^https?:\/\/.*\/(?:feed|rss|podcast)(?:\.xml)?/i,
  // Anchor/Spotify for Podcasters
  /^https?:\/\/anchor\.fm\//i,
  /^https?:\/\/podcasters\.spotify\.com\//i,
  // Simplecast
  /^https?:\/\/.*\.simplecast\.com\//i,
  // Transistor
  /^https?:\/\/.*\.transistor\.fm\//i,
  // Podbean
  /^https?:\/\/.*\.podbean\.com\//i,
  // Buzzsprout
  /^https?:\/\/.*\.buzzsprout\.com\//i,
  // Libsyn
  /^https?:\/\/.*\.libsyn\.com\//i,
  // Soundcloud (when it's a podcast)
  /^https?:\/\/soundcloud\.com\/.*(?:podcast|episode)/i,
]

export class PodcastExtractor implements PlatformExtractor {
  platform = 'podcast' as const
  version = EXTRACTOR_VERSION

  canHandle(url: string): boolean {
    // First check using summarize-core's detection
    if (isPodcastHost(url)) {
      return true
    }

    // Then check our patterns
    return PODCAST_PATTERNS.some(pattern => pattern.test(url))
  }

  async extract(url: string): Promise<ExtractionResult> {
    try {
      const summarizeService = getSummarizeService()

      if (!summarizeService.isPodcastAvailable()) {
        console.log('[Podcast] Podcast extraction disabled, using basic metadata')
        return this.extractBasicMetadata(url)
      }

      console.log('[Podcast] Extracting podcast content with summarize service')

      // Use summarize service for transcription
      const result = await summarizeService.extract(url, {
        mediaTranscript: 'prefer', // Prefer transcript extraction for podcasts
        transcriptTimestamps: true,
      })

      if (!result.success) {
        console.warn('[Podcast] Summarize extraction failed:', result.error)
        return this.extractBasicMetadata(url)
      }

      return this.buildResultFromSummarize(url, result)
    } catch (error) {
      console.error('[Podcast] Extraction error:', error)
      return createFailureResult('podcast', `Extraction failed: ${error}`)
    }
  }

  /**
   * Build extraction result from summarize service
   */
  private buildResultFromSummarize(
    url: string,
    result: SummarizeResult
  ): ExtractionResult {
    const domain = extractDomain(url)

    // Build media items
    const mediaItems: MediaItem[] = []
    if (result.media?.type === 'audio' || result.media?.durationSeconds) {
      mediaItems.push({
        type: 'audio',
        url: result.media.videoUrl || url,
        duration: result.media.durationSeconds ?? undefined,
      })
    }

    // Determine author from content or title
    const author = this.extractPodcastAuthor(result)

    return createSuccessResult('podcast', {
      title: result.title ?? undefined,
      content: result.content,
      excerpt: generateExcerpt(result.description || result.content, 200),
      author,
      thumbnailUrl: undefined, // Could be extracted from page
      mediaItems,
      platformData: {
        domain,
        siteName: result.siteName,
        hasTranscript: !!result.transcript?.text,
        wordCount: result.transcript?.wordCount ?? result.wordCount,
        // Audio duration
        duration: result.media?.durationSeconds,
        durationFormatted: result.media?.durationSeconds
          ? this.formatDuration(result.media.durationSeconds)
          : undefined,
        // Transcript metadata
        transcriptSource: result.transcript?.source,
        transcriptSegments: result.transcript?.segments?.map(s => ({
          text: s.text,
          startMs: s.startMs,
          endMs: s.endMs ?? undefined,
        })),
        // Diagnostics
        transcriptionProvider: result.diagnostics?.transcriptProvider,
      },
    })
  }

  /**
   * Extract basic metadata without transcription
   */
  private async extractBasicMetadata(url: string): Promise<ExtractionResult> {
    try {
      const response = await fetchWithTimeout(url)
      if (!response.ok) {
        return createFailureResult('podcast', `Request failed: ${response.status}`)
      }

      const html = await response.text()
      const domain = extractDomain(url)

      // Extract OG metadata
      const title = this.extractOgTag(html, 'og:title') || this.extractTitle(html)
      const description = this.extractOgTag(html, 'og:description')
      const image = this.extractOgTag(html, 'og:image')
      const siteName = this.extractOgTag(html, 'og:site_name')

      return createSuccessResult('podcast', {
        title,
        content: description || '',
        excerpt: generateExcerpt(description || '', 200),
        thumbnailUrl: image,
        platformData: {
          domain,
          siteName,
          hasTranscript: false,
          note: 'Podcast transcription requires OPENAI_API_KEY or FAL_KEY for Whisper',
        },
      })
    } catch (error) {
      return createFailureResult('podcast', `Basic extraction failed: ${error}`)
    }
  }

  /**
   * Extract author from podcast content or metadata
   */
  private extractPodcastAuthor(result: SummarizeResult): AuthorInfo | undefined {
    // Try to extract host/author from title or description
    // Common patterns: "Podcast Name with Host Name", "The X Show - Episode Y"
    if (result.title) {
      const withMatch = result.title.match(/with\s+([^-|]+)/i)
      if (withMatch) {
        return { name: withMatch[1].trim() }
      }

      const byMatch = result.title.match(/by\s+([^-|]+)/i)
      if (byMatch) {
        return { name: byMatch[1].trim() }
      }
    }

    // Check siteName as potential show name
    if (result.siteName) {
      return { name: result.siteName }
    }

    return undefined
  }

  /**
   * Format duration in seconds to human readable string
   */
  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  /**
   * Extract OG tag from HTML
   */
  private extractOgTag(html: string, property: string): string | undefined {
    const patterns = [
      new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i'),
    ]

    for (const pattern of patterns) {
      const match = html.match(pattern)
      if (match) return this.decodeHtmlEntities(match[1])
    }
    return undefined
  }

  /**
   * Extract title from HTML
   */
  private extractTitle(html: string): string | undefined {
    const match = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    if (match) {
      return this.decodeHtmlEntities(match[1]).trim()
    }
    return undefined
  }

  /**
   * Decode HTML entities
   */
  private decodeHtmlEntities(str: string): string {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
  }
}

export const podcastExtractor = new PodcastExtractor()
