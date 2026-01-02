import { Queue, Worker, Job } from 'bullmq'
import { Redis } from 'ioredis'

// Job data types
export interface ProcessNoteJob {
  noteId: string
}

// Queue and worker instances
let noteQueue: Queue | null = null
let noteWorker: Worker | null = null
let redisAvailable: boolean | null = null
let lastRedisCheck = 0
const REDIS_CHECK_INTERVAL = 30000 // Check every 30 seconds

/**
 * Quick check if Redis is available (with caching)
 */
async function isRedisAvailable(): Promise<boolean> {
  const now = Date.now()

  // Return cached result if recent
  if (redisAvailable !== null && now - lastRedisCheck < REDIS_CHECK_INTERVAL) {
    return redisAvailable
  }

  try {
    const testConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      lazyConnect: true,
      enableOfflineQueue: false,
    })

    // Suppress error events to prevent crashes
    testConnection.on('error', () => {
      // Silently ignore - we handle errors via try/catch
    })

    await testConnection.connect()
    await testConnection.ping()
    await testConnection.quit()

    redisAvailable = true
    lastRedisCheck = now
    return true
  } catch {
    redisAvailable = false
    lastRedisCheck = now
    return false
  }
}

/**
 * Get or create the note processing queue
 * Throws immediately if Redis is not available
 */
export async function getNoteQueueAsync(): Promise<Queue> {
  // Quick check if Redis is available
  const available = await isRedisAvailable()
  if (!available) {
    throw new Error('Redis is not available')
  }

  if (!noteQueue) {
    // BullMQ requires a dedicated Redis connection with maxRetriesPerRequest: null
    const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
    })

    // Handle connection errors to prevent crashes
    connection.on('error', (err) => {
      console.error('Queue Redis connection error:', err.message)
    })

    noteQueue = new Queue('note-processing', {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000, // Start with 2 seconds, then 4s, 8s
        },
        removeOnComplete: {
          age: 24 * 3600, // Keep completed jobs for 24 hours
          count: 1000, // Keep last 1000 completed jobs
        },
        removeOnFail: {
          age: 7 * 24 * 3600, // Keep failed jobs for 7 days
        },
      },
    })

    console.log('✅ Note processing queue initialized')
  }

  return noteQueue
}

/**
 * Get or create the note processing queue (sync version)
 * @deprecated Use getNoteQueueAsync instead - this version may cause issues if Redis unavailable
 */
export function getNoteQueue(): Queue {
  if (!noteQueue) {
    // BullMQ requires a dedicated Redis connection with maxRetriesPerRequest: null
    const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
    })

    // Handle connection errors to prevent crashes
    connection.on('error', (err) => {
      console.error('Queue Redis connection error:', err.message)
    })

    noteQueue = new Queue('note-processing', {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000, // Start with 2 seconds, then 4s, 8s
        },
        removeOnComplete: {
          age: 24 * 3600, // Keep completed jobs for 24 hours
          count: 1000, // Keep last 1000 completed jobs
        },
        removeOnFail: {
          age: 7 * 24 * 3600, // Keep failed jobs for 7 days
        },
      },
    })

    console.log('✅ Note processing queue initialized')
  }

  return noteQueue
}

/**
 * Add a note to the processing queue
 * Now uses async queue getter to fail fast if Redis unavailable
 */
export async function queueNoteProcessing(
  noteId: string
): Promise<Job<ProcessNoteJob>> {
  const queue = await getNoteQueueAsync()

  const job = await queue.add(
    'processNote',
    { noteId },
    {
      jobId: `note-${noteId}-${Date.now()}`, // Unique job ID to prevent duplicates
    }
  )

  console.log(`📝 Note ${noteId} queued for processing (Job ID: ${job.id})`)

  return job
}

/**
 * Get job status by ID
 */
export async function getJobStatus(jobId: string) {
  const queue = await getNoteQueueAsync()
  const job = await queue.getJob(jobId)

  if (!job) {
    return null
  }

  const state = await job.getState()
  const progress = job.progress
  const returnValue = job.returnvalue
  const failedReason = job.failedReason

  return {
    id: job.id,
    state,
    progress,
    result: returnValue,
    error: failedReason,
    attempts: job.attemptsMade,
    maxAttempts: job.opts.attempts,
  }
}

/**
 * Create and start the note processing worker
 * This should be called in a separate process/service
 */
export function createNoteWorker(
  processorFn: (job: Job) => Promise<any>
): Worker {
  if (noteWorker) {
    console.warn('⚠️  Note worker already exists')
    return noteWorker
  }

  /*
  * BullMQ requires a dedicated Redis connection with maxRetriesPerRequest: null
  */
  const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
  })

  // Handle connection errors to prevent crashes
  connection.on('error', (err) => {
    console.error('Worker Redis connection error:', err.message)
  })

  noteWorker = new Worker(
    'note-processing',
    async (job: Job) => {
      console.log(`🔄 Processing note ${job.data.noteId} (Job: ${job.id})`)

      try {
        // Update progress to indicate processing started
        await job.updateProgress(10)

        // Call the processor function (from note-processing-service)
        const result = await processorFn(job)

        // Update progress to 100% before completion
        await job.updateProgress(100)

        console.log(`✅ Note ${job.data.noteId} processed successfully`)

        return result
      } catch (error) {
        console.error(`❌ Failed to process note ${job.data.noteId}:`, error)
        throw error // Re-throw to trigger retry logic
      }
    },
    {
      connection,
      concurrency: 5, // Process up to 5 jobs concurrently
      limiter: {
        max: 10, // Maximum 10 jobs
        duration: 1000, // per 1 second
      },
    }
  )

  // Worker event listeners
  noteWorker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed`)
  })

  noteWorker.on('failed', (job, err) => {
    if (job) {
      console.error(
        `❌ Job ${job.id} failed after ${job.attemptsMade} attempts:`,
        err.message
      )
    }
  })

  noteWorker.on('error', (err) => {
    console.error('🔴 Worker error:', err)
  })

  console.log('✅ Note processing worker started')

  return noteWorker
}

/**
 * Gracefully close queue and worker connections
 */
export async function closeQueueConnections(): Promise<void> {
  const promises: Promise<void>[] = []

  if (noteWorker) {
    promises.push(noteWorker.close())
    noteWorker = null
  }

  if (noteQueue) {
    promises.push(noteQueue.close())
    noteQueue = null
  }

  await Promise.all(promises)
  console.log('✅ Queue and worker connections closed')
}
