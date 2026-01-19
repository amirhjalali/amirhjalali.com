/**
 * YouTube Platform Extractor
 *
 * Uses multiple strategies:
 * 1. YouTube oEmbed API for video metadata
 * 2. YouTube noembed for additional data
 * 3. Existing transcript service for full content
 * 4. Page scraping for view counts
 */

import type { ExtractionResult, AuthorInfo, MediaItem } from '@/lib/types'
import {
  PlatformExtractor,
  EXTRACTOR_VERSION,
  createSuccessResult,
  createFailureResult,
  cleanText,
  generateExcerpt,
  parseEngagementNumber,
  fetchWithTimeout,
} from './base'
import {
  extractYouTubeVideoId,
  fetchYouTubeTranscript,
  formatDuration,
} from '@/lib/youtube-transcript'

export class YouTubeExtractor implements PlatformExtractor {
  platform = 'youtube' as const
  version = EXTRACTOR_VERSION

  canHandle(url: string): boolean {
    return /^https?:\/\/(www\.)?youtube\.com\//i.test(url) ||
           /^https?:\/\/youtu\.be\//i.test(url) ||
           /^https?:\/\/(www\.)?youtube\.com\/shorts\//i.test(url)
  }

  async extract(url: string): Promise<ExtractionResult> {
    const videoId = extractYouTubeVideoId(url)
    if (!videoId) {
      return createFailureResult('youtube', 'Could not extract video ID from URL')
    }

    try {
      // Fetch metadata from oEmbed and noembed in parallel
      const [oEmbedData, noEmbedData, transcript] = await Promise.all([
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
        duration: transcript?.duration,
      }]

      // Content is the transcript or description
      const content = transcript?.fullText || data.description || ''
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
          duration: transcript?.duration,
          durationFormatted: transcript?.duration ? formatDuration(transcript.duration) : undefined,
          hasTranscript: !!transcript,
          wordCount: transcript?.wordCount,
          isShort: url.includes('/shorts/'),
        },
      })
    } catch (error) {
      return createFailureResult('youtube', `Extraction failed: ${error}`)
    }
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
