import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { getSession } from '@/app/actions/auth'

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
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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

    // UNPUBLISH: Move article back to drafts
    if (!shouldPublish) {
      // Create a draft from the article
      const draft = await prisma.draft.create({
        data: {
          title: article.title,
          content: article.content,
          excerpt: article.excerpt,
          tags: article.tags,
          imageUrl: article.imageUrl,
          readTime: article.readTime,
          author: article.author,
          aiGenerated: article.aiGenerated,
        }
      })

      // Delete the article
      await prisma.article.delete({
        where: { id }
      })

      revalidatePath('/thoughts')
      revalidatePath(`/thoughts/${id}`)
      if (article.slug) {
        revalidatePath(`/thoughts/${article.slug}`)
      }

      return NextResponse.json({
        success: true,
        draft,
        message: 'Article moved back to drafts',
      })
    }

    // PUBLISH: Update article status
    const updated = await prisma.article.update({
      where: { id },
      data: {
        published: true,
        publishedAt: article.publishedAt || new Date(),
      }
    })

    revalidatePath('/thoughts')
    revalidatePath(`/thoughts/${updated.id}`)
    if (updated.slug) {
      revalidatePath(`/thoughts/${updated.slug}`)
    }

    return NextResponse.json({
      success: true,
      article: updated,
      message: 'Article published',
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
