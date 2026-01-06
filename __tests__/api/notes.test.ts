/**
 * API Route tests for /api/notes endpoints
 */

import { NextRequest } from 'next/server'
import { prismaMock } from '../../__mocks__/prisma'

// Mock dependencies before imports
jest.mock('@/lib/db', () => ({
  prisma: prismaMock,
}))

jest.mock('@/lib/auth', () => ({
  getSession: jest.fn(),
}))

jest.mock('@/lib/queue/note-queue', () => ({
  queueNoteProcessing: jest.fn(),
}))

jest.mock('@/lib/upload-utils', () => ({
  uploadToR2: jest.fn(),
}))

import { GET, POST } from '@/app/api/notes/route'
import { getSession } from '@/lib/auth'
import { queueNoteProcessing } from '@/lib/queue/note-queue'
import { uploadToR2 } from '@/lib/upload-utils'

// Helper to create mock NextRequest
function createMockRequest(url: string, options: RequestInit = {}): NextRequest {
  return new NextRequest(url, options)
}

describe('/api/notes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/notes', () => {
    it('should return 401 when not authenticated', async () => {
      ;(getSession as jest.Mock).mockResolvedValue(null)

      const request = createMockRequest('http://localhost:3000/api/notes')
      const response = await GET(request)

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('should return notes list when authenticated', async () => {
      ;(getSession as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } })

      const mockNotes = [
        {
          id: 'note-1',
          title: 'Test Note',
          excerpt: 'This is an excerpt',
          tags: ['test'],
          type: 'TEXT',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          processStatus: 'COMPLETED',
          imageUrl: null,
          topics: ['testing'],
        },
      ]

      prismaMock.note.count.mockResolvedValue(1)
      prismaMock.note.findMany.mockResolvedValue(mockNotes as any)

      const request = createMockRequest('http://localhost:3000/api/notes')
      const response = await GET(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.notes).toHaveLength(1)
      expect(data.total).toBe(1)
      expect(data.hasMore).toBe(false)
    })

    it('should filter by type parameter', async () => {
      ;(getSession as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } })
      prismaMock.note.count.mockResolvedValue(0)
      prismaMock.note.findMany.mockResolvedValue([])

      const request = createMockRequest('http://localhost:3000/api/notes?type=LINK')
      await GET(request)

      expect(prismaMock.note.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: 'LINK',
          }),
        })
      )
    })

    it('should filter by status parameter', async () => {
      ;(getSession as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } })
      prismaMock.note.count.mockResolvedValue(0)
      prismaMock.note.findMany.mockResolvedValue([])

      const request = createMockRequest('http://localhost:3000/api/notes?status=PENDING')
      await GET(request)

      expect(prismaMock.note.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            processStatus: 'PENDING',
          }),
        })
      )
    })

    it('should support search parameter', async () => {
      ;(getSession as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } })
      prismaMock.note.count.mockResolvedValue(0)
      prismaMock.note.findMany.mockResolvedValue([])

      const request = createMockRequest('http://localhost:3000/api/notes?search=javascript')
      await GET(request)

      expect(prismaMock.note.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ title: { contains: 'javascript', mode: 'insensitive' } }),
            ]),
          }),
        })
      )
    })

    it('should support pagination', async () => {
      ;(getSession as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } })
      prismaMock.note.count.mockResolvedValue(100)
      prismaMock.note.findMany.mockResolvedValue([])

      const request = createMockRequest('http://localhost:3000/api/notes?limit=10&offset=20')
      await GET(request)

      expect(prismaMock.note.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 20,
        })
      )
    })

    it('should support sorting', async () => {
      ;(getSession as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } })
      prismaMock.note.count.mockResolvedValue(0)
      prismaMock.note.findMany.mockResolvedValue([])

      const request = createMockRequest(
        'http://localhost:3000/api/notes?sortBy=updatedAt&order=asc'
      )
      await GET(request)

      expect(prismaMock.note.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { updatedAt: 'asc' },
        })
      )
    })

    it('should filter by tags', async () => {
      ;(getSession as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } })
      prismaMock.note.count.mockResolvedValue(0)
      prismaMock.note.findMany.mockResolvedValue([])

      const request = createMockRequest('http://localhost:3000/api/notes?tags=javascript,react')
      await GET(request)

      expect(prismaMock.note.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tags: { hasSome: ['javascript', 'react'] },
          }),
        })
      )
    })

    it('should return hasMore correctly', async () => {
      ;(getSession as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } })
      prismaMock.note.count.mockResolvedValue(100)
      prismaMock.note.findMany.mockResolvedValue(
        Array(50)
          .fill(null)
          .map((_, i) => ({
            id: `note-${i}`,
            title: `Note ${i}`,
            excerpt: 'Excerpt',
            tags: [],
            type: 'TEXT',
            createdAt: new Date(),
            updatedAt: new Date(),
            processStatus: 'COMPLETED',
            imageUrl: null,
            topics: [],
          }))
      )

      const request = createMockRequest('http://localhost:3000/api/notes?limit=50&offset=0')
      const response = await GET(request)
      const data = await response.json()

      expect(data.hasMore).toBe(true) // 100 total, 50 fetched, 50 remaining
    })

    it('should handle database errors', async () => {
      ;(getSession as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } })
      prismaMock.note.count.mockRejectedValue(new Error('Database connection failed'))

      const request = createMockRequest('http://localhost:3000/api/notes')
      const response = await GET(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Failed to fetch notes')
    })
  })

  describe('POST /api/notes', () => {
    it('should return 401 when not authenticated', async () => {
      ;(getSession as jest.Mock).mockResolvedValue(null)

      const request = createMockRequest('http://localhost:3000/api/notes', {
        method: 'POST',
        body: JSON.stringify({ type: 'TEXT', content: 'Test' }),
      })
      const response = await POST(request)

      expect(response.status).toBe(401)
    })

    it('should return 400 when missing required fields', async () => {
      ;(getSession as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } })

      const request = createMockRequest('http://localhost:3000/api/notes', {
        method: 'POST',
        body: JSON.stringify({ type: 'TEXT' }), // Missing content
      })
      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('Missing required fields')
    })

    it('should return 400 for invalid note type', async () => {
      ;(getSession as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } })

      const request = createMockRequest('http://localhost:3000/api/notes', {
        method: 'POST',
        body: JSON.stringify({ type: 'INVALID', content: 'Test' }),
      })
      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Invalid note type')
    })

    it('should create a TEXT note successfully', async () => {
      ;(getSession as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } })

      const mockNote = {
        id: 'note-123',
        type: 'TEXT',
        content: 'This is test content',
        title: 'Test Note',
        tags: ['test'],
        processStatus: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      prismaMock.note.create.mockResolvedValue(mockNote as any)
      ;(queueNoteProcessing as jest.Mock).mockResolvedValue({ id: 'job-123' })

      const request = createMockRequest('http://localhost:3000/api/notes', {
        method: 'POST',
        body: JSON.stringify({
          type: 'TEXT',
          content: 'This is test content',
          title: 'Test Note',
          tags: ['test'],
        }),
      })
      const response = await POST(request)

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.note.id).toBe('note-123')
      expect(data.jobId).toBe('job-123')
    })

    it('should create a LINK note', async () => {
      ;(getSession as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } })

      const mockNote = {
        id: 'note-456',
        type: 'LINK',
        content: 'https://example.com/article',
        processStatus: 'PENDING',
      }

      prismaMock.note.create.mockResolvedValue(mockNote as any)
      ;(queueNoteProcessing as jest.Mock).mockResolvedValue({ id: 'job-456' })

      const request = createMockRequest('http://localhost:3000/api/notes', {
        method: 'POST',
        body: JSON.stringify({
          type: 'LINK',
          content: 'https://example.com/article',
        }),
      })
      const response = await POST(request)

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.note.type).toBe('LINK')
    })

    it('should upload image to R2 for IMAGE type', async () => {
      ;(getSession as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } })
      ;(uploadToR2 as jest.Mock).mockResolvedValue('https://r2.example.com/image.jpg')

      const mockNote = {
        id: 'note-789',
        type: 'IMAGE',
        content: 'https://r2.example.com/image.jpg',
        processStatus: 'PENDING',
      }

      prismaMock.note.create.mockResolvedValue(mockNote as any)
      ;(queueNoteProcessing as jest.Mock).mockResolvedValue({ id: 'job-789' })

      const request = createMockRequest('http://localhost:3000/api/notes', {
        method: 'POST',
        body: JSON.stringify({
          type: 'IMAGE',
          content: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        }),
      })
      const response = await POST(request)

      expect(response.status).toBe(201)
      expect(uploadToR2).toHaveBeenCalled()
    })

    it('should return 500 when image upload fails for IMAGE type', async () => {
      ;(getSession as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } })
      ;(uploadToR2 as jest.Mock).mockRejectedValue(new Error('Upload failed'))

      const request = createMockRequest('http://localhost:3000/api/notes', {
        method: 'POST',
        body: JSON.stringify({
          type: 'IMAGE',
          content: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        }),
      })
      const response = await POST(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Failed to upload image')
    })

    it('should continue when thumbnail upload fails (non-critical)', async () => {
      ;(getSession as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } })
      // First call succeeds (content), second fails (thumbnail)
      ;(uploadToR2 as jest.Mock)
        .mockResolvedValueOnce('https://r2.example.com/content.jpg')
        .mockRejectedValueOnce(new Error('Thumbnail upload failed'))

      const mockNote = {
        id: 'note-1',
        type: 'TEXT',
        content: 'Test content',
        processStatus: 'PENDING',
        metadata: { imageUploadError: 'Thumbnail upload failed' },
      }

      prismaMock.note.create.mockResolvedValue(mockNote as any)
      ;(queueNoteProcessing as jest.Mock).mockResolvedValue({ id: 'job-1' })

      const request = createMockRequest('http://localhost:3000/api/notes', {
        method: 'POST',
        body: JSON.stringify({
          type: 'TEXT',
          content: 'Test content',
          imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        }),
      })
      const response = await POST(request)

      // Should still succeed - thumbnail is non-critical
      expect(response.status).toBe(201)
    })

    it('should skip auto-processing when autoProcess is false', async () => {
      ;(getSession as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } })

      const mockNote = {
        id: 'note-1',
        type: 'TEXT',
        content: 'Test',
        processStatus: 'PENDING',
      }

      prismaMock.note.create.mockResolvedValue(mockNote as any)

      const request = createMockRequest('http://localhost:3000/api/notes', {
        method: 'POST',
        body: JSON.stringify({
          type: 'TEXT',
          content: 'Test',
          autoProcess: false,
        }),
      })
      const response = await POST(request)

      expect(response.status).toBe(201)
      expect(queueNoteProcessing).not.toHaveBeenCalled()
    })

    it('should handle queue errors gracefully', async () => {
      ;(getSession as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } })

      const mockNote = {
        id: 'note-1',
        type: 'TEXT',
        content: 'Test',
        processStatus: 'PENDING',
      }

      prismaMock.note.create.mockResolvedValue(mockNote as any)
      ;(queueNoteProcessing as jest.Mock).mockRejectedValue(new Error('Queue unavailable'))

      const request = createMockRequest('http://localhost:3000/api/notes', {
        method: 'POST',
        body: JSON.stringify({
          type: 'TEXT',
          content: 'Test',
        }),
      })
      const response = await POST(request)

      // Should still succeed - queue is non-critical
      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.jobId).toBeNull()
    })

    it('should handle database errors', async () => {
      ;(getSession as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } })
      prismaMock.note.create.mockRejectedValue(new Error('Database write failed'))

      const request = createMockRequest('http://localhost:3000/api/notes', {
        method: 'POST',
        body: JSON.stringify({
          type: 'TEXT',
          content: 'Test',
        }),
      })
      const response = await POST(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Failed to create note')
    })
  })
})
