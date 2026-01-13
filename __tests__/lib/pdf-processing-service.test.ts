/**
 * Unit tests for pdf-processing-service.ts
 */

// Mock pdf-parse before importing the service
jest.mock('pdf-parse', () => {
  const mockPdfParse = jest.fn()
  // Handle both ESM and CommonJS by returning object with default
  return Object.assign(mockPdfParse, { default: mockPdfParse })
})

// Mock crypto module
jest.mock('crypto', () => ({
  createHash: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue('mockhash123'),
  })),
}))

import {
  extractPdfFromUrl,
  extractPdfFromBuffer,
  isPdfUrl,
  generatePdfExcerpt,
} from '@/lib/pdf-processing-service'

// Get the mocked pdf-parse
const mockPdfParse = require('pdf-parse')

describe('pdf-processing-service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset fetch mock
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('extractPdfFromBuffer', () => {
    it('should extract text and metadata from a valid PDF buffer', async () => {
      const mockPdfData = {
        text: 'This is the extracted PDF content.\n\nWith multiple paragraphs.',
        numpages: 5,
        info: {
          Title: 'Test PDF Document',
          Author: 'Test Author',
          Subject: 'Testing',
          Keywords: 'test, pdf, processing',
        },
      }

      mockPdfParse.mockResolvedValue(mockPdfData)

      const buffer = Buffer.from('fake pdf content')
      const result = await extractPdfFromBuffer(buffer)

      expect(mockPdfParse).toHaveBeenCalledWith(buffer)
      expect(result.textContent).toContain('This is the extracted PDF content')
      expect(result.title).toBe('Test PDF Document')
      expect(result.author).toBe('Test Author')
      expect(result.subject).toBe('Testing')
      expect(result.keywords).toEqual(['test', 'pdf', 'processing'])
      expect(result.pageCount).toBe(5)
      expect(result.sourceType).toBe('pdf')
      expect(result.contentHash).toBe('mockhash123')
    })

    it('should extract title from first line when metadata title is missing', async () => {
      const mockPdfData = {
        text: 'Document Title From Content\n\nThis is the body content.',
        numpages: 1,
        info: {}, // No title in metadata
      }

      mockPdfParse.mockResolvedValue(mockPdfData)

      const buffer = Buffer.from('fake pdf content')
      const result = await extractPdfFromBuffer(buffer)

      expect(result.title).toBe('Document Title From Content')
    })

    it('should calculate word count correctly', async () => {
      const mockPdfData = {
        text: 'One two three four five six seven eight nine ten',
        numpages: 1,
        info: {},
      }

      mockPdfParse.mockResolvedValue(mockPdfData)

      const buffer = Buffer.from('fake pdf content')
      const result = await extractPdfFromBuffer(buffer)

      expect(result.wordCount).toBe(10)
    })

    it('should calculate reading time based on 200 WPM', async () => {
      // 400 words should take 2 minutes
      const words = Array(400).fill('word').join(' ')
      const mockPdfData = {
        text: words,
        numpages: 2,
        info: {},
      }

      mockPdfParse.mockResolvedValue(mockPdfData)

      const buffer = Buffer.from('fake pdf content')
      const result = await extractPdfFromBuffer(buffer)

      expect(result.readingTime).toBe(2)
    })

    it('should parse keywords separated by commas', async () => {
      const mockPdfData = {
        text: 'Content',
        numpages: 1,
        info: {
          Keywords: 'keyword1, keyword2, keyword3',
        },
      }

      mockPdfParse.mockResolvedValue(mockPdfData)

      const buffer = Buffer.from('fake pdf content')
      const result = await extractPdfFromBuffer(buffer)

      expect(result.keywords).toEqual(['keyword1', 'keyword2', 'keyword3'])
    })

    it('should parse keywords separated by semicolons', async () => {
      const mockPdfData = {
        text: 'Content',
        numpages: 1,
        info: {
          Keywords: 'keyword1; keyword2; keyword3',
        },
      }

      mockPdfParse.mockResolvedValue(mockPdfData)

      const buffer = Buffer.from('fake pdf content')
      const result = await extractPdfFromBuffer(buffer)

      expect(result.keywords).toEqual(['keyword1', 'keyword2', 'keyword3'])
    })

    it('should throw error when pdf-parse fails', async () => {
      mockPdfParse.mockRejectedValue(new Error('Invalid PDF format'))

      const buffer = Buffer.from('not a pdf')

      await expect(extractPdfFromBuffer(buffer)).rejects.toThrow('Invalid PDF format')
    })

    it('should handle empty text content', async () => {
      const mockPdfData = {
        text: '',
        numpages: 0,
        info: {},
      }

      mockPdfParse.mockResolvedValue(mockPdfData)

      const buffer = Buffer.from('fake pdf content')
      const result = await extractPdfFromBuffer(buffer)

      expect(result.textContent).toBe('')
      expect(result.wordCount).toBe(0)
      expect(result.readingTime).toBe(0)
    })

    it('should clean PDF text by removing page numbers', async () => {
      const mockPdfData = {
        text: 'Content on page one\n\n123\n\nContent on page two\n\nPage 2 of 10\n\nMore content',
        numpages: 10,
        info: {},
      }

      mockPdfParse.mockResolvedValue(mockPdfData)

      const buffer = Buffer.from('fake pdf content')
      const result = await extractPdfFromBuffer(buffer)

      // Standalone page numbers and "Page X of Y" patterns should be removed
      expect(result.textContent).not.toMatch(/^\s*123\s*$/m)
      expect(result.textContent).not.toMatch(/Page 2 of 10/i)
    })

    it('should fix hyphenated words at line breaks', async () => {
      const mockPdfData = {
        text: 'This is a hyphen-\nated word in the document',
        numpages: 1,
        info: {},
      }

      mockPdfParse.mockResolvedValue(mockPdfData)

      const buffer = Buffer.from('fake pdf content')
      const result = await extractPdfFromBuffer(buffer)

      expect(result.textContent).toContain('hyphenated')
    })
  })

  describe('extractPdfFromUrl', () => {
    it('should download and extract PDF from valid URL', async () => {
      const mockPdfData = {
        text: 'PDF content from URL',
        numpages: 1,
        info: { Title: 'URL PDF' },
      }

      mockPdfParse.mockResolvedValue(mockPdfData)

      const mockArrayBuffer = new ArrayBuffer(8)
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: {
          get: (name: string) => (name === 'content-type' ? 'application/pdf' : null),
        },
        arrayBuffer: () => Promise.resolve(mockArrayBuffer),
      })

      const result = await extractPdfFromUrl('https://example.com/document.pdf')

      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com/document.pdf',
        expect.objectContaining({
          headers: expect.objectContaining({
            Accept: 'application/pdf',
          }),
        })
      )
      expect(result.textContent).toBe('PDF content from URL')
      expect(result.title).toBe('URL PDF')
    })

    it('should throw error for non-OK HTTP response', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      })

      await expect(extractPdfFromUrl('https://example.com/missing.pdf')).rejects.toThrow(
        'Failed to download PDF: 404 Not Found'
      )
    })

    it('should throw error for non-PDF content type', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: {
          get: (name: string) => (name === 'content-type' ? 'text/html' : null),
        },
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      })

      await expect(extractPdfFromUrl('https://example.com/page.html')).rejects.toThrow(
        'Not a PDF file: text/html'
      )
    })

    it('should throw error when fetch fails', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      await expect(extractPdfFromUrl('https://example.com/document.pdf')).rejects.toThrow(
        'Network error'
      )
    })

    it('should handle missing content-type header', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: {
          get: () => null, // No content-type header
        },
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      })

      await expect(extractPdfFromUrl('https://example.com/document.pdf')).rejects.toThrow(
        'Not a PDF file'
      )
    })

    it('should accept application/pdf content type', async () => {
      const mockPdfData = {
        text: 'Content',
        numpages: 1,
        info: {},
      }

      mockPdfParse.mockResolvedValue(mockPdfData)

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: {
          get: (name: string) =>
            name === 'content-type' ? 'application/pdf; charset=utf-8' : null,
        },
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
      })

      const result = await extractPdfFromUrl('https://example.com/document.pdf')

      expect(result.sourceType).toBe('pdf')
    })
  })

  describe('isPdfUrl', () => {
    it('should return true for URL ending with .pdf', () => {
      expect(isPdfUrl('https://example.com/document.pdf')).toBe(true)
    })

    it('should return true for URL with .PDF extension (case insensitive)', () => {
      expect(isPdfUrl('https://example.com/DOCUMENT.PDF')).toBe(true)
    })

    it('should return true for URL with type=pdf query parameter', () => {
      expect(isPdfUrl('https://example.com/doc?type=pdf')).toBe(true)
    })

    it('should return true for URL with TYPE=PDF query parameter (case insensitive)', () => {
      expect(isPdfUrl('https://example.com/doc?TYPE=PDF')).toBe(true)
    })

    it('should return false for non-PDF URLs', () => {
      expect(isPdfUrl('https://example.com/page.html')).toBe(false)
      expect(isPdfUrl('https://example.com/image.jpg')).toBe(false)
      expect(isPdfUrl('https://example.com/document')).toBe(false)
    })

    it('should return false for invalid URLs', () => {
      expect(isPdfUrl('not-a-url')).toBe(false)
      expect(isPdfUrl('')).toBe(false)
    })

    it('should handle URLs with query parameters after .pdf', () => {
      expect(isPdfUrl('https://example.com/doc.pdf?version=2')).toBe(true)
    })
  })

  describe('generatePdfExcerpt', () => {
    it('should return full content if shorter than maxLength', () => {
      const content = 'Short content.'
      const result = generatePdfExcerpt(content, 100)

      expect(result).toBe('Short content.')
    })

    it('should truncate at sentence boundary when possible', () => {
      const content =
        'First sentence. Second sentence. Third sentence that is longer and will be cut off.'
      const result = generatePdfExcerpt(content, 50)

      expect(result).toBe('First sentence. Second sentence.')
    })

    it('should truncate at word boundary with ellipsis when no sentence boundary', () => {
      const content = 'This is a long sentence without any periods that needs to be truncated somewhere'
      const result = generatePdfExcerpt(content, 40)

      expect(result).toMatch(/\.\.\.$/)
      expect(result.length).toBeLessThanOrEqual(43) // 40 + "..."
    })

    it('should handle question marks as sentence boundaries', () => {
      // Use content where question mark is the last sentence boundary within maxLength
      const content = 'Is this a question? More text follows that exceeds the limit.'
      const result = generatePdfExcerpt(content, 25)

      expect(result).toBe('Is this a question?')
    })

    it('should handle exclamation marks as sentence boundaries', () => {
      const content = 'This is exciting! More content follows. Even more content here.'
      const result = generatePdfExcerpt(content, 30)

      expect(result).toBe('This is exciting!')
    })

    it('should normalize whitespace in content', () => {
      const content = 'Content   with    excessive\n\n\nwhitespace   throughout.'
      const result = generatePdfExcerpt(content, 100)

      expect(result).toBe('Content with excessive whitespace throughout.')
    })

    it('should use default maxLength of 250', () => {
      const longContent = 'a '.repeat(200) // 400 characters
      const result = generatePdfExcerpt(longContent)

      expect(result.length).toBeLessThanOrEqual(253) // 250 + "..."
    })

    it('should handle empty string', () => {
      const result = generatePdfExcerpt('')

      expect(result).toBe('')
    })

    it('should handle whitespace-only string', () => {
      const result = generatePdfExcerpt('   \n\n   ')

      expect(result).toBe('')
    })
  })
})
