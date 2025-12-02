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

// GET /api/articles/[id] - Get single article
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const article = await prisma.article.findUnique({
      where: { id }
    })

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(article)
  } catch (error: any) {
    console.error('GET /api/articles/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch article', details: error.message },
      { status: 500 }
    )
  }
}

// PATCH /api/articles/[id] - Update article
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()

    // If title is being updated, regenerate slug
    let updateData: any = { ...body }

    if (body.title) {
      const baseSlug = slugify(body.title)
      updateData.slug = await ensureUniqueSlug(baseSlug, id)
    }

    // Recalculate read time if content changed
    if (body.content && !body.readTime) {
      updateData.readTime = calculateReadTime(body.content)
    }

    const article = await prisma.article.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(article)
  } catch (error: any) {
    console.error('PATCH /api/articles/[id] error:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update article', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/articles/[id] - Delete article
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    await prisma.article.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Article deleted' })
  } catch (error: any) {
    console.error('DELETE /api/articles/[id] error:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete article', details: error.message },
      { status: 500 }
    )
  }
}
