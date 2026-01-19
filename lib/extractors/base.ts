/**
 * Base interface and utilities for platform-specific content extractors
 */

import type { Platform, ExtractionResult, AuthorInfo, EngagementMetrics, MediaItem, MentionedLink } from '@/lib/types'

export const EXTRACTOR_VERSION = '1.0.0'

/**
 * Base interface that all platform extractors must implement
 */
export interface PlatformExtractor {
  /** Platform identifier */
  platform: Platform

  /** Version of this extractor */
  version: string

  /**
   * Check if this extractor can handle the given URL
   */
  canHandle(url: string): boolean

  /**
   * Extract content from the URL
   */
  extract(url: string): Promise<ExtractionResult>
}

/**
 * Helper to create a successful extraction result
 */
export function createSuccessResult(
  platform: Platform,
  data: Partial<Omit<ExtractionResult, 'platform' | 'success' | 'extractedAt' | 'extractorVersion'>>
): ExtractionResult {
  return {
    platform,
    success: true,
    extractedAt: new Date().toISOString(),
    extractorVersion: EXTRACTOR_VERSION,
    ...data,
  }
}

/**
 * Helper to create a failed extraction result
 */
export function createFailureResult(
  platform: Platform,
  error: string
): ExtractionResult {
  return {
    platform,
    success: false,
    extractedAt: new Date().toISOString(),
    extractorVersion: EXTRACTOR_VERSION,
    error,
  }
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
  try {
    const parsed = new URL(url)
    return parsed.hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

/**
 * Common URL patterns for platform detection
 */
export const PLATFORM_PATTERNS: Record<Platform, RegExp[]> = {
  twitter: [
    /^https?:\/\/(www\.)?(twitter\.com|x\.com)\//i,
    /^https?:\/\/(mobile\.)?(twitter\.com|x\.com)\//i,
  ],
  youtube: [
    /^https?:\/\/(www\.)?youtube\.com\//i,
    /^https?:\/\/youtu\.be\//i,
    /^https?:\/\/(www\.)?youtube\.com\/shorts\//i,
  ],
  linkedin: [
    /^https?:\/\/(www\.)?linkedin\.com\//i,
  ],
  reddit: [
    /^https?:\/\/(www\.|old\.|new\.)?reddit\.com\//i,
    /^https?:\/\/redd\.it\//i,
  ],
  medium: [
    /^https?:\/\/(www\.)?medium\.com\//i,
    /^https?:\/\/[a-z0-9-]+\.medium\.com\//i,
  ],
  substack: [
    /^https?:\/\/[a-z0-9-]+\.substack\.com\//i,
  ],
  github: [
    /^https?:\/\/(www\.)?github\.com\//i,
    /^https?:\/\/gist\.github\.com\//i,
  ],
  news: [], // Detected via domain list, not pattern
  generic: [], // Fallback, handles everything
}

/**
 * Detect platform from URL
 */
export function detectPlatform(url: string): Platform {
  for (const [platform, patterns] of Object.entries(PLATFORM_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(url)) {
        return platform as Platform
      }
    }
  }
  return 'generic'
}

/**
 * Parse engagement numbers that may be formatted (e.g., "1.2K", "5M")
 */
export function parseEngagementNumber(value: string | number | undefined): number | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value === 'number') return value

  const str = String(value).trim().toUpperCase()
  const match = str.match(/^([\d.]+)\s*([KMB])?$/)
  if (!match) return undefined

  const num = parseFloat(match[1])
  const suffix = match[2]

  switch (suffix) {
    case 'K':
      return Math.round(num * 1000)
    case 'M':
      return Math.round(num * 1000000)
    case 'B':
      return Math.round(num * 1000000000)
    default:
      return Math.round(num)
  }
}

/**
 * Clean and normalize text content
 */
export function cleanText(text: string | undefined | null): string {
  if (!text) return ''
  return text
    .replace(/\s+/g, ' ')
    .replace(/[\r\n]+/g, '\n')
    .trim()
}

/**
 * Generate excerpt from content
 */
export function generateExcerpt(content: string, maxLength: number = 200): string {
  const clean = cleanText(content)
  if (clean.length <= maxLength) return clean

  // Find a good break point
  const truncated = clean.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')

  if (lastSpace > maxLength * 0.7) {
    return truncated.slice(0, lastSpace) + '...'
  }

  return truncated + '...'
}

/**
 * Extract all URLs from text content
 */
export function extractUrls(text: string): MentionedLink[] {
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi
  const matches = text.match(urlRegex) || []

  return matches.map(url => ({
    url,
    domain: extractDomain(url),
  }))
}

/**
 * Normalize author handle (remove @ prefix if present)
 */
export function normalizeHandle(handle: string | undefined): string | undefined {
  if (!handle) return undefined
  return handle.replace(/^@/, '')
}

/**
 * Common user agent for requests
 */
export const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

/**
 * Fetch with timeout and common headers
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 30000
): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        ...options.headers,
      },
    })
    return response
  } finally {
    clearTimeout(timeout)
  }
}
