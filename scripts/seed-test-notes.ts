/**
 * Seed Test Notes Script
 *
 * This script adds test notes to verify all features work correctly.
 * Run locally after starting the dev server: npx ts-node scripts/seed-test-notes.ts
 *
 * Features tested:
 * - Different note types (LINK, TEXT)
 * - AI processing (summarization, key insights, topics)
 * - Embedding generation (semantic search)
 * - Knowledge graph (topic linking)
 * - Spaced repetition (review queue)
 */

import { prisma } from '../lib/db'
import { queueNoteProcessing } from '../lib/queue/note-queue'

const testNotes = [
  {
    type: 'TEXT',
    title: 'Understanding Vector Embeddings',
    content: `Vector embeddings are a fundamental concept in modern AI and machine learning.

They represent data (like text, images, or audio) as dense numerical vectors in a high-dimensional space. The key insight is that semantically similar items end up close together in this vector space.

Key concepts:
1. Dimensionality: Modern embeddings typically have 256-4096 dimensions
2. Cosine Similarity: Used to measure how similar two embeddings are
3. Semantic Search: Finding related content by comparing embedding vectors
4. Fine-tuning: Embeddings can be trained on domain-specific data

Applications include:
- Search engines (semantic understanding of queries)
- Recommendation systems
- Document clustering
- Question answering systems

Popular embedding models include OpenAI's text-embedding-3-small, Google's BERT, and Meta's LLaMA.`,
    tags: ['AI', 'machine-learning', 'embeddings', 'NLP'],
  },
  {
    type: 'TEXT',
    title: 'Spaced Repetition Learning Technique',
    content: `Spaced repetition is a learning technique that incorporates increasing intervals of time between subsequent review of previously learned material.

The SM-2 Algorithm:
- Developed by Piotr Wozniak in 1985
- Uses an "ease factor" to adjust intervals based on difficulty
- Reviews items just before you're likely to forget them

How it works:
1. Initial review: Learn new material
2. First interval: Review after 1 day
3. Subsequent intervals: Multiply by ease factor (typically 2.5)
4. Adjust based on performance: Easy = longer intervals, Hard = shorter

Benefits:
- Optimizes long-term retention
- Reduces total study time
- Builds genuine understanding over cramming

Popular implementations:
- Anki (open source)
- SuperMemo (original)
- Recall.ai and similar apps

This technique is particularly effective for learning languages, medical terminology, programming concepts, and any fact-based knowledge.`,
    tags: ['learning', 'productivity', 'spaced-repetition', 'education'],
  },
  {
    type: 'TEXT',
    title: 'Building Knowledge Graphs',
    content: `A knowledge graph represents information as a network of entities and their relationships.

Core Components:
- Nodes: Represent entities (people, places, concepts)
- Edges: Represent relationships between entities
- Properties: Attributes attached to nodes and edges

Architecture:
1. Entity Extraction: Identify key concepts from text using NLP
2. Relationship Detection: Find connections between entities
3. Graph Storage: Use graph databases like Neo4j or property graphs
4. Querying: Traverse the graph to answer complex questions

Use Cases:
- Personal knowledge management (like Roam, Obsidian)
- Enterprise search and discovery
- Recommendation engines
- Question answering systems

Benefits for PKM (Personal Knowledge Management):
- See connections between ideas
- Discover unexpected relationships
- Build a "second brain"
- Enable serendipitous learning

The key insight is that knowledge is not hierarchical—it's networked. Knowledge graphs capture this networked nature better than traditional folder structures.`,
    tags: ['knowledge-management', 'PKM', 'graphs', 'AI'],
  },
  {
    type: 'LINK',
    title: 'Next.js 15 Documentation',
    content: 'https://nextjs.org/docs',
    tags: ['nextjs', 'web-development', 'react', 'documentation'],
  },
  {
    type: 'TEXT',
    title: 'The Art of Prompt Engineering',
    content: `Prompt engineering is the practice of designing inputs for AI language models to produce desired outputs.

Key Principles:
1. Be Specific: Vague prompts lead to vague answers
2. Provide Context: Give the model relevant background
3. Show Examples: Few-shot learning improves accuracy
4. Set Constraints: Define format, length, and style
5. Iterate: Refine prompts based on outputs

Common Techniques:
- Zero-shot: Direct instruction without examples
- Few-shot: Provide 2-5 examples of desired output
- Chain-of-thought: Ask model to explain reasoning
- Role-playing: "You are a senior developer..."

Best Practices:
- Start simple, add complexity as needed
- Use clear delimiters (### or """)
- Be explicit about output format
- Include negative examples (what NOT to do)
- Test with edge cases

The key insight is that LLMs are pattern-matching systems. Your prompt teaches the pattern you want the model to follow.`,
    tags: ['AI', 'prompt-engineering', 'LLM', 'productivity'],
  },
]

async function seedTestNotes() {
  console.log('🌱 Starting to seed test notes...\n')

  for (const noteData of testNotes) {
    try {
      console.log(`📝 Creating note: "${noteData.title}"`)

      // Create the note
      const note = await prisma.note.create({
        data: {
          type: noteData.type as any,
          title: noteData.title,
          content: noteData.content,
          tags: noteData.tags,
          topics: [],
          keyInsights: [],
          processStatus: 'PENDING',
        },
      })

      console.log(`   ✅ Created with ID: ${note.id}`)

      // Queue for processing (AI summarization, embeddings, etc.)
      try {
        const job = await queueNoteProcessing(note.id)
        console.log(`   🔄 Queued for processing (Job: ${job.id})`)
      } catch (queueError) {
        console.log(`   ⚠️ Could not queue for processing (Redis may be offline)`)
      }

      console.log('')
    } catch (error: any) {
      console.error(`   ❌ Failed: ${error.message}`)
    }
  }

  console.log('\n✨ Seeding complete!')
  console.log('\nNotes created. To trigger AI processing:')
  console.log('1. Make sure Redis is running (or use the batch process endpoint)')
  console.log('2. Visit /api/notes/process-batch to process all pending notes')
  console.log('3. Or process individually via /api/notes/{id}/process')
}

// Run if executed directly
seedTestNotes()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seeding failed:', error)
    process.exit(1)
  })
