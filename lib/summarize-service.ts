/**
 * Summarize Service
 *
 * Wrapper around @steipete/summarize-core for enhanced content extraction.
 * Provides YouTube transcripts, podcast transcription, and Firecrawl fallback.
 *
 * Features:
 * - YouTube: web API → Apify → yt-dlp + Whisper fallback chain
 * - Podcasts: Apple Podcasts, Spotify, RSS feeds with Whisper transcription
 * - Generic: Readability → Firecrawl for blocked/paywalled content
 * - Slides: YouTube screenshot extraction with OCR (optional)
 */

import {
  createLinkPreviewClient,
  type LinkPreviewClient,
  type LinkPreviewClientOptions,
  type ExtractedLinkContent,
  type FetchLinkContentOptions,
  type TranscriptSource,
  isYouTubeUrl,
  isYouTubeVideoUrl,
  extractYouTubeVideoId,
  isPodcastHost,
  isDirectMediaUrl,
} from '@steipete/summarize/content'

// Import TranscriptSegment from our types (matches summarize-core structure)
import type { TranscriptSegment } from '@/lib/types'

// Re-export types for use in extractors
export type {
  ExtractedLinkContent,
  FetchLinkContentOptions,
  TranscriptSource,
}
export type { TranscriptSegment }

// Re-export URL helpers
export {
  isYouTubeUrl,
  isYouTubeVideoUrl,
  extractYouTubeVideoId,
  isPodcastHost,
  isDirectMediaUrl,
}

/**
 * Configuration for the summarize service
 */
export interface SummarizeServiceConfig {
  // API Keys (from environment)
  apifyApiToken?: string
  falApiKey?: string
  openaiApiKey?: string
  firecrawlApiKey?: string

  // Feature flags
  youtubeEnabled?: boolean
  podcastEnabled?: boolean
  firecrawlEnabled?: 'off' | 'auto' | 'always'
  slidesEnabled?: boolean
  slidesOcrEnabled?: boolean

  // Paths (for local tools)
  ytDlpPath?: string

  // Progress callback
  onProgress?: (event: SummarizeProgressEvent) => void
}

/**
 * Progress events from summarize operations
 */
export interface SummarizeProgressEvent {
  stage: 'fetching' | 'extracting' | 'transcribing' | 'processing' | 'completed' | 'error'
  message: string
  progress?: number // 0-100
  details?: Record<string, unknown>
}

/**
 * Enhanced extraction result with additional metadata
 */
export interface SummarizeResult {
  success: boolean

  // Core content
  url: string
  title: string | null
  description: string | null
  siteName: string | null
  content: string

  // Content stats
  wordCount: number
  totalCharacters: number
  truncated: boolean

  // Transcript data (for video/audio)
  transcript?: {
    text: string | null
    source: TranscriptSource | null
    segments?: TranscriptSegment[] | null
    timedText?: string | null
    wordCount?: number | null
    lineCount?: number | null
    characterCount?: number | null
  }

  // Media info
  media?: {
    type: 'video' | 'audio' | 'image' | null
    durationSeconds?: number | null
    videoKind?: 'youtube' | 'direct' | null
    videoUrl?: string | null
    isVideoOnly?: boolean
  }

  // Diagnostics for debugging
  diagnostics?: {
    transcriptProvider: string | null
    firecrawlUsed: boolean
    markdownProvider: string | null
    strategy: string
  }

  // Error info
  error?: string
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Partial<SummarizeServiceConfig> = {
  youtubeEnabled: true,
  podcastEnabled: true,
  firecrawlEnabled: 'auto',
  slidesEnabled: false,
  slidesOcrEnabled: false,
}

/**
 * Get configuration from environment variables
 */
function getConfigFromEnv(): SummarizeServiceConfig {
  return {
    apifyApiToken: process.env.APIFY_API_TOKEN,
    falApiKey: process.env.FAL_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY,
    firecrawlApiKey: process.env.FIRECRAWL_API_KEY,

    youtubeEnabled: process.env.SUMMARIZE_YOUTUBE_ENABLED !== 'false',
    podcastEnabled: process.env.SUMMARIZE_PODCAST_ENABLED !== 'false',
    firecrawlEnabled: (process.env.SUMMARIZE_FIRECRAWL_ENABLED as 'off' | 'auto' | 'always') || 'auto',
    slidesEnabled: process.env.SUMMARIZE_SLIDES_ENABLED === 'true',
    slidesOcrEnabled: process.env.SUMMARIZE_SLIDES_OCR_ENABLED === 'true',

    ytDlpPath: process.env.YTDLP_PATH,
  }
}

/**
 * Create a Firecrawl scraper function if API key is available
 */
function createFirecrawlScraper(apiKey: string | undefined) {
  if (!apiKey) return null

  return async (url: string) => {
    try {
      const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          formats: ['markdown', 'html'],
          onlyMainContent: true,
        }),
      })

      if (!response.ok) {
        throw new Error(`Firecrawl returned ${response.status}`)
      }

      const data = await response.json()
      return {
        success: data.success,
        markdown: data.data?.markdown,
        html: data.data?.html,
        metadata: data.data?.metadata,
      }
    } catch (error) {
      console.error('[Summarize] Firecrawl error:', error)
      return null
    }
  }
}

/**
 * Summarize Service class
 */
export class SummarizeService {
  private client: LinkPreviewClient
  private config: SummarizeServiceConfig

  constructor(config?: Partial<SummarizeServiceConfig>) {
    const envConfig = getConfigFromEnv()
    this.config = { ...DEFAULT_CONFIG, ...envConfig, ...config }

    // Build client options
    const clientOptions: LinkPreviewClientOptions = {
      apifyApiToken: this.config.apifyApiToken ?? null,
      falApiKey: this.config.falApiKey ?? null,
      openaiApiKey: this.config.openaiApiKey ?? null,
      ytDlpPath: this.config.ytDlpPath ?? null,

      // Set up Firecrawl if available
      scrapeWithFirecrawl: this.config.firecrawlEnabled !== 'off'
        ? createFirecrawlScraper(this.config.firecrawlApiKey)
        : null,

      // Progress callback
      onProgress: this.config.onProgress ? (event) => {
        this.config.onProgress?.({
          stage: this.mapProgressKind(event.kind),
          message: this.getProgressMessage(event),
          details: event as unknown as Record<string, unknown>,
        })
      } : null,
    }

    this.client = createLinkPreviewClient(clientOptions)
  }

  /**
   * Map internal progress kinds to our stages
   */
  private mapProgressKind(kind: string): SummarizeProgressEvent['stage'] {
    if (kind.startsWith('fetch-html')) return 'fetching'
    if (kind.startsWith('transcript-media-download')) return 'extracting'
    if (kind.startsWith('transcript-whisper')) return 'transcribing'
    if (kind.startsWith('transcript')) return 'transcribing'
    if (kind.startsWith('firecrawl')) return 'extracting'
    if (kind.startsWith('nitter') || kind.startsWith('bird')) return 'extracting'
    return 'processing'
  }

  /**
   * Generate human-readable progress message from event
   */
  private getProgressMessage(event: { kind: string; url?: string; [key: string]: unknown }): string {
    switch (event.kind) {
      case 'fetch-html-start':
        return 'Fetching page content...'
      case 'fetch-html-progress':
        return 'Downloading page...'
      case 'fetch-html-done':
        return 'Page content loaded'
      case 'transcript-media-download-start':
        return 'Downloading media for transcription...'
      case 'transcript-media-download-progress':
        return 'Downloading media...'
      case 'transcript-media-download-done':
        return 'Media downloaded'
      case 'transcript-whisper-start':
        return 'Starting transcription with Whisper...'
      case 'transcript-whisper-progress':
        return 'Transcribing audio...'
      case 'transcript-start':
        return 'Extracting transcript...'
      case 'transcript-done':
        return 'Transcript extraction complete'
      case 'firecrawl-start':
        return 'Using Firecrawl for content extraction...'
      case 'firecrawl-done':
        return 'Firecrawl extraction complete'
      default:
        return `Processing (${event.kind})...`
    }
  }

  /**
   * Extract content from a URL
   */
  async extract(url: string, options?: Partial<FetchLinkContentOptions>): Promise<SummarizeResult> {
    try {
      // Determine content type for optimal extraction
      const isYouTube = isYouTubeVideoUrl(url)
      const isPodcast = isPodcastHost(url)
      const isMedia = isDirectMediaUrl(url)

      // Build fetch options based on content type and config
      const fetchOptions: FetchLinkContentOptions = {
        timeoutMs: 120000,
        maxCharacters: 100000, // Higher limit for transcripts
        format: 'markdown',
        markdownMode: 'readability',

        // YouTube transcript mode
        youtubeTranscript: this.config.youtubeEnabled
          ? 'auto' // Try web API → Apify → yt-dlp
          : 'no-auto',

        // Media/podcast transcription
        mediaTranscript: (this.config.podcastEnabled || isMedia)
          ? 'auto'
          : undefined,

        // Include timestamps for synced playback
        transcriptTimestamps: true,

        // Firecrawl mode
        firecrawl: this.config.firecrawlEnabled,

        // Allow overrides
        ...options,
      }

      console.log(`[Summarize] Extracting ${url}`, {
        isYouTube,
        isPodcast,
        isMedia,
        options: fetchOptions,
      })

      const result = await this.client.fetchLinkContent(url, fetchOptions)

      return this.transformResult(result)
    } catch (error) {
      console.error('[Summarize] Extraction error:', error)
      return {
        success: false,
        url,
        title: null,
        description: null,
        siteName: null,
        content: '',
        wordCount: 0,
        totalCharacters: 0,
        truncated: false,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  /**
   * Transform library result to our format
   */
  private transformResult(result: ExtractedLinkContent): SummarizeResult {
    const hasTranscript = result.transcriptSource && result.transcriptSource !== 'unavailable'

    return {
      success: true,
      url: result.url,
      title: result.title,
      description: result.description,
      siteName: result.siteName,
      content: result.content,
      wordCount: result.wordCount,
      totalCharacters: result.totalCharacters,
      truncated: result.truncated,

      // Transcript data
      transcript: hasTranscript ? {
        text: result.content, // Transcript is in content for video/audio
        source: result.transcriptSource,
        segments: result.transcriptSegments,
        timedText: result.transcriptTimedText,
        wordCount: result.transcriptWordCount,
        lineCount: result.transcriptLines,
        characterCount: result.transcriptCharacters,
      } : undefined,

      // Media info
      media: result.video || result.mediaDurationSeconds ? {
        type: result.video ? 'video' : (result.mediaDurationSeconds ? 'audio' : null),
        durationSeconds: result.mediaDurationSeconds,
        videoKind: result.video?.kind,
        videoUrl: result.video?.url,
        isVideoOnly: result.isVideoOnly,
      } : undefined,

      // Diagnostics
      diagnostics: {
        transcriptProvider: result.transcriptionProvider,
        firecrawlUsed: result.diagnostics?.firecrawl?.used ?? false,
        markdownProvider: result.diagnostics?.markdown?.provider ?? null,
        strategy: result.diagnostics?.strategy ?? 'unknown',
      },
    }
  }

  /**
   * Check if summarize service is available (has required API keys)
   */
  isAvailable(): boolean {
    return !!(this.config.openaiApiKey || this.config.apifyApiToken)
  }

  /**
   * Check if YouTube extraction is available
   */
  isYouTubeAvailable(): boolean {
    return this.config.youtubeEnabled ?? true
  }

  /**
   * Check if podcast extraction is available
   */
  isPodcastAvailable(): boolean {
    return this.config.podcastEnabled ?? true
  }

  /**
   * Check if Firecrawl is available
   */
  isFirecrawlAvailable(): boolean {
    return !!this.config.firecrawlApiKey && this.config.firecrawlEnabled !== 'off'
  }
}

// Singleton instance
let _instance: SummarizeService | null = null

/**
 * Get the shared summarize service instance
 */
export function getSummarizeService(): SummarizeService {
  if (!_instance) {
    _instance = new SummarizeService()
  }
  return _instance
}

/**
 * Create a new summarize service with custom config
 */
export function createSummarizeService(config?: Partial<SummarizeServiceConfig>): SummarizeService {
  return new SummarizeService(config)
}
