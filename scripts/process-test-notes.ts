/**
 * Process Test Notes Script
 *
 * Directly processes pending notes with AI without requiring Redis.
 * This triggers: summarization, key insights, topic extraction, embeddings, knowledge graph linking
 */

import { prisma } from '../lib/db'
import { processNote } from '../lib/note-processing-service'

async function processTestNotes() {
  console.log('🔄 Finding pending notes to process...\n')

  // Find all pending notes
  const pendingNotes = await prisma.note.findMany({
    where: { processStatus: 'PENDING' },
    select: { id: true, title: true, type: true },
  })

  if (pendingNotes.length === 0) {
    console.log('✅ No pending notes to process!')
    return
  }

  console.log(`Found ${pendingNotes.length} pending notes\n`)

  for (const note of pendingNotes) {
    console.log(`📝 Processing: "${note.title || 'Untitled'}" (${note.type})`)

    try {
      const processed = await processNote(note.id)
      console.log(`   ✅ Success!`)
      console.log(`   📊 Summary: ${processed.summary?.slice(0, 100)}...`)
      console.log(`   🏷️  Topics: ${processed.topics?.join(', ') || 'none'}`)
      console.log(`   💡 Insights: ${processed.keyInsights?.length || 0} extracted`)
      console.log('')
    } catch (error: any) {
      console.log(`   ❌ Failed: ${error.message}`)
      console.log('')
    }
  }

  console.log('\n✨ Processing complete!')
  console.log('\nYou can now:')
  console.log('1. View notes at https://notes.amirhjalali.com')
  console.log('2. Test semantic search')
  console.log('3. View the knowledge graph')
  console.log('4. Test spaced repetition review')
  console.log('5. Test the chat feature')
}

// Run
processTestNotes()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Processing failed:', error)
    process.exit(1)
  })
