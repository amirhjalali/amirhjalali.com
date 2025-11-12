import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

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

async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug
  let counter = 1

  while (await prisma.article.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

// POST /api/drafts/[id]/publish - Publish draft as article
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Get draft
    const draft = await prisma.draft.findUnique({
      where: { id }
    })

    if (!draft) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      )
    }

    // Generate slug
    const baseSlug = slugify(draft.title)
    const uniqueSlug = await ensureUniqueSlug(baseSlug)

    // Create article from draft
    const article = await prisma.article.create({
      data: {
        title: draft.title,
        slug: uniqueSlug,
        content: draft.content,
        excerpt: draft.excerpt || '',
        tags: draft.tags,
        imageUrl: draft.imageUrl,
        readTime: calculateReadTime(draft.content),
        author: 'Amir H. Jalali',
        aiGenerated: draft.aiGenerated,
        published: true,
        publishedAt: new Date(),
      }
    })

    // Delete draft after publishing
    await prisma.draft.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      article,
      message: 'Draft published successfully',
    })
  } catch (error: any) {
    console.error('POST /api/drafts/[id]/publish error:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to publish draft', details: error.message },
      { status: 500 }
    )
  }
}
