/**
 * PDF Processing Service
 * Extracts text and metadata from PDF files
 */

import pdf from 'pdf-parse'

export interface PdfExtractionResult {
  textContent: string
  title?: string
  author?: string
  subject?: string
  keywords?: string[]
  pageCount: number
  wordCount: number
  readingTime: number
  sourceType: 'pdf'
  contentHash: string
}

/**
 * Extract content from a PDF URL
 */
export async function extractPdfFromUrl(url: string): Promise<PdfExtractionResult> {
  try {
    // Download the PDF
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NotesBot/1.0)',
        Accept: 'application/pdf',
      },
      signal: AbortSignal.timeout(60000), // 60 second timeout for large PDFs
    })

    if (!response.ok) {
      throw new Error(`Failed to download PDF: ${response.status} ${response.statusText}`)
    }

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('pdf')) {
      throw new Error(`Not a PDF file: ${contentType}`)
    }

    const buffer = Buffer.from(await response.arrayBuffer())
    return await extractPdfFromBuffer(buffer)
  } catch (error: any) {
    console.error(`Failed to extract PDF from URL ${url}:`, error.message)
    throw error
  }
}

/**
 * Extract content from a PDF buffer
 */
export async function extractPdfFromBuffer(buffer: Buffer): Promise<PdfExtractionResult> {
  try {
    const data = await pdf(buffer)

    // Extract text content
    const textContent = cleanPdfText(data.text)

    // Calculate word count and reading time
    const wordCount = countWords(textContent)
    const readingTime = Math.ceil(wordCount / 200) // Assume 200 WPM

    // Generate content hash for deduplication
    const crypto = await import('crypto')
    const contentHash = crypto.createHash('md5').update(textContent).digest('hex')

    // Extract metadata
    const metadata = data.info || {}

    // Parse keywords if present
    let keywords: string[] | undefined
    if (metadata.Keywords) {
      keywords = metadata.Keywords.split(/[,;]/).map((k: string) => k.trim()).filter(Boolean)
    }

    return {
      textContent,
      title: metadata.Title || extractTitleFromText(textContent),
      author: metadata.Author,
      subject: metadata.Subject,
      keywords,
      pageCount: data.numpages,
      wordCount,
      readingTime,
      sourceType: 'pdf',
      contentHash,
    }
  } catch (error: any) {
    console.error('Failed to parse PDF:', error.message)
    throw error
  }
}

/**
 * Clean extracted PDF text
 */
function cleanPdfText(text: string): string {
  return text
    // Normalize whitespace
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove excessive newlines
    .replace(/\n{3,}/g, '\n\n')
    // Remove page numbers and headers/footers (common patterns)
    .replace(/^\s*\d+\s*$/gm, '') // Standalone numbers (page numbers)
    .replace(/^\s*Page \d+ of \d+\s*$/gmi, '')
    // Fix hyphenated words at line breaks
    .replace(/(\w)-\n(\w)/g, '$1$2')
    // Normalize spaces
    .replace(/[ \t]+/g, ' ')
    // Trim lines
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .trim()
}

/**
 * Count words in text
 */
function countWords(text: string): number {
  return text
    .split(/\s+/)
    .filter(word => word.length > 0)
    .length
}

/**
 * Try to extract title from first lines of text
 */
function extractTitleFromText(text: string): string | undefined {
  const lines = text.split('\n').filter(line => line.trim().length > 0)

  if (lines.length === 0) return undefined

  // First non-empty line is often the title
  const firstLine = lines[0].trim()

  // If it's reasonable length for a title
  if (firstLine.length > 5 && firstLine.length < 200) {
    // Remove common artifacts
    return firstLine
      .replace(/^(title|abstract|introduction)[:\s]*/i, '')
      .trim()
  }

  return undefined
}

/**
 * Check if a URL points to a PDF
 */
export function isPdfUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    const path = urlObj.pathname.toLowerCase()

    // Check file extension
    if (path.endsWith('.pdf')) return true

    // Check query parameters (some PDFs are served with ?type=pdf)
    const type = urlObj.searchParams.get('type')
    if (type?.toLowerCase() === 'pdf') return true

    return false
  } catch {
    return false
  }
}

/**
 * Generate excerpt from PDF content
 */
export function generatePdfExcerpt(textContent: string, maxLength: number = 250): string {
  // Remove excessive whitespace
  const cleaned = textContent.replace(/\s+/g, ' ').trim()

  if (cleaned.length <= maxLength) {
    return cleaned
  }

  // Try to cut at a sentence boundary
  const truncated = cleaned.substring(0, maxLength)
  const lastPeriod = truncated.lastIndexOf('.')
  const lastQuestion = truncated.lastIndexOf('?')
  const lastExclamation = truncated.lastIndexOf('!')

  const lastSentence = Math.max(lastPeriod, lastQuestion, lastExclamation)

  if (lastSentence > maxLength * 0.5) {
    return truncated.substring(0, lastSentence + 1)
  }

  // Otherwise cut at word boundary
  const lastSpace = truncated.lastIndexOf(' ')
  if (lastSpace > maxLength * 0.7) {
    return truncated.substring(0, lastSpace) + '...'
  }

  return truncated + '...'
}
