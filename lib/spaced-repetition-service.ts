import { prisma } from './db'

/**
 * SM-2 Algorithm implementation for spaced repetition
 * Based on SuperMemo 2 algorithm
 *
 * Quality ratings:
 * 0 - Complete blackout, no recall
 * 1 - Incorrect, but upon seeing the answer, it was remembered
 * 2 - Incorrect, but the correct answer seemed easy to recall
 * 3 - Correct with serious difficulty
 * 4 - Correct with some hesitation
 * 5 - Perfect response with no hesitation
 */

interface ReviewResult {
  noteId: string
  nextReviewAt: Date
  interval: number
  easeFactor: number
  reviewCount: number
}

/**
 * Calculate the next review date based on SM-2 algorithm
 */
function calculateNextReview(
  quality: number, // 0-5
  currentInterval: number, // in days
  currentEaseFactor: number,
  reviewCount: number
): { interval: number; easeFactor: number; nextReviewAt: Date } {
  // Clamp quality to valid range
  quality = Math.max(0, Math.min(5, quality))

  // Calculate new ease factor
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  let newEaseFactor =
    currentEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))

  // Minimum ease factor is 1.3
  newEaseFactor = Math.max(1.3, newEaseFactor)

  let newInterval: number

  if (quality < 3) {
    // Failed recall - reset to beginning
    newInterval = 1
  } else {
    // Successful recall
    if (reviewCount === 0) {
      newInterval = 1
    } else if (reviewCount === 1) {
      newInterval = 6
    } else {
      newInterval = Math.round(currentInterval * newEaseFactor)
    }
  }

  // Calculate next review date
  const nextReviewAt = new Date()
  nextReviewAt.setDate(nextReviewAt.getDate() + newInterval)

  return {
    interval: newInterval,
    easeFactor: newEaseFactor,
    nextReviewAt,
  }
}

/**
 * Record a review for a note
 */
export async function recordReview(
  noteId: string,
  quality: number // 0-5
): Promise<ReviewResult> {
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    select: {
      interval: true,
      easeFactor: true,
      reviewCount: true,
    },
  })

  if (!note) {
    throw new Error(`Note ${noteId} not found`)
  }

  const { interval, easeFactor, nextReviewAt } = calculateNextReview(
    quality,
    note.interval,
    note.easeFactor,
    note.reviewCount
  )

  await prisma.note.update({
    where: { id: noteId },
    data: {
      lastReviewedAt: new Date(),
      nextReviewAt,
      interval,
      easeFactor,
      reviewCount: note.reviewCount + 1,
    },
  })

  return {
    noteId,
    nextReviewAt,
    interval,
    easeFactor,
    reviewCount: note.reviewCount + 1,
  }
}

/**
 * Get notes due for review
 */
export async function getReviewQueue(
  limit: number = 20
): Promise<
  Array<{
    id: string
    title: string | null
    excerpt: string | null
    type: string
    reviewCount: number
    lastReviewedAt: Date | null
    nextReviewAt: Date | null
    daysOverdue: number
  }>
> {
  const now = new Date()

  // Get notes that are due for review (nextReviewAt <= now)
  // Or notes that have never been reviewed
  const notes = await prisma.note.findMany({
    where: {
      processStatus: { in: ['COMPLETED', 'INDEXED'] },
      OR: [
        { nextReviewAt: { lte: now } },
        { nextReviewAt: null, reviewCount: 0 },
      ],
    },
    select: {
      id: true,
      title: true,
      excerpt: true,
      type: true,
      reviewCount: true,
      lastReviewedAt: true,
      nextReviewAt: true,
    },
    orderBy: [
      { nextReviewAt: 'asc' }, // Most overdue first
      { createdAt: 'asc' }, // Then oldest unreviewed
    ],
    take: limit,
  })

  return notes.map((note) => {
    let daysOverdue = 0
    if (note.nextReviewAt) {
      daysOverdue = Math.max(
        0,
        Math.floor((now.getTime() - note.nextReviewAt.getTime()) / (1000 * 60 * 60 * 24))
      )
    }

    return {
      ...note,
      daysOverdue,
    }
  })
}

/**
 * Get review statistics
 */
export async function getReviewStats(): Promise<{
  totalNotes: number
  reviewedToday: number
  dueToday: number
  dueThisWeek: number
  overdue: number
  neverReviewed: number
  averageEaseFactor: number
}> {
  const now = new Date()
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(now)
  endOfDay.setHours(23, 59, 59, 999)
  const endOfWeek = new Date(now)
  endOfWeek.setDate(endOfWeek.getDate() + 7)

  const [
    totalNotes,
    reviewedToday,
    dueToday,
    dueThisWeek,
    overdue,
    neverReviewed,
    avgEase,
  ] = await Promise.all([
    // Total processed notes
    prisma.note.count({
      where: { processStatus: { in: ['COMPLETED', 'INDEXED'] } },
    }),
    // Reviewed today
    prisma.note.count({
      where: {
        lastReviewedAt: { gte: startOfDay, lte: endOfDay },
      },
    }),
    // Due today
    prisma.note.count({
      where: {
        nextReviewAt: { gte: startOfDay, lte: endOfDay },
      },
    }),
    // Due this week
    prisma.note.count({
      where: {
        nextReviewAt: { gte: now, lte: endOfWeek },
      },
    }),
    // Overdue
    prisma.note.count({
      where: {
        nextReviewAt: { lt: now },
        reviewCount: { gt: 0 },
      },
    }),
    // Never reviewed
    prisma.note.count({
      where: {
        reviewCount: 0,
        processStatus: { in: ['COMPLETED', 'INDEXED'] },
      },
    }),
    // Average ease factor
    prisma.note.aggregate({
      where: { reviewCount: { gt: 0 } },
      _avg: { easeFactor: true },
    }),
  ])

  return {
    totalNotes,
    reviewedToday,
    dueToday,
    dueThisWeek,
    overdue,
    neverReviewed,
    averageEaseFactor: avgEase._avg.easeFactor || 2.5,
  }
}

/**
 * Generate a simple quiz question from a note
 */
export async function generateQuizQuestion(noteId: string): Promise<{
  question: string
  hint: string
  noteId: string
  noteTitle: string | null
}> {
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    select: {
      id: true,
      title: true,
      excerpt: true,
      keyInsights: true,
      topics: true,
      summary: true,
    },
  })

  if (!note) {
    throw new Error(`Note ${noteId} not found`)
  }

  // Generate a question based on available content
  let question = ''
  let hint = ''

  if (note.keyInsights && note.keyInsights.length > 0) {
    // Use a random key insight as the "answer" and ask about it
    const insight = note.keyInsights[Math.floor(Math.random() * note.keyInsights.length)]
    question = `What is a key insight from "${note.title || 'this note'}"?`
    hint = insight.substring(0, 50) + '...'
  } else if (note.topics && note.topics.length > 0) {
    question = `What topics are covered in "${note.title || 'this note'}"?`
    hint = note.topics.slice(0, 3).join(', ')
  } else if (note.summary) {
    question = `Summarize the main point of "${note.title || 'this note'}"`
    hint = note.summary.substring(0, 100) + '...'
  } else {
    question = `What do you remember about "${note.title || 'this note'}"?`
    hint = note.excerpt || 'Review the full note for details'
  }

  return {
    question,
    hint,
    noteId: note.id,
    noteTitle: note.title,
  }
}

/**
 * Skip a note (schedule for later without affecting ease factor)
 */
export async function skipReview(noteId: string, daysToSkip: number = 1): Promise<void> {
  const nextReviewAt = new Date()
  nextReviewAt.setDate(nextReviewAt.getDate() + daysToSkip)

  await prisma.note.update({
    where: { id: noteId },
    data: { nextReviewAt },
  })
}

/**
 * Reset review progress for a note
 */
export async function resetReviewProgress(noteId: string): Promise<void> {
  await prisma.note.update({
    where: { id: noteId },
    data: {
      lastReviewedAt: null,
      nextReviewAt: null,
      reviewCount: 0,
      easeFactor: 2.5,
      interval: 0,
    },
  })
}
