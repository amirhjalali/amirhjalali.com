import { prisma } from '@/lib/prisma'
import type { Note, NoteType, NoteMetadata } from '@/lib/types'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Main orchestrator: Process a note with AI capabilities
 */
export async function processNote(noteId: string): Promise<Note> {
  console.log(`🔄 Starting processing for note ${noteId}`)

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
      data: { processStatus: 'PROCESSING' },
    })

    // Process based on note type
    let metadata: NoteMetadata | null = null
    let summary: string | null = null
    let keyInsights: string[] = []
    let topics: string[] = []
    let sentiment: string | null = null
    let excerpt: string | null = null

    try {
      // Extract URL metadata for LINK type
      if (note.type === 'LINK') {
        console.log(`📎 Extracting metadata for URL: ${note.content}`)
        metadata = await extractUrlMetadata(note.content)
      }

      // Generate summary and insights
      console.log(`🤖 Generating AI summary and insights`)
      const aiResults = await generateSummaryAndInsights(note.content, note.type)
      summary = aiResults.summary
      excerpt = aiResults.excerpt
      keyInsights = aiResults.keyInsights

      // Extract topics
      console.log(`🏷️  Extracting topics`)
      topics = await extractTopics(note.content)

      // Analyze sentiment
      console.log(`😊 Analyzing sentiment`)
      sentiment = await analyzeSentiment(note.content)

      // Update note with all processing results
      const updatedNote = await prisma.note.update({
        where: { id: noteId },
        data: {
          processStatus: 'COMPLETED',
          processedAt: new Date(),
          metadata: metadata as any,
          summary,
          excerpt,
          keyInsights,
          topics,
          sentiment,
        },
      })

      console.log(`✅ Note ${noteId} processed successfully`)

      return updatedNote as unknown as Note
    } catch (processingError) {
      // Partial success: update what we have and mark as completed
      console.warn(
        `⚠️  Partial processing failure for note ${noteId}:`,
        processingError
      )

      const updatedNote = await prisma.note.update({
        where: { id: noteId },
        data: {
          processStatus: 'COMPLETED',
          processedAt: new Date(),
          metadata: metadata as any,
          summary,
          excerpt: excerpt || undefined,
          keyInsights,
          topics,
          sentiment: sentiment || undefined,
        },
      })

      return updatedNote as unknown as Note
    }
  } catch (error) {
    console.error(`❌ Failed to process note ${noteId}:`, error)

    // Mark as failed
    await prisma.note.update({
      where: { id: noteId },
      data: {
        processStatus: 'FAILED',
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
