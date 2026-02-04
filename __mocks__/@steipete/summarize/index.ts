/**
 * Mock for @steipete/summarize package
 * Used in Jest tests to avoid ESM import issues
 */

// Mock types
export interface LinkPreviewClient {
  fetchLinkContent: jest.Mock
}

export interface LinkPreviewClientOptions {
  apifyApiToken?: string | null
  falApiKey?: string | null
  openaiApiKey?: string | null
  ytDlpPath?: string | null
  scrapeWithFirecrawl?: ((url: string) => Promise<any>) | null
  onProgress?: ((event: any) => void) | null
}

export interface ExtractedLinkContent {
  url: string
  title: string | null
  description: string | null
  siteName: string | null
  content: string
  wordCount: number
  totalCharacters: number
  truncated: boolean
  transcriptSource?: string | null
  transcriptSegments?: any[] | null
  transcriptTimedText?: string | null
  transcriptWordCount?: number | null
  transcriptLines?: number | null
  transcriptCharacters?: number | null
  transcriptionProvider?: string | null
  video?: {
    kind?: string
    url?: string
  } | null
  mediaDurationSeconds?: number | null
  isVideoOnly?: boolean
  diagnostics?: {
    firecrawl?: { used: boolean }
    markdown?: { provider: string }
    strategy?: string
  }
}

export interface FetchLinkContentOptions {
  timeoutMs?: number
  maxCharacters?: number
  format?: string
  markdownMode?: string
  youtubeTranscript?: string
  mediaTranscript?: string
  transcriptTimestamps?: boolean
  firecrawl?: string
}

export type TranscriptSource =
  | 'youtubei'
  | 'captionTracks'
  | 'embedded'
  | 'yt-dlp'
  | 'podcastTranscript'
  | 'whisper'
  | 'apify'
  | 'html'
  | 'unavailable'
  | 'unknown'
  | 'legacy'

// Mock functions
export const createLinkPreviewClient = jest.fn((): LinkPreviewClient => ({
  fetchLinkContent: jest.fn().mockResolvedValue({
    url: 'https://example.com',
    title: 'Mock Title',
    description: 'Mock description',
    siteName: 'Example',
    content: 'Mock content',
    wordCount: 2,
    totalCharacters: 12,
    truncated: false,
    transcriptSource: null,
    transcriptSegments: null,
    video: null,
    mediaDurationSeconds: null,
    diagnostics: {
      strategy: 'mock',
    },
  }),
}))

// URL helper mocks
export const isYouTubeUrl = jest.fn((url: string) =>
  url.includes('youtube.com') || url.includes('youtu.be')
)

export const isYouTubeVideoUrl = jest.fn((url: string) =>
  /youtube\.com\/watch|youtu\.be\//.test(url)
)

export const extractYouTubeVideoId = jest.fn((url: string) => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  return match ? match[1] : null
})

export const isPodcastHost = jest.fn((url: string) =>
  /podcasts\.apple\.com|open\.spotify\.com\/(?:show|episode)|overcast\.fm/.test(url)
)

export const isDirectMediaUrl = jest.fn((url: string) =>
  /\.(mp3|mp4|m4a|wav|ogg|webm)(\?|$)/i.test(url)
)
