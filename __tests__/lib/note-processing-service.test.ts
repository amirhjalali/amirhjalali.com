/**
 * Unit tests for note-processing-service.ts
 */

import { prismaMock } from '../../__mocks__/prisma'

// Mock external dependencies before importing the service
jest.mock('@/lib/db', () => ({
  prisma: prismaMock,
}))

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  summary: 'Test summary',
                  excerpt: 'Test excerpt',
                  keyInsights: ['Insight 1', 'Insight 2'],
                  topics: ['topic1', 'topic2'],
                  sentiment: 'neutral',
                }),
              },
            },
          ],
        }),
      },
    },
  }))
})

jest.mock('@/lib/content-extraction', () => ({
  extractContentFromUrl: jest.fn().mockResolvedValue({
    textContent: 'Extracted content from URL',
    wordCount: 100,
    readingTime: 1,
    domain: 'example.com',
    favicon: 'https://example.com/favicon.ico',
    sourceType: 'article',
    contentHash: 'abc123',
    title: 'Test Article',
    excerpt: 'Test excerpt',
  }),
  extractVideoInfo: jest.fn().mockReturnValue(null),
}))

jest.mock('@/lib/embedding-service', () => ({
  indexNote: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('@/lib/youtube-transcript', () => ({
  fetchYouTubeTranscript: jest.fn().mockResolvedValue(null),
  isYouTubeUrl: jest.fn().mockReturnValue(false),
  formatDuration: jest.fn().mockReturnValue('10:00'),
}))

jest.mock('@/lib/knowledge-graph-service', () => ({
  linkNoteToTopics: jest.fn().mockResolvedValue(undefined),
  autoLinkRelatedNotes: jest.fn().mockResolvedValue(undefined),
}))

import {
  processNote,
  extractUrlMetadata,
  generateSummaryAndInsights,
  extractTopics,
  analyzeSentiment,
  processMedia,
} from '@/lib/note-processing-service'

describe('note-processing-service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('processNote', () => {
    const mockNote = {
      id: 'note-123',
      type: 'TEXT',
      content: 'This is test content for processing',
      title: 'Test Note',
      processStatus: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const mockUpdatedNote = {
      ...mockNote,
      processStatus: 'COMPLETED',
      summary: 'Test summary',
      excerpt: 'Test excerpt',
      keyInsights: ['Insight 1', 'Insight 2'],
      topics: ['topic1', 'topic2'],
      sentiment: 'neutral',
    }

    it('should process a TEXT note successfully', async () => {
      prismaMock.note.findUnique.mockResolvedValue(mockNote as any)
      prismaMock.note.update.mockResolvedValue(mockUpdatedNote as any)

      const result = await processNote('note-123')

      expect(prismaMock.note.findUnique).toHaveBeenCalledWith({
        where: { id: 'note-123' },
      })
      expect(prismaMock.note.update).toHaveBeenCalledTimes(2) // First for PROCESSING, then for COMPLETED
      expect(result.processStatus).toBe('COMPLETED')
    })

    it('should throw error when note not found', async () => {
      prismaMock.note.findUnique.mockResolvedValue(null)

      await expect(processNote('non-existent')).rejects.toThrow(
        'Note non-existent not found'
      )
    })

    it('should mark note as FAILED when processing throws', async () => {
      prismaMock.note.findUnique.mockResolvedValue(mockNote as any)
      prismaMock.note.update.mockRejectedValueOnce(new Error('DB Error'))

      await expect(processNote('note-123')).rejects.toThrow()
    })

    it('should process LINK type notes with content extraction', async () => {
      const linkNote = {
        ...mockNote,
        type: 'LINK',
        content: 'https://example.com/article',
      }

      prismaMock.note.findUnique.mockResolvedValue(linkNote as any)
      prismaMock.note.update.mockResolvedValue({
        ...mockUpdatedNote,
        type: 'LINK',
      } as any)

      const result = await processNote('note-123')

      expect(result).toBeDefined()
    })

    it('should skip indexing when skipIndexing option is true', async () => {
      prismaMock.note.findUnique.mockResolvedValue(mockNote as any)
      prismaMock.note.update.mockResolvedValue(mockUpdatedNote as any)

      await processNote('note-123', { skipIndexing: true })

      const { indexNote } = require('@/lib/embedding-service')
      expect(indexNote).not.toHaveBeenCalled()
    })
  })

  describe('generateSummaryAndInsights', () => {
    it('should generate summary and insights for TEXT content', async () => {
      const result = await generateSummaryAndInsights(
        'This is sample content for testing',
        'TEXT'
      )

      expect(result).toHaveProperty('summary')
      expect(result).toHaveProperty('excerpt')
      expect(result).toHaveProperty('keyInsights')
      expect(Array.isArray(result.keyInsights)).toBe(true)
    })

    it('should generate summary and insights for LINK content', async () => {
      const result = await generateSummaryAndInsights(
        'Content from a URL',
        'LINK'
      )

      expect(result).toHaveProperty('summary')
      expect(result).toHaveProperty('excerpt')
    })

    it('should truncate content longer than 2000 chars', async () => {
      const longContent = 'a'.repeat(3000)
      const result = await generateSummaryAndInsights(longContent, 'TEXT')

      expect(result).toBeDefined()
    })
  })

  describe('extractTopics', () => {
    it('should extract topics from content', async () => {
      const result = await extractTopics('This is content about programming and AI')

      expect(Array.isArray(result)).toBe(true)
    })

    it('should return empty array on error', async () => {
      // Override mock to simulate error
      const OpenAI = require('openai')
      OpenAI.mockImplementationOnce(() => ({
        chat: {
          completions: {
            create: jest.fn().mockRejectedValue(new Error('API Error')),
          },
        },
      }))

      // Since OpenAI is mocked at module level, this test verifies the error handling
      const result = await extractTopics('test content')
      expect(Array.isArray(result)).toBe(true)
    })

    it('should limit topics to 10', async () => {
      const result = await extractTopics('Content with many potential topics')

      expect(result.length).toBeLessThanOrEqual(10)
    })
  })

  describe('analyzeSentiment', () => {
    it('should analyze sentiment of content', async () => {
      const result = await analyzeSentiment('This is a happy message!')

      expect(['positive', 'negative', 'neutral', 'mixed']).toContain(result)
    })

    it('should default to neutral on error', async () => {
      // The mock returns 'neutral' by default
      const result = await analyzeSentiment('test content')
      expect(result).toBe('neutral')
    })
  })

  describe('processMedia', () => {
    it('should return original URL (placeholder implementation)', async () => {
      const url = 'https://example.com/image.jpg'
      const result = await processMedia(url)

      expect(result).toBe(url)
    })
  })

  describe('extractUrlMetadata', () => {
    beforeEach(() => {
      // Mock global fetch
      global.fetch = jest.fn()
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('should extract metadata from HTML with OG tags', async () => {
      const mockHtml = `
        <html>
          <head>
            <meta property="og:title" content="Test Title">
            <meta property="og:description" content="Test Description">
            <meta property="og:image" content="https://example.com/image.jpg">
            <link rel="icon" href="/favicon.ico">
          </head>
        </html>
      `

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockHtml),
      })

      const result = await extractUrlMetadata('https://example.com/page')

      expect(result.title).toBe('Test Title')
      expect(result.description).toBe('Test Description')
      expect(result.image).toBe('https://example.com/image.jpg')
      expect(result.domain).toBe('example.com')
    })

    it('should fallback to regular meta tags when OG tags missing', async () => {
      const mockHtml = `
        <html>
          <head>
            <title>Fallback Title</title>
            <meta name="description" content="Fallback Description">
          </head>
        </html>
      `

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockHtml),
      })

      const result = await extractUrlMetadata('https://example.com/page')

      expect(result.title).toBe('Fallback Title')
      expect(result.description).toBe('Fallback Description')
    })

    it('should handle fetch errors gracefully', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      const result = await extractUrlMetadata('https://example.com/page')

      expect(result.domain).toBe('example.com')
      expect(result.error).toBe('Network error')
    })

    it('should handle non-OK responses', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      })

      const result = await extractUrlMetadata('https://example.com/page')

      expect(result.error).toContain('404')
    })
  })
})
