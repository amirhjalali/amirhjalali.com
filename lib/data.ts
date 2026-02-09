import { prisma } from '@/lib/db'
import { Article as PrismaArticle, Draft as PrismaDraft } from '@prisma/client'
import { Article, AIMetadata } from '@/lib/types'

// Helper to transform Prisma Article to App Article
function transformArticle(pArticle: PrismaArticle): Article {
    return {
        id: pArticle.id,
        title: pArticle.title,
        slug: pArticle.slug,
        content: pArticle.content,
        excerpt: pArticle.excerpt,
        tags: pArticle.tags,
        imageUrl: pArticle.imageUrl || undefined,
        aiGenerated: pArticle.aiGenerated,
        author: pArticle.author,
        publishedAt: pArticle.publishedAt ? pArticle.publishedAt.toISOString() : new Date().toISOString(),
        readTime: pArticle.readTime,
        status: pArticle.published ? 'published' : 'draft',
        metadata: (pArticle.metadata as AIMetadata) || {},
    }
}

export async function getPublishedArticles(): Promise<Article[]> {
    try {
        const articles = await prisma.article.findMany({
            where: {
                published: true,
                publishedAt: {
                    lte: new Date()
                }
            },
            orderBy: { publishedAt: 'desc' },
        })
        return articles.map(transformArticle)
    } catch (error) {
        console.error('Error fetching articles:', error)
        return []
    }
}

export async function getArticle(idOrSlug: string): Promise<Article | null> {
    try {
        let article = await prisma.article.findUnique({
            where: { id: idOrSlug },
        })

        if (!article) {
            article = await prisma.article.findUnique({
                where: { slug: idOrSlug },
            })
        }

        return article ? transformArticle(article) : null
    } catch (error) {
        console.error('Error fetching article:', error)
        return null
    }
}

export async function getAllArticleIds(): Promise<{ id: string }[]> {
    try {
        const articles = await prisma.article.findMany({
            where: { published: true },
            select: { id: true },
        })
        return articles
    } catch (error) {
        console.error('Error fetching article IDs:', error)
        return []
    }
}

// Helper to transform Prisma Draft to App Article
function transformDraft(draft: PrismaDraft): Article {
    return {
        id: draft.id,
        title: draft.title,
        slug: draft.id, // Drafts don't have slugs, use ID
        content: draft.content,
        excerpt: draft.excerpt || '',
        tags: draft.tags,
        imageUrl: draft.imageUrl || undefined,
        aiGenerated: draft.aiGenerated,
        author: "Amir H. Jalali", // Default author
        publishedAt: draft.updatedAt.toISOString(), // Use updated time for preview
        readTime: draft.readTime || '1 min read',
        status: 'draft',
        metadata: (draft.metadata as AIMetadata) || {},
    }
}

export async function getArticlesByTag(tag: string): Promise<Article[]> {
    try {
        const articles = await prisma.article.findMany({
            where: {
                published: true,
                publishedAt: { lte: new Date() },
                tags: { has: tag },
            },
            orderBy: { publishedAt: 'desc' },
        })
        return articles.map(transformArticle)
    } catch (error) {
        console.error('Error fetching articles by tag:', error)
        return []
    }
}

export async function getAllTags(): Promise<string[]> {
    try {
        const articles = await prisma.article.findMany({
            where: {
                published: true,
                publishedAt: { lte: new Date() },
            },
            select: { tags: true },
        })
        const tagSet = new Set<string>()
        articles.forEach(a => a.tags.forEach(t => tagSet.add(t)))
        return Array.from(tagSet).sort()
    } catch (error) {
        console.error('Error fetching all tags:', error)
        return []
    }
}

export async function getRelatedArticles(articleId: string, tags: string[], limit: number = 3): Promise<Article[]> {
    try {
        const articles = await prisma.article.findMany({
            where: {
                published: true,
                publishedAt: { lte: new Date() },
                id: { not: articleId },
                tags: { hasSome: tags },
            },
            orderBy: { publishedAt: 'desc' },
        })
        // Sort by number of shared tags (most relevant first)
        const scored = articles.map(a => ({
            article: a,
            score: a.tags.filter(t => tags.includes(t)).length,
        }))
        scored.sort((a, b) => b.score - a.score)
        return scored.slice(0, limit).map(s => transformArticle(s.article))
    } catch (error) {
        console.error('Error fetching related articles:', error)
        return []
    }
}

export async function getDraft(id: string): Promise<Article | null> {
    try {
        const draft = await prisma.draft.findUnique({
            where: { id },
        })
        return draft ? transformDraft(draft) : null
    } catch (error) {
        console.error('Error fetching draft:', error)
        return null
    }
}
