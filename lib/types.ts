export interface Reference {
    type: 'url' | 'text'
    content: string
    title?: string
}

export interface AIMetadata {
    textModel?: string
    imageModel?: string
    imageResolution?: '1K' | '2K' | '4K'
    imageStyle?: string
    imagePrompt?: string
    topic?: string
    additionalInstructions?: string
    references?: Reference[]

    // Eval/A-B Testing Support
    evalGroup?: string           // Group ID for A/B comparisons (e.g., "eval-2026-01-07-001")
    variantId?: 'A' | 'B'        // Which variant in a comparison pair
    comparisonPairId?: string    // Links two articles being compared

    // User feedback for evals
    rating?: number              // 1-5 star rating
    feedback?: string            // Optional written feedback
    ratedAt?: string             // ISO timestamp of rating
    preferredInComparison?: boolean  // Was this the winner in a head-to-head?

    [key: string]: any
}

// Eval comparison result
export interface EvalComparison {
    id: string
    articleA: string             // Article ID
    articleB: string             // Article ID
    topic: string                // Same topic for fair comparison
    modelA: string               // Model used for A
    modelB: string               // Model used for B
    winner?: 'A' | 'B' | 'tie'   // Result
    winnerReason?: string        // Why this one won
    createdAt: string
    evaluatedAt?: string
}

export interface Article {
    id: string
    title: string
    slug?: string
    content: string
    excerpt: string
    tags: string[]
    imageUrl?: string
    aiGenerated: boolean
    author: string
    publishedAt: string
    readTime: string
    published?: boolean
    createdAt?: string
    updatedAt?: string
    status?: 'published' | 'draft'
    metadata?: AIMetadata
}

export interface Draft {
    id: string
    title: string
    content: string
    excerpt?: string
    tags: string[]
    imageUrl?: string
    aiGenerated: boolean
    readTime?: string
    createdAt: string
    updatedAt: string
    metadata?: AIMetadata
}

// Notes Feature Types
export type NoteType = 'LINK' | 'TEXT' | 'IMAGE' | 'VIDEO' | 'PDF' | 'DOCUMENT' | 'AUDIO'
export type ProcessStatus = 'PENDING' | 'EXTRACTING' | 'ANALYZING' | 'PROCESSING' | 'INDEXED' | 'COMPLETED' | 'PARTIAL' | 'FAILED'

// Platform types for extractors
export type Platform = 'twitter' | 'youtube' | 'linkedin' | 'reddit' | 'medium' | 'substack' | 'github' | 'news' | 'generic' | 'podcast'

// Author information extracted from posts
export interface AuthorInfo {
    name?: string
    handle?: string
    avatarUrl?: string
    bio?: string
    profileUrl?: string
    verified?: boolean
    followerCount?: number
}

// Engagement metrics (platform-specific)
export interface EngagementMetrics {
    likes?: number
    shares?: number
    retweets?: number
    comments?: number
    replies?: number
    views?: number
    upvotes?: number
    downvotes?: number
    score?: number
    claps?: number
    stars?: number
    forks?: number
    [key: string]: number | undefined
}

// Media items from posts
export interface MediaItem {
    type: 'image' | 'video' | 'gif' | 'audio'
    url: string
    thumbnailUrl?: string
    alt?: string
    width?: number
    height?: number
    duration?: number // seconds for video/audio
}

// Links mentioned in content
export interface MentionedLink {
    url: string
    title?: string
    domain?: string
    description?: string
    favicon?: string
}

// Extraction result from platform extractors
export interface ExtractionResult {
    platform: Platform
    success: boolean

    // Core content
    title?: string
    content?: string
    excerpt?: string

    // Author
    author?: AuthorInfo

    // Visual
    thumbnailUrl?: string
    screenshotUrl?: string

    // Engagement
    engagement?: EngagementMetrics

    // Media
    mediaItems?: MediaItem[]

    // Links
    mentionedLinks?: MentionedLink[]

    // Platform-specific metadata
    platformData?: {
        postId?: string
        threadId?: string
        isThread?: boolean
        isReply?: boolean
        parentPostUrl?: string
        publishedAt?: string
        editedAt?: string
        subreddit?: string
        repository?: string
        language?: string
        [key: string]: any
    }

    // Extraction metadata
    extractedAt: string
    extractorVersion: string
    error?: string
}

// Domain pattern for learning system
export interface DomainPattern {
    id: string
    domain: string
    version: number
    sampleCount: number
    selectors: {
        title?: string
        author?: string
        authorAvatar?: string
        content?: string
        date?: string
        images?: string
        engagement?: Record<string, string>
    }
    confidence: number // 0-1
    createdAt: string
    updatedAt: string
}

export interface NoteMetadata {
    domain?: string
    title?: string
    description?: string
    image?: string
    favicon?: string
    siteName?: string
    author?: string
    publishedTime?: string
    wordCount?: number
    video?: VideoInfo
    error?: string
    [key: string]: any
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

// Transcript segment for synced playback
export interface TranscriptSegment {
    text: string
    startMs: number
    endMs?: number | null
}

// Transcript source types (from summarize-core)
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
    | 'legacy' // Our existing youtube-transcript library

// Slide extracted from video
export interface SlideInfo {
    timestamp: number // seconds
    imagePath: string
    ocrText?: string | null
}

export interface Note {
    id: string
    type: NoteType
    content: string
    title?: string | null

    // Source info
    sourceUrl?: string | null
    sourceType?: string | null
    domain?: string | null
    favicon?: string | null
    platform?: Platform | null

    // Rich content
    imageUrl?: string | null
    videoUrl?: string | null
    excerpt?: string | null
    thumbnailUrl?: string | null
    screenshotUrl?: string | null

    // Author info (enriched)
    author?: AuthorInfo | null

    // Full extracted content
    fullContent?: string | null
    contentHash?: string | null
    wordCount?: number | null

    // Metadata
    metadata?: NoteMetadata | null

    // Engagement metrics (enriched)
    engagement?: EngagementMetrics | null

    // Media items (enriched)
    mediaItems?: MediaItem[] | null

    // Links mentioned in content (enriched)
    mentionedLinks?: MentionedLink[] | null

    // User's personal notes
    userNotes?: string | null

    // Organization
    tags: string[]
    topics: string[]
    notebookId?: string | null

    // Pinned/favorites
    pinned?: boolean
    starred?: boolean

    // Processing
    processStatus: ProcessStatus
    processedAt?: string | null
    processingError?: string | null

    // AI Analysis
    summary?: string | null
    keyInsights: string[]
    sentiment?: string | null

    // Reading estimate
    readingTime?: number | null

    // Extraction metadata
    extractorUsed?: string | null
    extractedAt?: string | null
    extractionVersion?: string | null

    // Platform-specific data
    platformData?: Record<string, any> | null

    createdAt: string
    updatedAt: string
}

export interface Notebook {
    id: string
    title: string
    description?: string | null
    color?: string | null
    icon?: string | null
    noteCount: number
    createdAt: string
    updatedAt: string
}

export interface NoteChat {
    id: string
    title?: string | null
    notebookId?: string | null
    messages: ChatMessage[]
    messageCount: number
    status: 'active' | 'archived'
    createdAt: string
    updatedAt: string
}

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system'
    content: string
}

export interface NoteArticleRef {
    id: string
    noteId: string
    articleId: string
    createdAt: string
}

export interface SearchResult {
    noteId: string
    chunkId: string
    content: string
    score: number
    noteTitle: string | null
    noteType: string
    note?: Note
}

// Generation Progress Types
export type GenerationStep =
    | 'initializing'
    | 'generating_title'
    | 'generating_content'
    | 'generating_excerpt'
    | 'generating_tags'
    | 'generating_image'
    | 'downloading_image'
    | 'saving_draft'
    | 'completed'
    | 'error'
    // Eval-specific steps
    | 'generating_article_a'
    | 'generating_article_b'
    | 'articles_generated'

export interface ProgressEvent {
    step: GenerationStep
    progress: number // 0-100
    message: string
    estimatedTimeRemaining?: number // seconds
    error?: string
}
