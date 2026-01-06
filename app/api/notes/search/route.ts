import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { semanticSearch } from '@/lib/embedding-service'
import { prisma } from '@/lib/db'

// POST /api/notes/search - Semantic search across notes
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { query, notebookId, limit = 10, threshold = 0.5 } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    // Perform semantic search
    const results = await semanticSearch(query, {
      limit,
      notebookId,
      threshold,
    })

    // Get unique note IDs and fetch full note data
    const noteIds = [...new Set(results.map(r => r.noteId))]

    const notes = await prisma.note.findMany({
      where: { id: { in: noteIds } },
      select: {
        id: true,
        title: true,
        type: true,
        excerpt: true,
        imageUrl: true,
        domain: true,
        favicon: true,
        tags: true,
        topics: true,
        createdAt: true,
      },
    })

    // Create a map for quick lookup
    const noteMap = new Map(notes.map(n => [n.id, n]))

    // Build enriched results
    const enrichedResults = results.map(result => ({
      ...result,
      note: noteMap.get(result.noteId),
    }))

    return NextResponse.json({
      results: enrichedResults,
      query,
      totalMatches: results.length,
    })
  } catch (error: any) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Failed to search', details: error.message },
      { status: 500 }
    )
  }
}
