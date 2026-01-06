import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import {
  getReviewQueue,
  getReviewStats,
  recordReview,
  skipReview,
  generateQuizQuestion,
} from '@/lib/spaced-repetition-service'

// GET: Get review queue and stats
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (action === 'stats') {
      const stats = await getReviewStats()
      return NextResponse.json(stats)
    }

    if (action === 'quiz') {
      const noteId = searchParams.get('noteId')
      if (!noteId) {
        return NextResponse.json({ error: 'noteId required' }, { status: 400 })
      }
      const quiz = await generateQuizQuestion(noteId)
      return NextResponse.json(quiz)
    }

    // Default: get review queue
    const queue = await getReviewQueue(limit)
    const stats = await getReviewStats()

    return NextResponse.json({ queue, stats })
  } catch (error) {
    console.error('Failed to get review data:', error)
    return NextResponse.json(
      { error: 'Failed to get review data' },
      { status: 500 }
    )
  }
}

// POST: Record a review
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { noteId, quality, action } = body

    if (!noteId) {
      return NextResponse.json({ error: 'noteId required' }, { status: 400 })
    }

    if (action === 'skip') {
      const daysToSkip = body.days || 1
      await skipReview(noteId, daysToSkip)
      return NextResponse.json({ success: true, action: 'skipped' })
    }

    if (quality === undefined || quality < 0 || quality > 5) {
      return NextResponse.json(
        { error: 'quality must be between 0 and 5' },
        { status: 400 }
      )
    }

    const result = await recordReview(noteId, quality)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to record review:', error)
    return NextResponse.json(
      { error: 'Failed to record review' },
      { status: 500 }
    )
  }
}
