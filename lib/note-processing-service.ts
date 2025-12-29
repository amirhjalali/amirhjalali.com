import { prisma } from './db'
import type { Note, NoteType, NoteMetadata } from '@/lib/types'
import OpenAI from 'openai'
import { extractContentFromUrl, extractVideoInfo, chunkContent, cleanText, type ExtractedContent } from './content-extraction'
import { indexNote as createEmbeddings } from './embedding-service'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Main orchestrator: Process a note with AI capabilities
 * Now with improved content extraction and optional indexing for semantic search
 */
export async function processNote(
  noteId: string,
  options: { skipIndexing?: boolean } = {}
): Promise<Note> {
  const { skipIndexing = false } = options

  try {
    // Fetch note from database
    const note = await prisma.note.findUnique({
      where: { id: noteId },
    })

    if (!note) {
      throw new Error(`Note ${noteId} not found`)
    }

    // Update status to PROCESSING
    await prisma.note.update({
      where: { id: noteId },
      data: { processStatus: 'PROCESSING', processingError: null },
    })

    // Process based on note type
    let extractedContent: ExtractedContent | null = null
    let metadata: NoteMetadata | null = null
    let summary: string | null = null
    let keyInsights: string[] = []
    let topics: string[] = []
    let sentiment: string | null = null
    let excerpt: string | null = null
    let fullContent: string | null = null
    let wordCount: number | null = null
    let readingTime: number | null = null
    let domain: string | null = null
    let favicon: string | null = null
    let sourceType: string | null = null
    let contentHash: string | null = null

    try {
      // Extract content for LINK type using improved extraction
      if (note.type === 'LINK') {
        extractedContent = await extractContentFromUrl(note.content)

        // Check for video content
        const videoInfo = extractVideoInfo(note.content)

        if (extractedContent) {
          fullContent = extractedContent.textContent
          wordCount = extractedContent.wordCount
          readingTime = extractedContent.readingTime
          domain = extractedContent.domain
          favicon = extractedContent.favicon
          sourceType = extractedContent.sourceType
          contentHash = extractedContent.contentHash

          // Build metadata from extracted content
          metadata = {
            domain: extractedContent.domain,
            title: extractedContent.title || undefined,
            description: extractedContent.excerpt || undefined,
            image: extractedContent.ogImage || undefined,
            favicon: extractedContent.favicon || undefined,
            siteName: extractedContent.siteName || undefined,
            author: extractedContent.byline || undefined,
            publishedTime: extractedContent.publishedTime || undefined,
            wordCount: extractedContent.wordCount,
            ...extractedContent.metadata,
          }

          // Use extracted title if note doesn't have one
          if (!note.title && extractedContent.title) {
            await prisma.note.update({
              where: { id: noteId },
              data: { title: extractedContent.title },
            })
          }
        }

        // Add video info to metadata if applicable
        if (videoInfo) {
          metadata = {
            ...metadata,
            video: videoInfo as any,
          }
        }
      } else if (note.type === 'TEXT') {
        // For text notes, the content is already the full content
        fullContent = note.content
        wordCount = note.content.split(/\s+/).filter(w => w.length > 0).length
        readingTime = Math.max(1, Math.ceil(wordCount / 200))
      }

      // Use full extracted content for AI analysis when available
      const contentForAnalysis = fullContent || note.content

      // Generate summary and insights
      const aiResults = await generateSummaryAndInsights(contentForAnalysis, note.type)
      summary = aiResults.summary
      excerpt = aiResults.excerpt
      keyInsights = aiResults.keyInsights

      // Extract topics
      topics = await extractTopics(contentForAnalysis)

      // Analyze sentiment
      sentiment = await analyzeSentiment(contentForAnalysis)

      // Update note with all processing results
      const updatedNote = await prisma.note.update({
        where: { id: noteId },
        data: {
          processStatus: 'COMPLETED',
          processedAt: new Date(),
          processingError: null,
          metadata: metadata as any,
          summary,
          excerpt,
          keyInsights,
          topics,
          sentiment,
          fullContent,
          wordCount,
          readingTime,
          domain,
          favicon,
          sourceType,
          contentHash,
        },
      })

      // Index for semantic search (create chunks and embeddings)
      if (!skipIndexing && fullContent && fullContent.length > 100) {
        try {
          await createEmbeddings(noteId)
        } catch (indexError) {
          // Don't fail the whole process if indexing fails
          console.warn(`Indexing failed for note ${noteId}:`, indexError)
        }
      }

      return updatedNote as unknown as Note
    } catch (processingError: any) {
      // Partial success: update what we have and mark as completed
      console.warn(`Partial processing failure for note ${noteId}:`, processingError)

      const updatedNote = await prisma.note.update({
        where: { id: noteId },
        data: {
          processStatus: 'COMPLETED',
          processedAt: new Date(),
          processingError: processingError.message || 'Unknown error',
          metadata: metadata as any,
          summary,
          excerpt: excerpt || undefined,
          keyInsights,
          topics,
          sentiment: sentiment || undefined,
          fullContent,
          wordCount,
          readingTime,
        },
      })

      return updatedNote as unknown as Note
    }
  } catch (error: any) {
    console.error(`Failed to process note ${noteId}:`, error)

    // Mark as failed with error message
    await prisma.note.update({
      where: { id: noteId },
      data: {
        processStatus: 'FAILED',
        processingError: error.message || 'Unknown error',
      },
    })

    throw error
  }
}

/**
 * Extract URL metadata using web scraping
 */
export async function extractUrlMetadata(url: string): Promise<NoteMetadata> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; NoteBot/1.0; +https://amirhjalali.com)',
      },
    })

    clearTimeout(timeout)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()

    // Extract Open Graph tags and meta tags
    const metadata: NoteMetadata = {
      domain: new URL(url).hostname,
    }

    // Extract og:title
    const ogTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i)
    if (ogTitle) metadata.title = ogTitle[1]

    // Extract og:description
    const ogDesc = html.match(
      /<meta\s+property="og:description"\s+content="([^"]+)"/i
    )
    if (ogDesc) metadata.description = ogDesc[1]

    // Extract og:image
    const ogImage = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i)
    if (ogImage) metadata.image = ogImage[1]

    // Fallback to regular meta tags
    if (!metadata.title) {
      const title = html.match(/<title>([^<]+)<\/title>/i)
      if (title) metadata.title = title[1]
    }

    if (!metadata.description) {
      const desc = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)
      if (desc) metadata.description = desc[1]
    }

    // Extract favicon
    const favicon = html.match(/<link\s+rel="icon"\s+href="([^"]+)"/i)
    if (favicon) {
      metadata.favicon = new URL(favicon[1], url).href
    }

    return metadata
  } catch (error: any) {
    console.error(`Failed to extract metadata from ${url}:`, error.message)

    return {
      domain: new URL(url).hostname,
      error: error.message,
    }
  }
}

/**
 * Generate summary and insights using OpenAI
 */
export async function generateSummaryAndInsights(
  content: string,
  type: NoteType
): Promise<{
  summary: string
  excerpt: string
  keyInsights: string[]
}> {
  try {
    const systemPrompt = `You are an AI assistant that helps analyze and summarize content.
You will be given ${type === 'LINK' ? 'a URL or link' : type === 'TEXT' ? 'text content' : 'content'} and need to:
1. Generate a concise excerpt (2-3 sentences)
2. Generate a detailed summary (1-2 paragraphs)
3. Extract 3-5 key insights as bullet points

Return the response in JSON format with keys: excerpt, summary, keyInsights (array of strings)`

    const userPrompt = `Analyze this ${type.toLowerCase()} content:\n\n${content.substring(0, 2000)}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 500,
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')

    return {
      excerpt: result.excerpt || '',
      summary: result.summary || '',
      keyInsights: result.keyInsights || [],
    }
  } catch (error) {
    console.error('Failed to generate summary:', error)
    throw error
  }
}

/**
 * Extract topics using OpenAI
 */
export async function extractTopics(content: string): Promise<string[]> {
  try {
    const systemPrompt = `You are an AI that extracts relevant topics from content.
Extract 3-10 topics as single words or short phrases (1-3 words).
Return topics in JSON format with key: topics (array of strings, lowercase)`

    const userPrompt = `Extract topics from this content:\n\n${content.substring(0, 2000)}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5,
      max_tokens: 200,
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')

    return (result.topics || [])
      .map((topic: string) => topic.toLowerCase().trim())
      .slice(0, 10) // Max 10 topics
  } catch (error) {
    console.error('Failed to extract topics:', error)
    return []
  }
}

/**
 * Analyze sentiment using OpenAI
 */
export async function analyzeSentiment(content: string): Promise<string> {
  try {
    const systemPrompt = `You are an AI that analyzes the sentiment of content.
Classify the sentiment as one of: positive, negative, neutral, mixed.
Return in JSON format with key: sentiment`

    const userPrompt = `Analyze the sentiment of this content:\n\n${content.substring(0, 1000)}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 50,
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')

    return result.sentiment || 'neutral'
  } catch (error) {
    console.error('Failed to analyze sentiment:', error)
    return 'neutral'
  }
}

/**
 * Download and optimize media (placeholder for future implementation)
 */
export async function processMedia(url: string): Promise<string> {
  // TODO: Implement media download and optimization
  // For now, just return the original URL
  return url
}
