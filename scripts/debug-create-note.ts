
import { PrismaClient } from '@prisma/client'
import { queueNoteProcessing } from '../lib/queue/note-queue'

const prisma = new PrismaClient()

async function main() {
    console.log('🚀 Starting debug script...')

    try {
        // 1. Create a test note directly in DB
        console.log('Creating test note...')
        const note = await prisma.note.create({
            data: {
                title: 'Debug Test Note',
                content: 'https://github.com/amirhjalali/amirhjalali.com', // Valid URL
                type: 'LINK',
                tags: ['debug', 'test'],
                processStatus: 'PENDING',
            },
        })
        console.log(`✅ Note created with ID: ${note.id}`)

        // 2. Queue for processing
        console.log('Queuing for processing...')
        const job = await queueNoteProcessing(note.id)
        console.log(`✅ Job queued with ID: ${job.id}`)

        // 3. Poll for status change
        console.log('Waiting for processing (poll every 2s)...')
        let attempts = 0
        while (attempts < 15) { // 30 seconds max
            await new Promise(r => setTimeout(r, 2000))

            const updatedNote = await prisma.note.findUnique({
                where: { id: note.id },
            })

            if (!updatedNote) {
                console.error('❌ Note disappeared!')
                break
            }

            console.log(`Current Status: ${updatedNote.processStatus}`)

            if (updatedNote.processStatus === 'COMPLETED') {
                console.log('🎉 Processing COMPLETED!')
                console.log('Summary:', updatedNote.summary)
                console.log('Topics:', updatedNote.topics)
                console.log('Metadata:', updatedNote.metadata)
                break
            }

            if (updatedNote.processStatus === 'FAILED') {
                console.error('❌ Processing FAILED!')
                break
            }

            attempts++
        }

        if (attempts >= 15) {
            console.log('⚠️ Timeout waiting for processing')
        }

    } catch (error) {
        console.error('❌ Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
