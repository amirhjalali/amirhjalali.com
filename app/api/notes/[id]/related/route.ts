import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { findRelatedNotes, getNoteLinks } from '@/lib/knowledge-graph-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    // Get both related notes (by shared topics) and explicit links
    const [relatedByTopics, links] = await Promise.all([
      findRelatedNotes(id, limit),
      getNoteLinks(id),
    ])

    return NextResponse.json({
      relatedByTopics,
      linkedTo: links.linkedTo,
      linkedFrom: links.linkedFrom,
    })
  } catch (error) {
    console.error('Failed to get related notes:', error)
    return NextResponse.json(
      { error: 'Failed to get related notes' },
      { status: 500 }
    )
  }
}
