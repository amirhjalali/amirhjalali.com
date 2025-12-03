import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/app/actions/auth'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100)
}

function calculateReadTime(content: string): string {
  const wordsPerMinute = 200
  const wordCount = content.split(/\s+/).length
  const minutes = Math.ceil(wordCount / wordsPerMinute)
  return `${minutes} min read`
}

async function ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
  let slug = baseSlug
  let counter = 1

  while (true) {
    const existing = await prisma.article.findUnique({ where: { slug } })
    if (!existing || existing.id === excludeId) break
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

// GET /api/articles - List all articles (published and unpublished)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const publishedOnly = searchParams.get('published') === 'true'

    const articles = await prisma.article.findMany({
      where: publishedOnly ? {
        published: true,
        publishedAt: { lte: new Date() }
      } : undefined,
      orderBy: { publishedAt: 'desc' },
    })

    return NextResponse.json(articles)
  } catch (error: any) {
    console.error('GET /api/articles error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles', details: error.message },
      { status: 500 }
    )
  }
}

// POST /api/articles - Create new article
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    const baseSlug = slugify(body.title)
    const uniqueSlug = await ensureUniqueSlug(baseSlug)

    const article = await prisma.article.create({
      data: {
        title: body.title,
        slug: uniqueSlug,
        content: body.content,
        excerpt: body.excerpt,
        tags: body.tags || [],
        imageUrl: body.imageUrl || null,
        readTime: body.readTime || calculateReadTime(body.content),
        author: body.author || 'Amir H. Jalali',
        aiGenerated: body.aiGenerated || false,
        published: body.published || false,
        publishedAt: body.published ? new Date() : null,
      }
    })

    return NextResponse.json(article, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/articles error:', error)
    return NextResponse.json(
      { error: 'Failed to create article', details: error.message },
      { status: 500 }
    )
  }
}
