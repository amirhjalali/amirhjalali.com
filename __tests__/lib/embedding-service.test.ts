/**
 * Unit tests for embedding-service.ts
 */

import { prismaMock } from '../../__mocks__/prisma'

// Mock external dependencies
jest.mock('@/lib/db', () => ({
  prisma: prismaMock,
}))

jest.mock('openai', () => {
  const mockEmbedding = new Array(1536).fill(0.1)
  return jest.fn().mockImplementation(() => ({
    embeddings: {
      create: jest.fn().mockImplementation((args: any) => {
        // Handle both single and batch requests
        const inputCount = Array.isArray(args.input) ? args.input.length : 1
        const data = Array(inputCount).fill(null).map(() => ({ embedding: mockEmbedding }))
        return Promise.resolve({
          data,
          usage: { total_tokens: 100 * inputCount },
        })
      }),
    },
  }))
})

jest.mock('@/lib/content-extraction', () => ({
  chunkContent: jest.fn().mockReturnValue([
    { content: 'Chunk 1 content', startOffset: 0, endOffset: 100 },
    { content: 'Chunk 2 content', startOffset: 80, endOffset: 180 },
  ]),
  cleanText: jest.fn((text) => text.trim()),
}))

import {
  generateEmbedding,
  generateEmbeddings,
  indexNote,
  semanticSearch,
  getRelevantContext,
} from '@/lib/embedding-service'

describe('embedding-service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('generateEmbedding', () => {
    it('should generate embedding for text', async () => {
      const result = await generateEmbedding('Test text for embedding')

      expect(result).toHaveProperty('embedding')
      expect(result).toHaveProperty('tokenCount')
      expect(Array.isArray(result.embedding)).toBe(true)
      expect(result.embedding.length).toBe(1536)
    })

    it('should handle empty text', async () => {
      const result = await generateEmbedding('')

      expect(result.embedding).toBeDefined()
    })
  })

  describe('generateEmbeddings', () => {
    it('should generate embeddings for multiple texts', async () => {
      const texts = ['Text 1', 'Text 2', 'Text 3']
      const result = await generateEmbeddings(texts)

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('indexNote', () => {
    const mockNote = {
      id: 'note-123',
      content: 'Short content',
      fullContent: 'This is a longer piece of content that should be chunked and indexed for semantic search.',
      type: 'TEXT',
    }

    it('should index a note with sufficient content', async () => {
      prismaMock.note.findUnique.mockResolvedValue(mockNote as any)
      prismaMock.noteChunk.deleteMany.mockResolvedValue({ count: 0 })
      prismaMock.$transaction.mockResolvedValue([])
      prismaMock.note.update.mockResolvedValue({ ...mockNote, processStatus: 'INDEXED' } as any)

      const result = await indexNote('note-123')

      expect(result).toHaveProperty('chunkCount')
      expect(prismaMock.noteChunk.deleteMany).toHaveBeenCalledWith({
        where: { noteId: 'note-123' },
      })
    })

    it('should throw error when note not found', async () => {
      prismaMock.note.findUnique.mockResolvedValue(null)

      await expect(indexNote('non-existent')).rejects.toThrow('Note non-existent not found')
    })

    it('should return 0 chunks for short content', async () => {
      const shortNote = {
        ...mockNote,
        fullContent: 'Too short',
        content: 'Too short',
      }
      prismaMock.note.findUnique.mockResolvedValue(shortNote as any)

      const result = await indexNote('note-123')

      expect(result.chunkCount).toBe(0)
    })
  })

  describe('semanticSearch', () => {
    const mockChunks = [
      {
        id: 'chunk-1',
        noteId: 'note-1',
        content: 'Content about programming',
        embedding: new Array(1536).fill(0.1),
        note: { id: 'note-1', title: 'Programming Guide', type: 'TEXT' },
      },
      {
        id: 'chunk-2',
        noteId: 'note-2',
        content: 'Content about AI',
        embedding: new Array(1536).fill(0.2),
        note: { id: 'note-2', title: 'AI Overview', type: 'LINK' },
      },
    ]

    it('should perform semantic search and return results', async () => {
      prismaMock.noteChunk.findMany.mockResolvedValue(mockChunks as any)

      const results = await semanticSearch('programming tutorial')

      expect(Array.isArray(results)).toBe(true)
      results.forEach((result) => {
        expect(result).toHaveProperty('noteId')
        expect(result).toHaveProperty('chunkId')
        expect(result).toHaveProperty('content')
        expect(result).toHaveProperty('score')
      })
    })

    it('should filter results by threshold', async () => {
      prismaMock.noteChunk.findMany.mockResolvedValue(mockChunks as any)

      const results = await semanticSearch('test query', { threshold: 0.9 })

      // High threshold should filter out most results
      expect(results.length).toBeLessThanOrEqual(mockChunks.length)
    })

    it('should limit results', async () => {
      prismaMock.noteChunk.findMany.mockResolvedValue(mockChunks as any)

      const results = await semanticSearch('test query', { limit: 1 })

      expect(results.length).toBeLessThanOrEqual(1)
    })

    it('should filter by notebookId when provided', async () => {
      prismaMock.noteChunk.findMany.mockResolvedValue(mockChunks as any)

      await semanticSearch('test', { notebookId: 'notebook-1' })

      expect(prismaMock.noteChunk.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { note: { notebookId: 'notebook-1' } },
        })
      )
    })
  })

  describe('getRelevantContext', () => {
    const mockChunks = [
      {
        id: 'chunk-1',
        noteId: 'note-1',
        content: 'Relevant content for context',
        embedding: new Array(1536).fill(0.1),
        note: { id: 'note-1', title: 'Source Document', type: 'TEXT' },
      },
    ]

    it('should return context and sources', async () => {
      prismaMock.noteChunk.findMany.mockResolvedValue(mockChunks as any)

      const result = await getRelevantContext('query about content')

      expect(result).toHaveProperty('context')
      expect(result).toHaveProperty('sources')
      expect(Array.isArray(result.sources)).toBe(true)
    })

    it('should respect maxTokens limit', async () => {
      const longChunks = Array(10)
        .fill(null)
        .map((_, i) => ({
          id: `chunk-${i}`,
          noteId: `note-${i}`,
          content: 'A'.repeat(1000), // Long content
          embedding: new Array(1536).fill(0.1),
          note: { id: `note-${i}`, title: `Doc ${i}`, type: 'TEXT' },
        }))

      prismaMock.noteChunk.findMany.mockResolvedValue(longChunks as any)

      const result = await getRelevantContext('query', { maxTokens: 500 })

      // Context should be limited
      expect(result.context.length).toBeLessThan(longChunks.length * 1000)
    })

    it('should deduplicate sources', async () => {
      const chunksFromSameNote = [
        {
          id: 'chunk-1',
          noteId: 'note-1',
          content: 'Content 1',
          embedding: new Array(1536).fill(0.1),
          note: { id: 'note-1', title: 'Doc', type: 'TEXT' },
        },
        {
          id: 'chunk-2',
          noteId: 'note-1', // Same note
          content: 'Content 2',
          embedding: new Array(1536).fill(0.1),
          note: { id: 'note-1', title: 'Doc', type: 'TEXT' },
        },
      ]

      prismaMock.noteChunk.findMany.mockResolvedValue(chunksFromSameNote as any)

      const result = await getRelevantContext('query')

      // Should have only one source despite multiple chunks
      const uniqueNoteIds = new Set(result.sources.map((s) => s.noteId))
      expect(uniqueNoteIds.size).toBe(result.sources.length)
    })
  })
})
