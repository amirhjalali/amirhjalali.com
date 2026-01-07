/**
 * Unit tests for spaced-repetition-service.ts
 * Tests SM-2 algorithm implementation for spaced repetition
 */

import { prismaMock } from '../../__mocks__/prisma'

// Mock external dependencies
jest.mock('@/lib/db', () => ({
  prisma: prismaMock,
}))

import {
  recordReview,
  getReviewQueue,
  getReviewStats,
  generateQuizQuestion,
  skipReview,
  resetReviewProgress,
} from '@/lib/spaced-repetition-service'

describe('spaced-repetition-service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset Date mock if any
    jest.useRealTimers()
  })

  describe('recordReview', () => {
    const mockNote = {
      id: 'note-123',
      interval: 1,
      easeFactor: 2.5,
      reviewCount: 0,
    }

    it('should record first review with quality 5 (perfect)', async () => {
      prismaMock.note.findUnique.mockResolvedValue(mockNote as any)
      prismaMock.note.update.mockResolvedValue({} as any)

      const result = await recordReview('note-123', 5)

      expect(result.noteId).toBe('note-123')
      expect(result.reviewCount).toBe(1)
      expect(result.interval).toBe(1) // First review always 1 day
      expect(result.easeFactor).toBeGreaterThan(2.5) // EF increases with quality 5
      expect(result.nextReviewAt).toBeInstanceOf(Date)
    })

    it('should reset interval on quality < 3 (failed recall)', async () => {
      const reviewedNote = {
        ...mockNote,
        interval: 10,
        reviewCount: 5,
      }

      prismaMock.note.findUnique.mockResolvedValue(reviewedNote as any)
      prismaMock.note.update.mockResolvedValue({} as any)

      const result = await recordReview('note-123', 2)

      expect(result.interval).toBe(1) // Reset to 1 day
    })

    it('should set interval to 6 days on second successful review', async () => {
      const firstReviewDone = {
        ...mockNote,
        interval: 1,
        reviewCount: 1,
      }

      prismaMock.note.findUnique.mockResolvedValue(firstReviewDone as any)
      prismaMock.note.update.mockResolvedValue({} as any)

      const result = await recordReview('note-123', 4)

      expect(result.interval).toBe(6)
    })

    it('should multiply interval by ease factor after second review', async () => {
      const twiceReviewed = {
        ...mockNote,
        interval: 6,
        reviewCount: 2,
        easeFactor: 2.5,
      }

      prismaMock.note.findUnique.mockResolvedValue(twiceReviewed as any)
      prismaMock.note.update.mockResolvedValue({} as any)

      const result = await recordReview('note-123', 4)

      // New interval should be approximately 6 * 2.5 = 15 (rounded)
      expect(result.interval).toBeGreaterThan(6)
    })

    it('should decrease ease factor on difficult recall (quality 3)', async () => {
      prismaMock.note.findUnique.mockResolvedValue(mockNote as any)
      prismaMock.note.update.mockResolvedValue({} as any)

      const result = await recordReview('note-123', 3)

      expect(result.easeFactor).toBeLessThan(2.5)
    })

    it('should not let ease factor go below 1.3', async () => {
      const lowEaseFactor = {
        ...mockNote,
        easeFactor: 1.4,
      }

      prismaMock.note.findUnique.mockResolvedValue(lowEaseFactor as any)
      prismaMock.note.update.mockResolvedValue({} as any)

      const result = await recordReview('note-123', 0) // Worst quality

      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3)
    })

    it('should throw error when note not found', async () => {
      prismaMock.note.findUnique.mockResolvedValue(null)

      await expect(recordReview('non-existent', 5)).rejects.toThrow(
        'Note non-existent not found'
      )
    })

    it('should clamp quality to valid range', async () => {
      prismaMock.note.findUnique.mockResolvedValue(mockNote as any)
      prismaMock.note.update.mockResolvedValue({} as any)

      // Quality above 5 should be clamped to 5
      const result1 = await recordReview('note-123', 10)
      expect(result1.easeFactor).toBeGreaterThan(2.5) // Same as quality 5

      // Quality below 0 should be clamped to 0
      prismaMock.note.findUnique.mockResolvedValue(mockNote as any)
      const result2 = await recordReview('note-123', -5)
      expect(result2.interval).toBe(1) // Failed recall behavior
    })

    it('should update note with correct data', async () => {
      prismaMock.note.findUnique.mockResolvedValue(mockNote as any)
      prismaMock.note.update.mockResolvedValue({} as any)

      await recordReview('note-123', 4)

      expect(prismaMock.note.update).toHaveBeenCalledWith({
        where: { id: 'note-123' },
        data: expect.objectContaining({
          lastReviewedAt: expect.any(Date),
          nextReviewAt: expect.any(Date),
          interval: expect.any(Number),
          easeFactor: expect.any(Number),
          reviewCount: 1,
        }),
      })
    })
  })

  describe('getReviewQueue', () => {
    it('should return notes due for review', async () => {
      const dueNotes = [
        {
          id: 'note-1',
          title: 'Note 1',
          excerpt: 'Excerpt 1',
          type: 'TEXT',
          reviewCount: 2,
          lastReviewedAt: new Date('2024-01-01'),
          nextReviewAt: new Date('2024-01-05'),
        },
      ]

      prismaMock.note.findMany.mockResolvedValue(dueNotes as any)

      const result = await getReviewQueue()

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('note-1')
      expect(result[0]).toHaveProperty('daysOverdue')
    })

    it('should calculate days overdue correctly', async () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 5) // 5 days ago

      const overdueNotes = [
        {
          id: 'note-1',
          title: 'Overdue Note',
          excerpt: 'Excerpt',
          type: 'TEXT',
          reviewCount: 1,
          lastReviewedAt: new Date('2024-01-01'),
          nextReviewAt: pastDate,
        },
      ]

      prismaMock.note.findMany.mockResolvedValue(overdueNotes as any)

      const result = await getReviewQueue()

      expect(result[0].daysOverdue).toBe(5)
    })

    it('should return 0 days overdue for notes with null nextReviewAt', async () => {
      const neverReviewed = [
        {
          id: 'note-1',
          title: 'Never Reviewed',
          excerpt: 'Excerpt',
          type: 'TEXT',
          reviewCount: 0,
          lastReviewedAt: null,
          nextReviewAt: null,
        },
      ]

      prismaMock.note.findMany.mockResolvedValue(neverReviewed as any)

      const result = await getReviewQueue()

      expect(result[0].daysOverdue).toBe(0)
    })

    it('should respect the limit parameter', async () => {
      prismaMock.note.findMany.mockResolvedValue([])

      await getReviewQueue(5)

      expect(prismaMock.note.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
        })
      )
    })

    it('should use default limit of 20', async () => {
      prismaMock.note.findMany.mockResolvedValue([])

      await getReviewQueue()

      expect(prismaMock.note.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 20,
        })
      )
    })

    it('should query for completed or indexed notes only', async () => {
      prismaMock.note.findMany.mockResolvedValue([])

      await getReviewQueue()

      expect(prismaMock.note.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            processStatus: { in: ['COMPLETED', 'INDEXED'] },
          }),
        })
      )
    })
  })

  describe('getReviewStats', () => {
    it('should return all review statistics', async () => {
      prismaMock.note.count
        .mockResolvedValueOnce(100) // totalNotes
        .mockResolvedValueOnce(5) // reviewedToday
        .mockResolvedValueOnce(10) // dueToday
        .mockResolvedValueOnce(25) // dueThisWeek
        .mockResolvedValueOnce(3) // overdue
        .mockResolvedValueOnce(20) // neverReviewed

      prismaMock.note.aggregate.mockResolvedValue({
        _avg: { easeFactor: 2.6 },
      } as any)

      const stats = await getReviewStats()

      expect(stats).toEqual({
        totalNotes: 100,
        reviewedToday: 5,
        dueToday: 10,
        dueThisWeek: 25,
        overdue: 3,
        neverReviewed: 20,
        averageEaseFactor: 2.6,
      })
    })

    it('should default to 2.5 ease factor when no reviews', async () => {
      prismaMock.note.count.mockResolvedValue(0)
      prismaMock.note.aggregate.mockResolvedValue({
        _avg: { easeFactor: null },
      } as any)

      const stats = await getReviewStats()

      expect(stats.averageEaseFactor).toBe(2.5)
    })
  })

  describe('generateQuizQuestion', () => {
    it('should generate question from key insights', async () => {
      const noteWithInsights = {
        id: 'note-1',
        title: 'JavaScript Basics',
        excerpt: 'Learn JS',
        keyInsights: ['Variables store data', 'Functions are reusable code blocks'],
        topics: ['javascript', 'programming'],
        summary: 'A guide to JavaScript fundamentals',
      }

      prismaMock.note.findUnique.mockResolvedValue(noteWithInsights as any)

      const result = await generateQuizQuestion('note-1')

      expect(result.question).toContain('key insight')
      expect(result.noteId).toBe('note-1')
      expect(result.noteTitle).toBe('JavaScript Basics')
      expect(result.hint.length).toBeGreaterThan(0)
    })

    it('should generate question from topics when no insights', async () => {
      const noteWithTopics = {
        id: 'note-1',
        title: 'React Guide',
        excerpt: 'Learn React',
        keyInsights: [],
        topics: ['react', 'frontend', 'javascript'],
        summary: null,
      }

      prismaMock.note.findUnique.mockResolvedValue(noteWithTopics as any)

      const result = await generateQuizQuestion('note-1')

      expect(result.question).toContain('topics')
      expect(result.hint).toContain('react')
    })

    it('should generate question from summary when no insights or topics', async () => {
      const noteWithSummary = {
        id: 'note-1',
        title: 'Summary Note',
        excerpt: 'Excerpt',
        keyInsights: [],
        topics: [],
        summary: 'This is a detailed summary of the note content',
      }

      prismaMock.note.findUnique.mockResolvedValue(noteWithSummary as any)

      const result = await generateQuizQuestion('note-1')

      expect(result.question).toContain('Summarize')
    })

    it('should generate generic question as fallback', async () => {
      const minimalNote = {
        id: 'note-1',
        title: 'Minimal Note',
        excerpt: 'Just an excerpt',
        keyInsights: [],
        topics: [],
        summary: null,
      }

      prismaMock.note.findUnique.mockResolvedValue(minimalNote as any)

      const result = await generateQuizQuestion('note-1')

      expect(result.question).toContain('remember')
      expect(result.hint).toBe('Just an excerpt')
    })

    it('should handle untitled notes', async () => {
      const untitledNote = {
        id: 'note-1',
        title: null,
        excerpt: 'Content',
        keyInsights: ['An insight'],
        topics: [],
        summary: null,
      }

      prismaMock.note.findUnique.mockResolvedValue(untitledNote as any)

      const result = await generateQuizQuestion('note-1')

      expect(result.question).toContain('this note')
      expect(result.noteTitle).toBeNull()
    })

    it('should throw error when note not found', async () => {
      prismaMock.note.findUnique.mockResolvedValue(null)

      await expect(generateQuizQuestion('non-existent')).rejects.toThrow(
        'Note non-existent not found'
      )
    })

    it('should handle null excerpt in fallback hint', async () => {
      const noteWithoutExcerpt = {
        id: 'note-1',
        title: null,
        excerpt: null,
        keyInsights: [],
        topics: [],
        summary: null,
      }

      prismaMock.note.findUnique.mockResolvedValue(noteWithoutExcerpt as any)

      const result = await generateQuizQuestion('note-1')

      expect(result.hint).toBe('Review the full note for details')
    })
  })

  describe('skipReview', () => {
    it('should schedule note for later review', async () => {
      prismaMock.note.update.mockResolvedValue({} as any)

      await skipReview('note-123', 3)

      expect(prismaMock.note.update).toHaveBeenCalledWith({
        where: { id: 'note-123' },
        data: {
          nextReviewAt: expect.any(Date),
        },
      })
    })

    it('should default to 1 day skip', async () => {
      prismaMock.note.update.mockResolvedValue({} as any)

      const beforeCall = new Date()
      await skipReview('note-123')

      const updateCall = prismaMock.note.update.mock.calls[0][0]
      const nextReviewDate = updateCall.data.nextReviewAt as Date
      const daysDiff = Math.round(
        (nextReviewDate.getTime() - beforeCall.getTime()) / (1000 * 60 * 60 * 24)
      )

      expect(daysDiff).toBe(1)
    })

    it('should set correct future date', async () => {
      prismaMock.note.update.mockResolvedValue({} as any)

      const now = new Date()
      await skipReview('note-123', 7)

      const updateCall = prismaMock.note.update.mock.calls[0][0]
      const nextReviewDate = updateCall.data.nextReviewAt as Date

      // Should be approximately 7 days in the future
      const daysDiff = Math.round(
        (nextReviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
      expect(daysDiff).toBe(7)
    })
  })

  describe('resetReviewProgress', () => {
    it('should reset all review fields to initial values', async () => {
      prismaMock.note.update.mockResolvedValue({} as any)

      await resetReviewProgress('note-123')

      expect(prismaMock.note.update).toHaveBeenCalledWith({
        where: { id: 'note-123' },
        data: {
          lastReviewedAt: null,
          nextReviewAt: null,
          reviewCount: 0,
          easeFactor: 2.5,
          interval: 0,
        },
      })
    })

    it('should throw error if note does not exist', async () => {
      prismaMock.note.update.mockRejectedValue(new Error('Record not found'))

      await expect(resetReviewProgress('non-existent')).rejects.toThrow()
    })
  })

  describe('SM-2 Algorithm Correctness', () => {
    // Test the algorithm behavior more rigorously
    it('should follow SM-2 progression for consistent quality 4', async () => {
      const reviews: { interval: number; easeFactor: number }[] = []

      // Simulate multiple reviews with quality 4
      let currentNote = {
        id: 'note-1',
        interval: 0,
        easeFactor: 2.5,
        reviewCount: 0,
      }

      for (let i = 0; i < 5; i++) {
        prismaMock.note.findUnique.mockResolvedValue(currentNote as any)
        prismaMock.note.update.mockImplementation(((args: any) => {
          currentNote = {
            ...currentNote,
            interval: args.data.interval,
            easeFactor: args.data.easeFactor,
            reviewCount: args.data.reviewCount,
          }
          return Promise.resolve(currentNote)
        }) as any)

        const result = await recordReview('note-1', 4)
        reviews.push({ interval: result.interval, easeFactor: result.easeFactor })
      }

      // First review: interval = 1
      expect(reviews[0].interval).toBe(1)
      // Second review: interval = 6
      expect(reviews[1].interval).toBe(6)
      // Third+ reviews: interval should grow
      expect(reviews[2].interval).toBeGreaterThan(reviews[1].interval)
      expect(reviews[3].interval).toBeGreaterThan(reviews[2].interval)
      expect(reviews[4].interval).toBeGreaterThan(reviews[3].interval)
    })

    it('should handle alternating good and bad reviews', async () => {
      let currentNote = {
        id: 'note-1',
        interval: 6,
        easeFactor: 2.5,
        reviewCount: 2,
      }

      // Good review
      prismaMock.note.findUnique.mockResolvedValue(currentNote as any)
      prismaMock.note.update.mockImplementation(((args: any) => {
        currentNote = {
          ...currentNote,
          interval: args.data.interval,
          easeFactor: args.data.easeFactor,
          reviewCount: args.data.reviewCount,
        }
        return Promise.resolve(currentNote)
      }) as any)

      const goodResult = await recordReview('note-1', 4)
      expect(goodResult.interval).toBeGreaterThan(6)

      // Bad review - should reset
      prismaMock.note.findUnique.mockResolvedValue(currentNote as any)
      const badResult = await recordReview('note-1', 1)
      expect(badResult.interval).toBe(1) // Reset to 1
    })
  })
})
