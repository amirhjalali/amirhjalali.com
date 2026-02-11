import OpenAI from 'openai'
import { prisma } from './db'
import { chunkContent, cleanText } from './content-extraction'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const EMBEDDING_MODEL = 'text-embedding-3-small'
const EMBEDDING_DIMENSIONS = 1536

export interface EmbeddingResult {
  embedding: number[]
  tokenCount: number
}

// Generate embedding for text
export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  const cleanedText = cleanText(text)

  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: cleanedText,
    dimensions: EMBEDDING_DIMENSIONS,
  })

  return {
    embedding: response.data[0].embedding,
    tokenCount: response.usage.total_tokens,
  }
}

// Generate embeddings for multiple texts (batch)
export async function generateEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
  const cleanedTexts = texts.map(cleanText)

  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: cleanedTexts,
    dimensions: EMBEDDING_DIMENSIONS,
  })

  return response.data.map((d) => ({
    embedding: d.embedding,
    tokenCount: Math.ceil(response.usage.total_tokens / texts.length),
  }))
}

// Index a note - chunk content and create embeddings
export async function indexNote(noteId: string): Promise<{ chunkCount: number }> {
  const note = await prisma.note.findUnique({
    where: { id: noteId },
  })

  if (!note) {
    throw new Error(`Note ${noteId} not found`)
  }

  // Get text content
  const textContent = note.fullContent || note.content || ''

  if (!textContent || textContent.length < 50) {
    // Too short to chunk
    return { chunkCount: 0 }
  }

  // Delete existing chunks
  await prisma.noteChunk.deleteMany({
    where: { noteId },
  })

  // Create chunks
  const chunks = chunkContent(textContent, {
    maxChunkSize: 800,
    overlap: 100,
  })

  if (chunks.length === 0) {
    return { chunkCount: 0 }
  }

  // Generate embeddings in batch
  const embeddings = await generateEmbeddings(chunks.map(c => c.content))

  // Save chunks with embeddings
  await prisma.$transaction(
    chunks.map((chunk, index) =>
      prisma.noteChunk.create({
        data: {
          noteId,
          content: chunk.content,
          chunkIndex: index,
          startOffset: chunk.startOffset,
          endOffset: chunk.endOffset,
          tokenCount: embeddings[index].tokenCount,
          embedding: embeddings[index].embedding,
          embeddingModel: EMBEDDING_MODEL,
        },
      })
    )
  )

  // Update note status
  await prisma.note.update({
    where: { id: noteId },
    data: {
      processStatus: 'INDEXED',
    },
  })

  return { chunkCount: chunks.length }
}

// Cosine similarity between two vectors
function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

export interface SearchResult {
  noteId: string
  chunkId: string
  content: string
  score: number
  noteTitle: string | null
  noteType: string
}

// Semantic search across all notes
export async function semanticSearch(
  query: string,
  options: {
    limit?: number
    notebookId?: string
    threshold?: number
  } = {}
): Promise<SearchResult[]> {
  const { limit = 10, notebookId, threshold = 0.5 } = options

  // Generate query embedding
  const { embedding: queryEmbedding } = await generateEmbedding(query)

  // Get all chunks (with note info)
  const whereClause: any = {}
  if (notebookId) {
    whereClause.note = { notebookId }
  }

  const chunks = await prisma.noteChunk.findMany({
    where: whereClause,
    include: {
      note: {
        select: {
          id: true,
          title: true,
          type: true,
        },
      },
    },
  })

  // Calculate similarity scores
  const scoredChunks = chunks
    .map(chunk => ({
      noteId: chunk.noteId,
      chunkId: chunk.id,
      content: chunk.content,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
      noteTitle: chunk.note.title,
      noteType: chunk.note.type,
    }))
    .filter(c => c.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  return scoredChunks
}

// Get relevant context for a query (for RAG)
export async function getRelevantContext(
  query: string,
  options: {
    maxTokens?: number
    notebookId?: string
  } = {}
): Promise<{ context: string; sources: { noteId: string; title: string | null }[] }> {
  const { maxTokens = 3000, notebookId } = options

  const results = await semanticSearch(query, {
    limit: 20,
    notebookId,
    threshold: 0.4,
  })

  let context = ''
  let tokenCount = 0
  const sources: { noteId: string; title: string | null }[] = []
  const seenNotes = new Set<string>()

  for (const result of results) {
    // Rough token estimate (4 chars per token)
    const chunkTokens = Math.ceil(result.content.length / 4)

    if (tokenCount + chunkTokens > maxTokens) {
      break
    }

    context += `\n\n---\nSource: ${result.noteTitle || 'Untitled'}\n${result.content}`
    tokenCount += chunkTokens

    if (!seenNotes.has(result.noteId)) {
      sources.push({ noteId: result.noteId, title: result.noteTitle })
      seenNotes.add(result.noteId)
    }
  }

  return { context: context.trim(), sources }
}
