/**
 * Platform Extractors Module
 *
 * Exports the main router and all extractors for content enrichment.
 */

export { extractFromUrl, findExtractor, getPlatformForUrl, isKnownPlatform } from './router'
export { detectPlatform, EXTRACTOR_VERSION } from './base'
export type { PlatformExtractor } from './base'

// Individual extractors (for testing or direct use)
export { twitterExtractor } from './twitter'
export { youtubeExtractor } from './youtube'
export { redditExtractor } from './reddit'
export { linkedinExtractor } from './linkedin'
export { mediumExtractor, substackExtractor } from './medium'
export { githubExtractor } from './github'
export { podcastExtractor } from './podcast'
export { genericExtractor } from './generic'
