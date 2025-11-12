import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

async function getNextVersionNumber(articleId: string): Promise<number> {
  const lastVersion = await prisma.articleVersion.findFirst({
    where: { articleId },
    orderBy: { versionNumber: 'desc' },
  })

  return (lastVersion?.versionNumber || 0) + 1
}

// POST /api/articles/[id]/publish - Publish or unpublish article
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const shouldPublish = body.publish !== false // Default to publish

    // Get current article state
    const article = await prisma.article.findUnique({
      where: { id }
    })

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    // Create version snapshot if publishing
    if (shouldPublish && !article.published) {
      const versionNumber = await getNextVersionNumber(id)

      await prisma.articleVersion.create({
        data: {
          articleId: id,
          title: article.title,
          content: article.content,
          excerpt: article.excerpt,
          versionNumber,
          changeNote: 'Published',
        }
      })
    }

    // Update article status
    const updated = await prisma.article.update({
      where: { id },
      data: {
        published: shouldPublish,
        publishedAt: shouldPublish ? (article.publishedAt || new Date()) : null,
      }
    })

    return NextResponse.json({
      success: true,
      article: updated,
      message: shouldPublish ? 'Article published' : 'Article unpublished',
    })
  } catch (error: any) {
    console.error('POST /api/articles/[id]/publish error:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to publish/unpublish article', details: error.message },
      { status: 500 }
    )
  }
}
