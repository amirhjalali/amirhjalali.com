/**
 * Tests for Auto-Tagging Service
 */

import { prismaMock } from '../../__mocks__/prisma'

// Mock the database module BEFORE importing the service
jest.mock('@/lib/db', () => ({
  prisma: require('../../__mocks__/prisma').prismaMock,
}))

// Mock OpenAI
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify({ tags: ['machine learning', 'neural networks'] }),
              },
            },
          ],
        }),
      },
    },
  }))
})

// Import after mocks
import {
  getTagSuggestions,
  getUserTagPatterns,
  recordManualTagAddition,
  removeTagFromNote,
  applyTagSuggestions,
  buildTopicOntology,
} from '../../lib/auto-tagging-service'

describe('Auto-Tagging Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getTagSuggestions', () => {
    it('should return empty array for non-existent note', async () => {
      prismaMock.note.findUnique.mockResolvedValue(null)

      const suggestions = await getTagSuggestions('non-existent-id')

      expect(suggestions).toEqual([])
    })

    it('should return suggestions for a valid note', async () => {
      const mockNote = {
        id: 'note-1',
        content: 'This is about artificial intelligence and machine learning',
        fullContent: 'This is about artificial intelligence and machine learning techniques',
        noteTopics: [
          {
            topic: { id: 'topic-1', name: 'ai', displayName: 'AI' },
          },
        ],
      }

      prismaMock.note.findUnique.mockResolvedValue(mockNote as any)
      prismaMock.noteChunk.findMany.mockResolvedValue([])
      prismaMock.topic.findMany.mockResolvedValue([])
      prismaMock.topicRelation.findMany.mockResolvedValue([])

      const suggestions = await getTagSuggestions('note-1', 5)

      expect(prismaMock.note.findUnique).toHaveBeenCalledWith({
        where: { id: 'note-1' },
        include: {
          noteTopics: {
            include: { topic: true },
          },
        },
      })
      expect(Array.isArray(suggestions)).toBe(true)
    })

    it('should respect the limit parameter', async () => {
      const mockNote = {
        id: 'note-1',
        content: 'Test content',
        fullContent: 'Full test content about many topics',
        noteTopics: [],
      }

      prismaMock.note.findUnique.mockResolvedValue(mockNote as any)
      prismaMock.noteChunk.findMany.mockResolvedValue([])
      prismaMock.topic.findMany.mockResolvedValue([])
      prismaMock.topicRelation.findMany.mockResolvedValue([])

      const suggestions = await getTagSuggestions('note-1', 3)

      expect(suggestions.length).toBeLessThanOrEqual(3)
    })
  })

  describe('getUserTagPatterns', () => {
    it('should return empty array when no topics exist', async () => {
      prismaMock.topic.findMany.mockResolvedValue([])

      const patterns = await getUserTagPatterns()

      expect(patterns).toEqual([])
    })

    it('should calculate preference scores correctly', async () => {
      const mockTopics = [
        {
          id: 'topic-1',
          name: 'javascript',
          displayName: 'JavaScript',
          noteCount: 5,
          noteTopics: [
            { autoExtracted: false }, // manual
            { autoExtracted: false }, // manual
            { autoExtracted: true }, // auto
          ],
        },
        {
          id: 'topic-2',
          name: 'python',
          displayName: 'Python',
          noteCount: 3,
          noteTopics: [
            { autoExtracted: true }, // auto
            { autoExtracted: true }, // auto
          ],
        },
      ]

      prismaMock.topic.findMany.mockResolvedValue(mockTopics as any)

      const patterns = await getUserTagPatterns()

      // Only topics with manual additions should be returned
      expect(patterns.length).toBe(1)
      expect(patterns[0].topicName).toBe('JavaScript')
      expect(patterns[0].manualCount).toBe(2)
      expect(patterns[0].autoCount).toBe(1)
    })

    it('should sort by manual count first', async () => {
      const mockTopics = [
        {
          id: 'topic-1',
          name: 'react',
          displayName: 'React',
          noteCount: 2,
          noteTopics: [{ autoExtracted: false }],
        },
        {
          id: 'topic-2',
          name: 'vue',
          displayName: 'Vue',
          noteCount: 5,
          noteTopics: [
            { autoExtracted: false },
            { autoExtracted: false },
            { autoExtracted: false },
          ],
        },
      ]

      prismaMock.topic.findMany.mockResolvedValue(mockTopics as any)

      const patterns = await getUserTagPatterns()

      expect(patterns[0].topicName).toBe('Vue')
      expect(patterns[0].manualCount).toBe(3)
    })
  })

  describe('recordManualTagAddition', () => {
    it('should create new topic if not exists', async () => {
      prismaMock.topic.findUnique.mockResolvedValue(null)
      prismaMock.topic.create.mockResolvedValue({
        id: 'new-topic',
        name: 'new tag',
        displayName: 'New Tag',
      } as any)
      prismaMock.noteTopic.upsert.mockResolvedValue({} as any)
      prismaMock.noteTopic.count.mockResolvedValue(1)
      prismaMock.topic.update.mockResolvedValue({} as any)

      await recordManualTagAddition('note-1', 'New Tag')

      expect(prismaMock.topic.create).toHaveBeenCalledWith({
        data: {
          name: 'new tag',
          displayName: 'New Tag',
        },
      })
    })

    it('should use existing topic if exists', async () => {
      const existingTopic = {
        id: 'existing-topic',
        name: 'existing',
        displayName: 'Existing',
      }

      prismaMock.topic.findUnique.mockResolvedValue(existingTopic as any)
      prismaMock.noteTopic.upsert.mockResolvedValue({} as any)
      prismaMock.noteTopic.count.mockResolvedValue(2)
      prismaMock.topic.update.mockResolvedValue({} as any)

      await recordManualTagAddition('note-1', 'Existing')

      expect(prismaMock.topic.create).not.toHaveBeenCalled()
      expect(prismaMock.noteTopic.upsert).toHaveBeenCalledWith({
        where: {
          noteId_topicId: { noteId: 'note-1', topicId: 'existing-topic' },
        },
        create: {
          noteId: 'note-1',
          topicId: 'existing-topic',
          autoExtracted: false,
          relevance: 1.0,
        },
        update: {
          autoExtracted: false,
          relevance: 1.0,
        },
      })
    })

    it('should normalize tag names', async () => {
      prismaMock.topic.findUnique.mockResolvedValue(null)
      prismaMock.topic.create.mockResolvedValue({
        id: 'new-topic',
        name: 'javascript',
        displayName: 'JavaScript',
      } as any)
      prismaMock.noteTopic.upsert.mockResolvedValue({} as any)
      prismaMock.noteTopic.count.mockResolvedValue(1)
      prismaMock.topic.update.mockResolvedValue({} as any)

      await recordManualTagAddition('note-1', '  JavaScript  ')

      expect(prismaMock.topic.findUnique).toHaveBeenCalledWith({
        where: { name: 'javascript' },
      })
    })
  })

  describe('removeTagFromNote', () => {
    it('should do nothing if tag does not exist', async () => {
      prismaMock.topic.findUnique.mockResolvedValue(null)

      await removeTagFromNote('note-1', 'nonexistent')

      expect(prismaMock.noteTopic.deleteMany).not.toHaveBeenCalled()
    })

    it('should remove tag and update count', async () => {
      const existingTopic = {
        id: 'topic-1',
        name: 'javascript',
      }

      prismaMock.topic.findUnique.mockResolvedValue(existingTopic as any)
      prismaMock.noteTopic.deleteMany.mockResolvedValue({ count: 1 })
      prismaMock.noteTopic.count.mockResolvedValue(3)
      prismaMock.topic.update.mockResolvedValue({} as any)

      await removeTagFromNote('note-1', 'JavaScript')

      expect(prismaMock.noteTopic.deleteMany).toHaveBeenCalledWith({
        where: {
          noteId: 'note-1',
          topicId: 'topic-1',
        },
      })
      expect(prismaMock.topic.update).toHaveBeenCalledWith({
        where: { id: 'topic-1' },
        data: { noteCount: 3 },
      })
    })
  })

  describe('applyTagSuggestions', () => {
    it('should do nothing for empty tags array', async () => {
      await applyTagSuggestions('note-1', [])

      expect(prismaMock.$transaction).not.toHaveBeenCalled()
    })

    it('should apply tags within a transaction', async () => {
      const mockTx = {
        topic: {
          findUnique: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({ id: 'new-topic' }),
          update: jest.fn().mockResolvedValue({}),
        },
        noteTopic: {
          upsert: jest.fn().mockResolvedValue({}),
          count: jest.fn().mockResolvedValue(1),
        },
      }

      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        return callback(mockTx)
      })

      await applyTagSuggestions('note-1', ['ai', 'machine learning'], true)

      expect(prismaMock.$transaction).toHaveBeenCalled()
    })
  })

  describe('buildTopicOntology', () => {
    it('should return empty topics array when no topics exist', async () => {
      prismaMock.topic.findMany.mockResolvedValue([])

      const ontology = await buildTopicOntology()

      expect(ontology).toEqual({ topics: [] })
    })

    it('should build ontology with related topics', async () => {
      const mockTopics = [
        {
          id: 'topic-1',
          name: 'ai',
          displayName: 'AI',
          noteCount: 10,
          relatedFrom: [
            {
              toTopic: { id: 'topic-2', name: 'ml', displayName: 'Machine Learning' },
              strength: 5,
            },
          ],
          relatedTo: [],
        },
        {
          id: 'topic-2',
          name: 'ml',
          displayName: 'Machine Learning',
          noteCount: 8,
          relatedFrom: [],
          relatedTo: [
            {
              fromTopic: { id: 'topic-1', name: 'ai', displayName: 'AI' },
              strength: 5,
            },
          ],
        },
      ]

      prismaMock.topic.findMany.mockResolvedValue(mockTopics as any)

      const ontology = await buildTopicOntology()

      expect(ontology.topics.length).toBe(2)
      expect(ontology.topics[0].name).toBe('AI')
      expect(ontology.topics[0].noteCount).toBe(10)
      expect(ontology.topics[0].relatedTopics.length).toBe(1)
      expect(ontology.topics[0].relatedTopics[0].name).toBe('Machine Learning')
    })
  })
})
