#!/usr/bin/env node

/**
 * Background worker for processing notes queue
 *
 * This script starts a BullMQ worker that processes notes from the queue.
 * It should be run as a separate process/service in production.
 *
 * Usage:
 *   node scripts/note-worker.js
 *
 * Environment variables:
 *   - REDIS_URL: Redis connection URL (default: redis://localhost:6379)
 *   - OPENAI_API_KEY: OpenAI API key for AI processing
 *   - DATABASE_URL: PostgreSQL database URL
 *   - NODE_ENV: Environment (development/production/worker)
 */

// Load environment variables
require('dotenv').config()

const { createNoteWorker } = require('../lib/queue/note-queue')
const { processNote } = require('../lib/note-processing-service')

console.log('='.repeat(60))
console.log('📝 Note Processing Worker Starting...')
console.log('='.repeat(60))
console.log('')
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
console.log(`Redis URL: ${process.env.REDIS_URL || 'redis://localhost:6379'}`)
console.log(`Database URL: ${process.env.DATABASE_URL ? '✓ Set' : '✗ Not set'}`)
console.log(`OpenAI API Key: ${process.env.OPENAI_API_KEY ? '✓ Set' : '✗ Not set'}`)
console.log('')

// Validate environment variables
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL environment variable is required')
  process.exit(1)
}

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ ERROR: OPENAI_API_KEY environment variable is required')
  process.exit(1)
}

// Create and start the worker
const worker = createNoteWorker(async (job) => {
  const { noteId } = job.data

  console.log(`\n${'─'.repeat(60)}`)
  console.log(`📌 Processing Note: ${noteId}`)
  console.log(`   Job ID: ${job.id}`)
  console.log(`   Attempt: ${job.attemptsMade + 1}/${job.opts.attempts}`)
  console.log(`${'─'.repeat(60)}\n`)

  try {
    const result = await processNote(noteId)

    console.log(`\n✅ Successfully processed note ${noteId}`)
    console.log(`   Status: ${result.processStatus}`)
    console.log(`   Summary: ${result.summary ? 'Generated' : 'None'}`)
    console.log(`   Topics: ${result.topics.length} found`)
    console.log(`   Insights: ${result.keyInsights.length} extracted`)

    return result
  } catch (error) {
    console.error(`\n❌ Failed to process note ${noteId}:`, error.message)

    if (job.attemptsMade < job.opts.attempts - 1) {
      console.log(`   Retrying... (${job.attemptsMade + 1}/${job.opts.attempts})`)
    } else {
      console.error(`   Max retries reached. Job failed permanently.`)
    }

    throw error
  }
})

console.log('='.repeat(60))
console.log('✅ Worker started successfully!')
console.log('='.repeat(60))
console.log('')
console.log('Worker is now listening for jobs...')
console.log('Press Ctrl+C to stop')
console.log('')

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n⚠️  Received SIGINT signal. Shutting down gracefully...')

  try {
    await worker.close()
    console.log('✅ Worker closed successfully')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error during shutdown:', error)
    process.exit(1)
  }
})

process.on('SIGTERM', async () => {
  console.log('\n\n⚠️  Received SIGTERM signal. Shutting down gracefully...')

  try {
    await worker.close()
    console.log('✅ Worker closed successfully')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error during shutdown:', error)
    process.exit(1)
  }
})

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})
