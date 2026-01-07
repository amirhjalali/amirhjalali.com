/**
 * Unit tests for knowledge-graph-service.ts
 */

import { prismaMock } from '../../__mocks__/prisma'

// Mock external dependencies
jest.mock('@/lib/db', () => ({
  prisma: prismaMock,
}))

import {
  getOrCreateTopic,
  linkNoteToTopics,
  findRelatedNotes,
  autoLinkRelatedNotes,
  updateTopicRelations,
  getKnowledgeGraphData,
  getNoteLinks,
  createNoteLink,
  deleteNoteLink,
} from '@/lib/knowledge-graph-service'

describe('knowledge-graph-service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getOrCreateTopic', () => {
    it('should return existing topic id when topic exists', async () => {
      const existingTopic = {
        id: 'topic-123',
        name: 'programming',
        displayName: 'Programming',
        noteCount: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      prismaMock.topic.findUnique.mockResolvedValue(existingTopic)

      const result = await getOrCreateTopic('Programming')

      expect(result).toBe('topic-123')
      expect(prismaMock.topic.create).not.toHaveBeenCalled()
    })

    it('should create new topic when it does not exist', async () => {
      const newTopic = {
        id: 'topic-new',
        name: 'ai',
        displayName: 'AI',
        noteCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      prismaMock.topic.findUnique.mockResolvedValue(null)
      prismaMock.topic.create.mockResolvedValue(newTopic)

      const result = await getOrCreateTopic('AI')

      expect(result).toBe('topic-new')
      expect(prismaMock.topic.create).toHaveBeenCalledWith({
        data: {
          name: 'ai',
          displayName: 'AI',
        },
      })
    })

    it('should normalize topic names', async () => {
      prismaMock.topic.findUnique.mockResolvedValue(null)
      prismaMock.topic.create.mockResolvedValue({
        id: 'topic-1',
        name: 'machine learning',
        displayName: 'Machine Learning',
        noteCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await getOrCreateTopic('  Machine  Learning  ')

      expect(prismaMock.topic.findUnique).toHaveBeenCalledWith({
        where: { name: 'machine learning' },
      })
    })

    it('should throw error for empty topic name', async () => {
      await expect(getOrCreateTopic('')).rejects.toThrow('Invalid topic name')
      await expect(getOrCreateTopic('   ')).rejects.toThrow('Invalid topic name')
    })

    it('should strip special characters from topic name', async () => {
      prismaMock.topic.findUnique.mockResolvedValue(null)
      prismaMock.topic.create.mockResolvedValue({
        id: 'topic-1',
        name: 'nodejs',
        displayName: 'Node.js',
        noteCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await getOrCreateTopic('Node.js')

      expect(prismaMock.topic.findUnique).toHaveBeenCalledWith({
        where: { name: 'nodejs' },
      })
    })
  })

  describe('linkNoteToTopics', () => {
    let mockTx: any

    beforeEach(() => {
      // Create mock transaction object
      mockTx = {
        topic: {
          findUnique: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockImplementation((args: any) =>
            Promise.resolve({
              id: `topic-${args.data.name}`,
              name: args.data.name,
              displayName: args.data.displayName,
              noteCount: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
          ),
          update: jest.fn().mockResolvedValue({} as any),
        },
        noteTopic: {
          upsert: jest.fn().mockResolvedValue({} as any),
          count: jest.fn().mockResolvedValue(1),
        },
      }

      // Mock $transaction to execute the callback with mockTx
      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        return callback(mockTx)
      })
    })

    it('should link topics to a note', async () => {
      await linkNoteToTopics('note-123', ['JavaScript', 'TypeScript'])

      expect(mockTx.noteTopic.upsert).toHaveBeenCalledTimes(2)
    })

    it('should do nothing when topics array is empty', async () => {
      await linkNoteToTopics('note-123', [])

      // $transaction should not be called for empty topics
      expect(prismaMock.$transaction).not.toHaveBeenCalled()
    })

    it('should do nothing when topics is undefined', async () => {
      await linkNoteToTopics('note-123', undefined as any)

      expect(prismaMock.$transaction).not.toHaveBeenCalled()
    })

    it('should set autoExtracted flag correctly', async () => {
      mockTx.topic.findUnique.mockResolvedValue({
        id: 'topic-existing',
        name: 'react',
        displayName: 'React',
        noteCount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await linkNoteToTopics('note-123', ['React'], false)

      expect(mockTx.noteTopic.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            autoExtracted: false,
          }),
        })
      )
    })

    it('should continue processing when one topic fails', async () => {
      // Transaction will re-throw errors, so if one topic fails, the whole transaction fails
      mockTx.topic.findUnique
        .mockResolvedValueOnce(null)
        .mockRejectedValueOnce(new Error('DB Error'))

      // With transactions, errors are re-thrown
      await expect(
        linkNoteToTopics('note-123', ['Topic1', 'Topic2'])
      ).rejects.toThrow('DB Error')
    })
  })

  describe('findRelatedNotes', () => {
    it('should return related notes with shared topics', async () => {
      const noteTopics = [
        {
          noteId: 'note-1',
          topicId: 'topic-1',
          topic: { id: 'topic-1', name: 'javascript', displayName: 'JavaScript' },
        },
        {
          noteId: 'note-1',
          topicId: 'topic-2',
          topic: { id: 'topic-2', name: 'react', displayName: 'React' },
        },
      ]

      const relatedNoteTopics = [
        {
          noteId: 'note-2',
          topicId: 'topic-1',
          relevance: 1.0,
          note: { id: 'note-2', title: 'Related Note' },
          topic: { name: 'javascript', displayName: 'JavaScript' },
        },
        {
          noteId: 'note-2',
          topicId: 'topic-2',
          relevance: 0.8,
          note: { id: 'note-2', title: 'Related Note' },
          topic: { name: 'react', displayName: 'React' },
        },
      ]

      prismaMock.noteTopic.findMany
        .mockResolvedValueOnce(noteTopics as any)
        .mockResolvedValueOnce(relatedNoteTopics as any)

      const results = await findRelatedNotes('note-1')

      expect(results).toHaveLength(1)
      expect(results[0].id).toBe('note-2')
      expect(results[0].sharedTopics).toContain('JavaScript')
      expect(results[0].sharedTopics).toContain('React')
      expect(results[0].score).toBe(1.8) // 1.0 + 0.8
    })

    it('should return empty array when note has no topics', async () => {
      prismaMock.noteTopic.findMany.mockResolvedValue([])

      const results = await findRelatedNotes('note-1')

      expect(results).toEqual([])
    })

    it('should respect the limit parameter', async () => {
      prismaMock.noteTopic.findMany
        .mockResolvedValueOnce([{ topicId: 'topic-1', topic: { id: 'topic-1' } }] as any)
        .mockResolvedValueOnce(
          Array(20)
            .fill(null)
            .map((_, i) => ({
              noteId: `note-${i + 2}`,
              topicId: 'topic-1',
              relevance: 1.0 - i * 0.01,
              note: { id: `note-${i + 2}`, title: `Note ${i + 2}` },
              topic: { name: 'topic', displayName: 'Topic' },
            })) as any
        )

      const results = await findRelatedNotes('note-1', 5)

      expect(results.length).toBeLessThanOrEqual(5)
    })

    it('should sort results by score descending', async () => {
      prismaMock.noteTopic.findMany
        .mockResolvedValueOnce([{ topicId: 'topic-1', topic: {} }] as any)
        .mockResolvedValueOnce([
          {
            noteId: 'note-2',
            topicId: 'topic-1',
            relevance: 0.5,
            note: { id: 'note-2', title: 'Low Score' },
            topic: { name: 't', displayName: 'T' },
          },
          {
            noteId: 'note-3',
            topicId: 'topic-1',
            relevance: 1.0,
            note: { id: 'note-3', title: 'High Score' },
            topic: { name: 't', displayName: 'T' },
          },
        ] as any)

      const results = await findRelatedNotes('note-1')

      expect(results[0].id).toBe('note-3')
      expect(results[1].id).toBe('note-2')
    })
  })

  describe('autoLinkRelatedNotes', () => {
    it('should create links for notes with enough shared topics', async () => {
      prismaMock.noteTopic.findMany
        .mockResolvedValueOnce([
          { topicId: 't1', topic: {} },
          { topicId: 't2', topic: {} },
        ] as any)
        .mockResolvedValueOnce([
          {
            noteId: 'note-2',
            topicId: 't1',
            relevance: 1.0,
            note: { id: 'note-2', title: 'Related' },
            topic: { name: 't1', displayName: 'Topic 1' },
          },
          {
            noteId: 'note-2',
            topicId: 't2',
            relevance: 1.0,
            note: { id: 'note-2', title: 'Related' },
            topic: { name: 't2', displayName: 'Topic 2' },
          },
        ] as any)

      prismaMock.noteLink.findUnique.mockResolvedValue(null)
      prismaMock.noteLink.create.mockResolvedValue({} as any)

      const linksCreated = await autoLinkRelatedNotes('note-1', 2)

      expect(linksCreated).toBe(1)
      expect(prismaMock.noteLink.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            fromNoteId: 'note-1',
            toNoteId: 'note-2',
            linkType: 'related',
            autoLinked: true,
          }),
        })
      )
    })

    it('should not create link when under minimum shared topics', async () => {
      prismaMock.noteTopic.findMany
        .mockResolvedValueOnce([{ topicId: 't1', topic: {} }] as any)
        .mockResolvedValueOnce([
          {
            noteId: 'note-2',
            topicId: 't1',
            relevance: 1.0,
            note: { id: 'note-2', title: 'Related' },
            topic: { name: 't1', displayName: 'Topic 1' },
          },
        ] as any)

      const linksCreated = await autoLinkRelatedNotes('note-1', 2)

      expect(linksCreated).toBe(0)
      expect(prismaMock.noteLink.create).not.toHaveBeenCalled()
    })

    it('should not create duplicate links', async () => {
      prismaMock.noteTopic.findMany
        .mockResolvedValueOnce([{ topicId: 't1', topic: {} }, { topicId: 't2', topic: {} }] as any)
        .mockResolvedValueOnce([
          {
            noteId: 'note-2',
            topicId: 't1',
            relevance: 1.0,
            note: { id: 'note-2', title: 'Related' },
            topic: { name: 't1', displayName: 'T1' },
          },
          {
            noteId: 'note-2',
            topicId: 't2',
            relevance: 1.0,
            note: { id: 'note-2', title: 'Related' },
            topic: { name: 't2', displayName: 'T2' },
          },
        ] as any)

      // Link already exists
      prismaMock.noteLink.findUnique.mockResolvedValue({ id: 'existing-link' } as any)

      const linksCreated = await autoLinkRelatedNotes('note-1', 2)

      expect(linksCreated).toBe(0)
      expect(prismaMock.noteLink.create).not.toHaveBeenCalled()
    })

    it('should check reverse direction before creating link', async () => {
      prismaMock.noteTopic.findMany
        .mockResolvedValueOnce([{ topicId: 't1', topic: {} }, { topicId: 't2', topic: {} }] as any)
        .mockResolvedValueOnce([
          {
            noteId: 'note-2',
            topicId: 't1',
            relevance: 1.0,
            note: { id: 'note-2', title: 'Related' },
            topic: { name: 't1', displayName: 'T1' },
          },
          {
            noteId: 'note-2',
            topicId: 't2',
            relevance: 1.0,
            note: { id: 'note-2', title: 'Related' },
            topic: { name: 't2', displayName: 'T2' },
          },
        ] as any)

      // Forward link doesn't exist, but reverse does
      prismaMock.noteLink.findUnique
        .mockResolvedValueOnce(null) // Forward check
        .mockResolvedValueOnce({ id: 'reverse-link' } as any) // Reverse check

      const linksCreated = await autoLinkRelatedNotes('note-1', 2)

      expect(linksCreated).toBe(0)
    })
  })

  describe('updateTopicRelations', () => {
    it('should create topic relations based on co-occurrence', async () => {
      const topics = [
        {
          id: 'topic-1',
          name: 'javascript',
          noteTopics: [{ noteId: 'note-1' }, { noteId: 'note-2' }],
        },
        {
          id: 'topic-2',
          name: 'typescript',
          noteTopics: [{ noteId: 'note-1' }], // Shares note-1 with topic-1
        },
      ]

      prismaMock.topic.findMany.mockResolvedValue(topics as any)
      prismaMock.topicRelation.upsert.mockResolvedValue({} as any)

      await updateTopicRelations()

      expect(prismaMock.topicRelation.upsert).toHaveBeenCalled()
    })

    it('should calculate correct strength based on shared notes', async () => {
      const topics = [
        {
          id: 'topic-a',
          name: 'a',
          noteTopics: [{ noteId: 'n1' }, { noteId: 'n2' }, { noteId: 'n3' }],
        },
        {
          id: 'topic-b',
          name: 'b',
          noteTopics: [{ noteId: 'n1' }, { noteId: 'n2' }], // 2 shared notes
        },
      ]

      prismaMock.topic.findMany.mockResolvedValue(topics as any)
      prismaMock.topicRelation.upsert.mockResolvedValue({} as any)

      await updateTopicRelations()

      // Should store relation with strength 2 (number of shared notes)
      expect(prismaMock.topicRelation.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            strength: 2,
          }),
        })
      )
    })
  })

  describe('getKnowledgeGraphData', () => {
    it('should return nodes and edges for visualization', async () => {
      const topics = [
        { id: 't1', name: 'js', displayName: 'JavaScript', noteCount: 5 },
      ]

      const notes = [
        {
          id: 'n1',
          title: 'Note 1',
          excerpt: 'Excerpt 1',
          noteTopics: [{ topicId: 't1', relevance: 1.0, topic: topics[0] }],
        },
      ]

      const topicRelations: any[] = []

      prismaMock.topic.findMany.mockResolvedValue(topics as any)
      prismaMock.note.findMany.mockResolvedValue(notes as any)
      prismaMock.topicRelation.findMany.mockResolvedValue(topicRelations)

      const result = await getKnowledgeGraphData()

      expect(result.nodes).toHaveLength(2) // 1 topic + 1 note
      expect(result.edges).toHaveLength(1) // 1 note-topic connection

      // Verify node structure
      const topicNode = result.nodes.find((n) => n.id === 'topic-t1')
      expect(topicNode).toBeDefined()
      expect(topicNode?.type).toBe('topic')
      expect(topicNode?.label).toBe('JavaScript')

      const noteNode = result.nodes.find((n) => n.id === 'note-n1')
      expect(noteNode).toBeDefined()
      expect(noteNode?.type).toBe('note')
    })

    it('should limit topic size based on note count', async () => {
      const topics = [
        { id: 't1', name: 'popular', displayName: 'Popular', noteCount: 100 },
      ]

      prismaMock.topic.findMany.mockResolvedValue(topics as any)
      prismaMock.note.findMany.mockResolvedValue([])
      prismaMock.topicRelation.findMany.mockResolvedValue([])

      const result = await getKnowledgeGraphData()

      const topicNode = result.nodes.find((n) => n.id === 'topic-t1')
      expect(topicNode?.size).toBeLessThanOrEqual(50) // Max size is capped at 50
    })

    it('should include topic-to-topic relations in edges', async () => {
      const topics = [
        { id: 't1', name: 'js', displayName: 'JS', noteCount: 2 },
        { id: 't2', name: 'ts', displayName: 'TS', noteCount: 2 },
      ]

      const topicRelations = [
        { fromTopicId: 't1', toTopicId: 't2', strength: 3 },
      ]

      prismaMock.topic.findMany.mockResolvedValue(topics as any)
      prismaMock.note.findMany.mockResolvedValue([])
      prismaMock.topicRelation.findMany.mockResolvedValue(topicRelations as any)

      const result = await getKnowledgeGraphData()

      const topicEdge = result.edges.find(
        (e) => e.source === 'topic-t1' && e.target === 'topic-t2'
      )
      expect(topicEdge).toBeDefined()
      expect(topicEdge?.weight).toBe(3)
    })

    it('should use excerpt as fallback label for untitled notes', async () => {
      prismaMock.topic.findMany.mockResolvedValue([])
      prismaMock.note.findMany.mockResolvedValue([
        {
          id: 'n1',
          title: null,
          excerpt: 'This is a longer excerpt that should be truncated',
          noteTopics: [],
        },
      ] as any)
      prismaMock.topicRelation.findMany.mockResolvedValue([])

      const result = await getKnowledgeGraphData()

      const noteNode = result.nodes.find((n) => n.id === 'note-n1')
      expect(noteNode?.label).toBe('This is a longer excerpt that ')
    })
  })

  describe('getNoteLinks', () => {
    it('should return links to and from a note', async () => {
      const note = {
        id: 'note-1',
        linkedTo: [
          {
            toNote: { id: 'note-2', title: 'Linked To' },
            linkType: 'related',
            description: 'Related content',
          },
        ],
        linkedFrom: [
          {
            fromNote: { id: 'note-3', title: 'Linked From' },
            linkType: 'reference',
            description: 'References this note',
          },
        ],
      }

      prismaMock.note.findUnique.mockResolvedValue(note as any)

      const result = await getNoteLinks('note-1')

      expect(result.linkedTo).toHaveLength(1)
      expect(result.linkedTo[0].id).toBe('note-2')
      expect(result.linkedTo[0].linkType).toBe('related')

      expect(result.linkedFrom).toHaveLength(1)
      expect(result.linkedFrom[0].id).toBe('note-3')
    })

    it('should return empty arrays when note not found', async () => {
      prismaMock.note.findUnique.mockResolvedValue(null)

      const result = await getNoteLinks('non-existent')

      expect(result.linkedTo).toEqual([])
      expect(result.linkedFrom).toEqual([])
    })

    it('should return empty arrays when note has no links', async () => {
      prismaMock.note.findUnique.mockResolvedValue({
        id: 'note-1',
        linkedTo: [],
        linkedFrom: [],
      } as any)

      const result = await getNoteLinks('note-1')

      expect(result.linkedTo).toEqual([])
      expect(result.linkedFrom).toEqual([])
    })
  })

  describe('createNoteLink', () => {
    it('should create a link between two notes', async () => {
      prismaMock.noteLink.create.mockResolvedValue({} as any)

      await createNoteLink('note-1', 'note-2', 'related', 'Test description')

      expect(prismaMock.noteLink.create).toHaveBeenCalledWith({
        data: {
          fromNoteId: 'note-1',
          toNoteId: 'note-2',
          linkType: 'related',
          description: 'Test description',
          autoLinked: false,
        },
      })
    })

    it('should use default link type when not provided', async () => {
      prismaMock.noteLink.create.mockResolvedValue({} as any)

      await createNoteLink('note-1', 'note-2')

      expect(prismaMock.noteLink.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          linkType: 'related',
        }),
      })
    })

    it('should set autoLinked to false for manual links', async () => {
      prismaMock.noteLink.create.mockResolvedValue({} as any)

      await createNoteLink('note-1', 'note-2')

      expect(prismaMock.noteLink.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          autoLinked: false,
        }),
      })
    })
  })

  describe('deleteNoteLink', () => {
    it('should delete a link between notes', async () => {
      prismaMock.noteLink.delete.mockResolvedValue({} as any)

      await deleteNoteLink('note-1', 'note-2')

      expect(prismaMock.noteLink.delete).toHaveBeenCalledWith({
        where: {
          fromNoteId_toNoteId: {
            fromNoteId: 'note-1',
            toNoteId: 'note-2',
          },
        },
      })
    })

    it('should throw error when link does not exist', async () => {
      prismaMock.noteLink.delete.mockRejectedValue(new Error('Record not found'))

      await expect(deleteNoteLink('note-1', 'note-2')).rejects.toThrow()
    })
  })
})
