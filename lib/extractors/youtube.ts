/**
 * YouTube Platform Extractor
 *
 * Uses multiple strategies for best results:
 * 1. Summarize service (web API → Apify → yt-dlp fallback chain)
 * 2. Legacy youtube-transcript library as fallback
 * 3. oEmbed/noembed for metadata
 * 4. Page scraping for view counts
 */

import type { ExtractionResult, AuthorInfo, MediaItem, TranscriptSource } from '@/lib/types'
import {
  PlatformExtractor,
  EXTRACTOR_VERSION,
  createSuccessResult,
  createFailureResult,
  generateExcerpt,
  fetchWithTimeout,
} from './base'
import {
  extractYouTubeVideoId as legacyExtractVideoId,
  fetchYouTubeTranscript,
  formatDuration,
} from '@/lib/youtube-transcript'
import {
  getSummarizeService,
  extractYouTubeVideoId,
  isYouTubeVideoUrl,
  type SummarizeResult,
} from '@/lib/summarize-service'

// Use summarize-core's video ID extractor, fallback to legacy
function getVideoId(url: string): string | null {
  return extractYouTubeVideoId(url) || legacyExtractVideoId(url)
}

export class YouTubeExtractor implements PlatformExtractor {
  platform = 'youtube' as const
  version = EXTRACTOR_VERSION

  canHandle(url: string): boolean {
    return /^https?:\/\/(www\.)?youtube\.com\//i.test(url) ||
           /^https?:\/\/youtu\.be\//i.test(url) ||
           /^https?:\/\/(www\.)?youtube\.com\/shorts\//i.test(url) ||
           isYouTubeVideoUrl(url)
  }

  async extract(url: string): Promise<ExtractionResult> {
    const videoId = getVideoId(url)
    if (!videoId) {
      return createFailureResult('youtube', 'Could not extract video ID from URL')
    }

    try {
      // Try summarize service first for enhanced extraction
      const summarizeService = getSummarizeService()
      let summarizeResult: SummarizeResult | null = null

      if (summarizeService.isYouTubeAvailable()) {
        console.log('[YouTube] Attempting extraction with summarize service')
        summarizeResult = await summarizeService.extract(url)

        if (summarizeResult.success && summarizeResult.transcript?.text) {
          console.log('[YouTube] Summarize extraction successful', {
            source: summarizeResult.transcript.source,
            wordCount: summarizeResult.transcript.wordCount,
          })
          return this.buildResultFromSummarize(url, videoId, summarizeResult)
        }

        console.log('[YouTube] Summarize extraction incomplete, trying legacy fallback')
      }

      // Fallback to legacy extraction
      const [oEmbedData, noEmbedData, legacyTranscript] = await Promise.all([
        this.fetchOEmbed(url).catch(() => null),
        this.fetchNoEmbed(url).catch(() => null),
        fetchYouTubeTranscript(videoId).catch(() => null),
      ])

      if (!oEmbedData && !noEmbedData) {
        return createFailureResult('youtube', 'Could not fetch video metadata')
      }

      const data = { ...noEmbedData, ...oEmbedData }

      // Build author info
      const author: AuthorInfo = {
        name: data.author_name,
        profileUrl: data.author_url,
      }

      // Build media items
      const mediaItems: MediaItem[] = [{
        type: 'video',
        url: url,
        thumbnailUrl: this.getBestThumbnail(videoId),
        width: data.width,
        height: data.height,
        duration: legacyTranscript?.duration,
      }]

      // Content is the transcript or description
      const content = legacyTranscript?.fullText || data.description || ''
      const description = data.description || ''

      // Try to get view count from page (optional, may fail)
      let engagement = undefined
      try {
        const pageData = await this.scrapePageForEngagement(url)
        if (pageData) {
          engagement = pageData
        }
      } catch {
        // View count is optional
      }

      // Determine transcript source
      let transcriptSource: TranscriptSource | null = null
      if (legacyTranscript) {
        transcriptSource = 'legacy'
      } else if (summarizeResult?.transcript?.source) {
        transcriptSource = summarizeResult.transcript.source
      }

      return createSuccessResult('youtube', {
        title: data.title,
        content: content,
        excerpt: generateExcerpt(description || content, 200),
        author,
        thumbnailUrl: this.getBestThumbnail(videoId),
        engagement,
        mediaItems,
        platformData: {
          postId: videoId,
          publishedAt: data.upload_date,
          duration: legacyTranscript?.duration,
          durationFormatted: legacyTranscript?.duration ? formatDuration(legacyTranscript.duration) : undefined,
          hasTranscript: !!legacyTranscript || !!summarizeResult?.transcript?.text,
          wordCount: legacyTranscript?.wordCount,
          isShort: url.includes('/shorts/'),
          // Enhanced metadata
          transcriptSource,
          transcriptSegments: legacyTranscript?.segments?.map(s => ({
            text: s.text,
            startMs: s.offset,
            endMs: s.offset + s.duration,
          })),
        },
      })
    } catch (error) {
      return createFailureResult('youtube', `Extraction failed: ${error}`)
    }
  }

  /**
   * Build extraction result from summarize service result
   */
  private async buildResultFromSummarize(
    url: string,
    videoId: string,
    result: SummarizeResult
  ): Promise<ExtractionResult> {
    // Get additional metadata from oEmbed
    const oEmbedData = await this.fetchOEmbed(url).catch(() => null)

    // Build author info
    const author: AuthorInfo = oEmbedData ? {
      name: oEmbedData.author_name,
      profileUrl: oEmbedData.author_url,
    } : {}

    // Build media items
    const mediaItems: MediaItem[] = [{
      type: 'video',
      url: url,
      thumbnailUrl: this.getBestThumbnail(videoId),
      width: oEmbedData?.width,
      height: oEmbedData?.height,
      duration: result.media?.durationSeconds ?? undefined,
    }]

    // Try to get engagement
    let engagement = undefined
    try {
      const pageData = await this.scrapePageForEngagement(url)
      if (pageData) {
        engagement = pageData
      }
    } catch {
      // View count is optional
    }

    return createSuccessResult('youtube', {
      title: result.title || oEmbedData?.title,
      content: result.content,
      excerpt: generateExcerpt(result.description || result.content, 200),
      author,
      thumbnailUrl: this.getBestThumbnail(videoId),
      engagement,
      mediaItems,
      platformData: {
        postId: videoId,
        publishedAt: oEmbedData?.upload_date,
        duration: result.media?.durationSeconds,
        durationFormatted: result.media?.durationSeconds
          ? formatDuration(result.media.durationSeconds)
          : undefined,
        hasTranscript: true,
        wordCount: result.transcript?.wordCount ?? result.wordCount,
        isShort: url.includes('/shorts/'),
        // Enhanced metadata from summarize
        transcriptSource: result.transcript?.source,
        transcriptSegments: result.transcript?.segments?.map(s => ({
          text: s.text,
          startMs: s.startMs,
          endMs: s.endMs ?? undefined,
        })),
        // Diagnostics
        summarizeProvider: result.diagnostics?.transcriptProvider,
        firecrawlUsed: result.diagnostics?.firecrawlUsed,
      },
    })
  }

  /**
   * Fetch from YouTube's oEmbed API
   */
  private async fetchOEmbed(url: string): Promise<any> {
    const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
    const response = await fetchWithTimeout(oEmbedUrl)

    if (!response.ok) {
      throw new Error(`oEmbed returned ${response.status}`)
    }

    return response.json()
  }

  /**
   * Fetch from noembed service for additional metadata
   */
  private async fetchNoEmbed(url: string): Promise<any> {
    const noEmbedUrl = `https://noembed.com/embed?url=${encodeURIComponent(url)}`
    const response = await fetchWithTimeout(noEmbedUrl)

    if (!response.ok) {
      throw new Error(`noembed returned ${response.status}`)
    }

    return response.json()
  }

  /**
   * Get the best quality thumbnail URL
   */
  private getBestThumbnail(videoId: string): string {
    // YouTube thumbnail URLs in order of quality
    // maxresdefault may not exist for all videos
    return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
  }

  /**
   * Try to scrape view count from page
   * This is unreliable and may fail, but worth trying
   */
  private async scrapePageForEngagement(url: string): Promise<{ views?: number; likes?: number } | null> {
    try {
      const response = await fetchWithTimeout(url)
      if (!response.ok) return null

      const html = await response.text()

      // Try to find view count in page data
      // YouTube embeds this in JSON
      const viewMatch = html.match(/"viewCount":\s*"(\d+)"/)
      const likeMatch = html.match(/"likes":\s*"?(\d+)"?/) ||
                        html.match(/"likeCount":\s*(\d+)/)

      if (viewMatch || likeMatch) {
        return {
          views: viewMatch ? parseInt(viewMatch[1], 10) : undefined,
          likes: likeMatch ? parseInt(likeMatch[1], 10) : undefined,
        }
      }

      return null
    } catch {
      return null
    }
  }
}

export const youtubeExtractor = new YouTubeExtractor()
