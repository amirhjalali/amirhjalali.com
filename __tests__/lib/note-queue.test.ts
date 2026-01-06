/**
 * Unit tests for note-queue.ts
 * Tests BullMQ queue operations for note processing
 */

// Mock BullMQ before imports
const mockQueueAdd = jest.fn()
const mockQueueGetJob = jest.fn()
const mockQueueClose = jest.fn().mockResolvedValue(undefined)
const mockWorkerClose = jest.fn().mockResolvedValue(undefined)

jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({
    add: mockQueueAdd,
    getJob: mockQueueGetJob,
    close: mockQueueClose,
  })),
  Worker: jest.fn().mockImplementation(() => ({
    close: mockWorkerClose,
    on: jest.fn(),
  })),
  Job: jest.fn(),
}))

// Mock ioredis
const mockRedisConnect = jest.fn()
const mockRedisPing = jest.fn()
const mockRedisQuit = jest.fn()
const mockRedisOn = jest.fn()

jest.mock('ioredis', () => ({
  Redis: jest.fn().mockImplementation(() => ({
    connect: mockRedisConnect,
    ping: mockRedisPing,
    quit: mockRedisQuit,
    on: mockRedisOn,
  })),
}))

describe('note-queue', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getNoteQueueAsync', () => {
    it('should create queue when Redis is available', async () => {
      mockRedisConnect.mockResolvedValue(undefined)
      mockRedisPing.mockResolvedValue('PONG')
      mockRedisQuit.mockResolvedValue(undefined)

      // Clear the cached module to get fresh instance
      jest.resetModules()
      const { getNoteQueueAsync } = require('@/lib/queue/note-queue')

      const queue = await getNoteQueueAsync()
      expect(queue).toBeDefined()
      expect(queue.add).toBeDefined()
    })

    it('should throw error when Redis is not available', async () => {
      mockRedisConnect.mockRejectedValue(new Error('Connection refused'))

      jest.resetModules()
      const { getNoteQueueAsync } = require('@/lib/queue/note-queue')

      await expect(getNoteQueueAsync()).rejects.toThrow('Redis is not available')
    })

    it('should reuse existing queue instance', async () => {
      mockRedisConnect.mockResolvedValue(undefined)
      mockRedisPing.mockResolvedValue('PONG')
      mockRedisQuit.mockResolvedValue(undefined)

      jest.resetModules()
      const { getNoteQueueAsync } = require('@/lib/queue/note-queue')

      const queue1 = await getNoteQueueAsync()
      const queue2 = await getNoteQueueAsync()

      expect(queue1).toBe(queue2)
    })
  })

  describe('queueNoteProcessing', () => {
    beforeEach(() => {
      mockRedisConnect.mockResolvedValue(undefined)
      mockRedisPing.mockResolvedValue('PONG')
      mockRedisQuit.mockResolvedValue(undefined)
    })

    it('should add note to processing queue', async () => {
      const mockJob = {
        id: 'job-123',
        data: { noteId: 'note-456' },
      }
      mockQueueAdd.mockResolvedValue(mockJob)

      jest.resetModules()
      const { queueNoteProcessing } = require('@/lib/queue/note-queue')
      const job = await queueNoteProcessing('note-456')

      expect(job).toEqual(mockJob)
      expect(mockQueueAdd).toHaveBeenCalledWith(
        'processNote',
        { noteId: 'note-456' },
        expect.objectContaining({
          jobId: expect.stringContaining('note-note-456'),
        })
      )
    })

    it('should include timestamp in job ID for uniqueness', async () => {
      const mockJob = { id: 'job-123', data: { noteId: 'note-1' } }
      mockQueueAdd.mockResolvedValue(mockJob)

      jest.resetModules()
      const { queueNoteProcessing } = require('@/lib/queue/note-queue')
      await queueNoteProcessing('note-1')

      const callArgs = mockQueueAdd.mock.calls[0]
      expect(callArgs[2].jobId).toMatch(/^note-note-1-\d+$/)
    })

    it('should propagate errors from queue.add', async () => {
      mockQueueAdd.mockRejectedValue(new Error('Queue error'))

      jest.resetModules()
      const { queueNoteProcessing } = require('@/lib/queue/note-queue')

      await expect(queueNoteProcessing('note-1')).rejects.toThrow('Queue error')
    })
  })

  describe('getJobStatus', () => {
    beforeEach(() => {
      mockRedisConnect.mockResolvedValue(undefined)
      mockRedisPing.mockResolvedValue('PONG')
      mockRedisQuit.mockResolvedValue(undefined)
    })

    it('should return job status for existing job', async () => {
      const mockJob = {
        id: 'job-123',
        progress: 50,
        returnvalue: { success: true },
        failedReason: null,
        attemptsMade: 1,
        opts: { attempts: 3 },
        getState: jest.fn().mockResolvedValue('completed'),
      }
      mockQueueGetJob.mockResolvedValue(mockJob)

      jest.resetModules()
      const { getJobStatus } = require('@/lib/queue/note-queue')
      const status = await getJobStatus('job-123')

      expect(status).toEqual({
        id: 'job-123',
        state: 'completed',
        progress: 50,
        result: { success: true },
        error: null,
        attempts: 1,
        maxAttempts: 3,
      })
    })

    it('should return null for non-existent job', async () => {
      mockQueueGetJob.mockResolvedValue(null)

      jest.resetModules()
      const { getJobStatus } = require('@/lib/queue/note-queue')
      const status = await getJobStatus('non-existent')

      expect(status).toBeNull()
    })

    it('should include failed reason when job failed', async () => {
      const mockJob = {
        id: 'job-456',
        progress: 10,
        returnvalue: null,
        failedReason: 'Processing failed due to timeout',
        attemptsMade: 3,
        opts: { attempts: 3 },
        getState: jest.fn().mockResolvedValue('failed'),
      }
      mockQueueGetJob.mockResolvedValue(mockJob)

      jest.resetModules()
      const { getJobStatus } = require('@/lib/queue/note-queue')
      const status = await getJobStatus('job-456')

      expect(status?.state).toBe('failed')
      expect(status?.error).toBe('Processing failed due to timeout')
    })
  })

  describe('createNoteWorker', () => {
    beforeEach(() => {
      mockRedisConnect.mockResolvedValue(undefined)
      mockRedisPing.mockResolvedValue('PONG')
      mockRedisQuit.mockResolvedValue(undefined)
    })

    it('should create a worker with processor function', () => {
      const processor = jest.fn().mockResolvedValue({ processed: true })

      jest.resetModules()
      const { createNoteWorker } = require('@/lib/queue/note-queue')
      const worker = createNoteWorker(processor)

      expect(worker).toBeDefined()
      expect(worker.on).toBeDefined()
      expect(worker.close).toBeDefined()
    })

    it('should return existing worker if already created', () => {
      const processor = jest.fn()

      jest.resetModules()
      const { createNoteWorker } = require('@/lib/queue/note-queue')
      const worker1 = createNoteWorker(processor)
      const worker2 = createNoteWorker(processor)

      expect(worker1).toBe(worker2)
    })
  })

  describe('closeQueueConnections', () => {
    beforeEach(() => {
      mockRedisConnect.mockResolvedValue(undefined)
      mockRedisPing.mockResolvedValue('PONG')
      mockRedisQuit.mockResolvedValue(undefined)
    })

    it('should close queue connection', async () => {
      jest.resetModules()
      const { getNoteQueueAsync, closeQueueConnections } = require('@/lib/queue/note-queue')
      await getNoteQueueAsync()

      await closeQueueConnections()

      expect(mockQueueClose).toHaveBeenCalled()
    })

    it('should close worker connection', async () => {
      const processor = jest.fn()

      jest.resetModules()
      const { createNoteWorker, closeQueueConnections } = require('@/lib/queue/note-queue')
      createNoteWorker(processor)

      await closeQueueConnections()

      expect(mockWorkerClose).toHaveBeenCalled()
    })

    it('should handle case when no connections exist', async () => {
      jest.resetModules()
      const { closeQueueConnections } = require('@/lib/queue/note-queue')

      await expect(closeQueueConnections()).resolves.not.toThrow()
    })
  })

  describe('Error Handling', () => {
    it('should handle Redis connection errors gracefully', async () => {
      mockRedisConnect.mockRejectedValue(new Error('ECONNREFUSED'))

      jest.resetModules()
      const { getNoteQueueAsync } = require('@/lib/queue/note-queue')

      await expect(getNoteQueueAsync()).rejects.toThrow('Redis is not available')
    })

    it('should handle Redis ping timeout', async () => {
      mockRedisConnect.mockResolvedValue(undefined)
      mockRedisPing.mockRejectedValue(new Error('Timeout'))

      jest.resetModules()
      const { getNoteQueueAsync } = require('@/lib/queue/note-queue')

      await expect(getNoteQueueAsync()).rejects.toThrow('Redis is not available')
    })

    it('should suppress error events on Redis connection', async () => {
      mockRedisConnect.mockResolvedValue(undefined)
      mockRedisPing.mockResolvedValue('PONG')
      mockRedisQuit.mockResolvedValue(undefined)

      jest.resetModules()
      const { getNoteQueueAsync } = require('@/lib/queue/note-queue')
      await getNoteQueueAsync()

      expect(mockRedisOn).toHaveBeenCalledWith('error', expect.any(Function))
    })
  })
})
