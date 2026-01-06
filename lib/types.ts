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
    [key: string]: any
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
export type NoteType = 'LINK' | 'TEXT' | 'IMAGE' | 'VIDEO' | 'PDF' | 'DOCUMENT'
export type ProcessStatus = 'PENDING' | 'PROCESSING' | 'INDEXED' | 'COMPLETED' | 'PARTIAL' | 'FAILED'

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

    // Rich content
    imageUrl?: string | null
    videoUrl?: string | null
    excerpt?: string | null

    // Full extracted content
    fullContent?: string | null
    contentHash?: string | null
    wordCount?: number | null

    // Metadata
    metadata?: NoteMetadata | null

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

export interface ProgressEvent {
    step: GenerationStep
    progress: number // 0-100
    message: string
    estimatedTimeRemaining?: number // seconds
    error?: string
}
