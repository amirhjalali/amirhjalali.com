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
    status?: 'published' | 'draft' // Added for compatibility
    metadata?: Record<string, any> // Added for compatibility
}

export interface Draft {
    id: string
    title: string
    content: string
    excerpt?: string
    tags: string[]
    imageUrl?: string
    aiGenerated: boolean
    createdAt: string
    updatedAt: string
}
