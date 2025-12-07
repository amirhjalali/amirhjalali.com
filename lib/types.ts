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
