/**
 * Platform Router
 *
 * Detects the platform from a URL and dispatches to the correct extractor.
 * Falls back to generic extractor for unknown platforms.
 */

import type { Platform, ExtractionResult } from '@/lib/types'
import { PlatformExtractor, detectPlatform } from './base'
import { twitterExtractor } from './twitter'
import { youtubeExtractor } from './youtube'
import { redditExtractor } from './reddit'
import { linkedinExtractor } from './linkedin'
import { mediumExtractor, substackExtractor } from './medium'
import { githubExtractor } from './github'
import { genericExtractor } from './generic'

// Registry of all platform extractors
const extractors: PlatformExtractor[] = [
  twitterExtractor,
  youtubeExtractor,
  redditExtractor,
  linkedinExtractor,
  mediumExtractor,
  substackExtractor,
  githubExtractor,
  genericExtractor, // Must be last as fallback
]

/**
 * Find the appropriate extractor for a URL
 */
export function findExtractor(url: string): PlatformExtractor {
  for (const extractor of extractors) {
    if (extractor.canHandle(url)) {
      return extractor
    }
  }
  // Should never reach here since genericExtractor handles everything
  return genericExtractor
}

/**
 * Extract content from a URL using the appropriate platform extractor
 */
export async function extractFromUrl(url: string): Promise<ExtractionResult> {
  const extractor = findExtractor(url)

  console.log(`[Extractor] Using ${extractor.platform} extractor for: ${url}`)

  try {
    const result = await extractor.extract(url)

    if (result.success) {
      console.log(`[Extractor] Successfully extracted from ${extractor.platform}:`, {
        title: result.title?.slice(0, 50),
        hasAuthor: !!result.author,
        hasMedia: (result.mediaItems?.length || 0) > 0,
        contentLength: result.content?.length || 0,
      })
    } else {
      console.warn(`[Extractor] Failed to extract from ${extractor.platform}:`, result.error)
    }

    return result
  } catch (error) {
    console.error(`[Extractor] Unexpected error in ${extractor.platform}:`, error)
    return {
      platform: extractor.platform,
      success: false,
      extractedAt: new Date().toISOString(),
      extractorVersion: extractor.version,
      error: String(error),
    }
  }
}

/**
 * Get platform type for a URL (for display purposes)
 */
export function getPlatformForUrl(url: string): Platform {
  const extractor = findExtractor(url)
  return extractor.platform
}

/**
 * Check if a URL is from a known platform (not generic)
 */
export function isKnownPlatform(url: string): boolean {
  const platform = getPlatformForUrl(url)
  return platform !== 'generic'
}

// Re-export types and utilities
export { detectPlatform } from './base'
export type { PlatformExtractor } from './base'
