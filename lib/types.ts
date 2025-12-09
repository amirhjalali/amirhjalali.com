export interface Reference {
    type: 'url' | 'text'
    content: string
    title?: string
}

export interface AIMetadata {
    textModel?: string
    imageModel?: string
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
export type NoteType = 'LINK' | 'TEXT' | 'IMAGE' | 'VIDEO'
export type ProcessStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

export interface NoteMetadata {
    domain?: string
    title?: string
    description?: string
    image?: string
    favicon?: string
    error?: string
    [key: string]: any
}

export interface Note {
    id: string
    type: NoteType
    content: string
    title?: string | null
    imageUrl?: string | null
    videoUrl?: string | null
    excerpt?: string | null
    metadata?: NoteMetadata | null
    tags: string[]
    topics: string[]
    processStatus: ProcessStatus
    processedAt?: string | null
    summary?: string | null
    keyInsights: string[]
    sentiment?: string | null
    createdAt: string
    updatedAt: string
}

export interface NoteArticleRef {
    id: string
    noteId: string
    articleId: string
    createdAt: string
}
