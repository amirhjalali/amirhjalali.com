/**
 * Reprocess All Notes Script
 *
 * Queries the database for notes, then triggers reprocessing via the local API.
 * Bypasses auth by setting an admin session cookie.
 *
 * Usage: npx tsx scripts/reprocess-notes.ts [--dry-run]
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')

const BASE_URL = process.env.BASE_URL || 'http://localhost:3002'

// Create admin session cookie matching the auth format
const ADMIN_SESSION = JSON.stringify({ authenticated: true, loginTime: Date.now() })

async function reprocessNotes() {
  console.log('🔄 Note Reprocessing Script')
  console.log('='.repeat(50))

  // Get all notes
  const notes = await prisma.note.findMany({
    select: {
      id: true,
      title: true,
      type: true,
      processStatus: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  })

  console.log(`\n📊 Found ${notes.length} notes\n`)

  if (notes.length === 0) {
    console.log('No notes found.')
    return
  }

  // Show summary
  const statusCounts: Record<string, number> = {}
  const typeCounts: Record<string, number> = {}
  for (const note of notes) {
    statusCounts[note.processStatus || 'NULL'] = (statusCounts[note.processStatus || 'NULL'] || 0) + 1
    typeCounts[note.type] = (typeCounts[note.type] || 0) + 1
  }

  console.log('Status breakdown:')
  for (const [status, count] of Object.entries(statusCounts)) {
    console.log(`  ${status}: ${count}`)
  }
  console.log('\nType breakdown:')
  for (const [type, count] of Object.entries(typeCounts)) {
    console.log(`  ${type}: ${count}`)
  }

  if (dryRun) {
    console.log('\n🏃 DRY RUN - listing all notes:')
    for (const note of notes) {
      console.log(`  [${note.type}] ${note.title || '(untitled)'} (${note.processStatus}) - ${note.id}`)
    }
    return
  }

  console.log('\n🚀 Starting reprocessing via API...\n')

  let successCount = 0
  let failCount = 0

  for (let i = 0; i < notes.length; i++) {
    const note = notes[i]
    const progress = `[${i + 1}/${notes.length}]`

    try {
      console.log(`${progress} Processing: "${note.title || '(untitled)'}" (${note.type})`)

      const response = await fetch(`${BASE_URL}/api/notes/${note.id}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `admin_session=${encodeURIComponent(ADMIN_SESSION)}`,
        },
      })

      const result = await response.json()

      if (response.ok) {
        console.log(`  ✅ ${result.status || 'queued'} - ${result.message || ''}`)
        if (result.note) {
          console.log(`  📌 Topics: ${result.note.topics?.join(', ') || 'n/a'}`)
        }
        successCount++
      } else {
        console.log(`  ⚠️  ${response.status}: ${result.error}`)
        if (response.status === 409) {
          // Already processing - count as success
          successCount++
        } else {
          failCount++
        }
      }
    } catch (error: any) {
      console.error(`  ❌ Failed: ${error.message}`)
      failCount++
    }

    // Delay between notes to avoid rate limiting (OpenAI calls)
    if (i < notes.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('📊 Reprocessing Complete')
  console.log(`  ✅ Successful: ${successCount}`)
  console.log(`  ❌ Failed: ${failCount}`)
  console.log(`  📝 Total: ${notes.length}`)
}

reprocessNotes()
  .then(() => {
    console.log('\n👋 Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error)
    process.exit(1)
  })
