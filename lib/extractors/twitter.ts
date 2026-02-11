/**
 * Twitter/X Platform Extractor
 *
 * Uses multiple strategies:
 * 1. FXTwitter API (reliable third-party JSON API)
 * 2. Twitter Syndication API (tweet data without auth)
 * 3. Twitter oEmbed API (reliable but limited)
 * 4. Page scraping with OG tags (fallback)
 */

import type { ExtractionResult, AuthorInfo, MediaItem } from '@/lib/types'
import {
  PlatformExtractor,
  EXTRACTOR_VERSION,
  createSuccessResult,
  createFailureResult,
  cleanText,
  generateExcerpt,
  extractUrls,
  normalizeHandle,
  fetchWithTimeout,
} from './base'

// Known Twitter/X error messages that indicate extraction failed
const ERROR_PATTERNS = [
  'Something went wrong',
  'don\'t fret',
  'give it another shot',
  'privacy related extensions',
  'This page isn\'t available',
  'Hmm...this page doesn\'t exist',
  'Rate limit exceeded',
  'Account suspended',
  'This Tweet is unavailable',
  'This Post is unavailable',
]

export class TwitterExtractor implements PlatformExtractor {
  platform = 'twitter' as const
  version = EXTRACTOR_VERSION

  canHandle(url: string): boolean {
    return /^https?:\/\/(www\.)?(twitter\.com|x\.com)\//i.test(url) ||
           /^https?:\/\/(mobile\.)?(twitter\.com|x\.com)\//i.test(url)
  }

  /**
   * Check if content appears to be an error page
   */
  private isErrorContent(content: string): boolean {
    if (!content) return true
    const lowerContent = content.toLowerCase()
    return ERROR_PATTERNS.some(pattern => lowerContent.includes(pattern.toLowerCase()))
  }

  async extract(url: string): Promise<ExtractionResult> {
    const tweetId = this.extractTweetId(url)
    if (!tweetId) {
      return createFailureResult('twitter', 'Could not extract tweet ID from URL')
    }

    // Try FXTwitter API first (most reliable)
    try {
      const fxResult = await this.extractViaFXTwitter(tweetId)
      if (fxResult.success && !this.isErrorContent(fxResult.content || '')) {
        return fxResult
      }
    } catch (e) {
      console.warn('[Twitter] FXTwitter API failed:', e)
    }

    // Try syndication API second
    try {
      const syndicationResult = await this.extractViaSyndication(tweetId)
      if (syndicationResult.success && !this.isErrorContent(syndicationResult.content || '')) {
        return syndicationResult
      }
    } catch (e) {
      console.warn('[Twitter] Syndication API failed:', e)
    }

    // Try oEmbed API third
    try {
      const oEmbedResult = await this.extractViaOEmbed(url)
      if (oEmbedResult.success && !this.isErrorContent(oEmbedResult.content || '')) {
        return oEmbedResult
      }
    } catch (e) {
      console.warn('[Twitter] oEmbed API failed:', e)
    }

    // Fall back to page scraping
    try {
      const scrapedResult = await this.extractViaPageScraping(url)
      // Check if we got an error page
      if (this.isErrorContent(scrapedResult.content || '')) {
        return createFailureResult('twitter', 'All extraction methods failed - Twitter may be blocking access')
      }
      return scrapedResult
    } catch (e) {
      return createFailureResult('twitter', `All extraction methods failed: ${e}`)
    }
  }

  private extractTweetId(url: string): string | null {
    // Match patterns like:
    // https://twitter.com/user/status/123456789
    // https://x.com/user/status/123456789
    const match = url.match(/\/status\/(\d+)/i)
    return match ? match[1] : null
  }

  private extractUsername(url: string): string | null {
    // Match patterns like:
    // https://twitter.com/username/status/123456789
    // https://x.com/username/status/123456789
    const match = url.match(/(?:twitter\.com|x\.com)\/([^\/]+)\/status/i)
    return match ? match[1] : null
  }

  /**
   * Extract via FXTwitter API
   * Third-party service that provides JSON API for tweets
   * More reliable than Twitter's own APIs which are increasingly restricted
   */
  private async extractViaFXTwitter(tweetId: string): Promise<ExtractionResult> {
    // FXTwitter provides an API at api.fxtwitter.com
    const apiUrl = `https://api.fxtwitter.com/status/${tweetId}`

    const response = await fetchWithTimeout(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; NotesBot/1.0)',
      },
    })

    if (!response.ok) {
      throw new Error(`FXTwitter API returned ${response.status}`)
    }

    const data = await response.json()

    if (!data || !data.tweet) {
      throw new Error('Invalid FXTwitter response')
    }

    const tweet = data.tweet

    // Extract author info
    const author: AuthorInfo = {
      name: tweet.author?.name,
      handle: normalizeHandle(tweet.author?.screen_name),
      avatarUrl: tweet.author?.avatar_url,
      bio: tweet.author?.description,
      profileUrl: tweet.author?.url,
      verified: tweet.author?.verified,
      followerCount: tweet.author?.followers,
    }

    // Extract media
    const mediaItems: MediaItem[] = []
    if (tweet.media?.photos) {
      for (const photo of tweet.media.photos) {
        mediaItems.push({
          type: 'image',
          url: photo.url,
          width: photo.width,
          height: photo.height,
        })
      }
    }
    if (tweet.media?.videos) {
      for (const video of tweet.media.videos) {
        mediaItems.push({
          type: 'video',
          url: video.url,
          thumbnailUrl: video.thumbnail_url,
          width: video.width,
          height: video.height,
          duration: video.duration,
        })
      }
    }

    // Extract engagement
    const engagement = {
      likes: tweet.likes,
      retweets: tweet.retweets,
      replies: tweet.replies,
      views: tweet.views,
    }

    // Get thumbnail
    const thumbnailUrl = mediaItems[0]?.type === 'image'
      ? mediaItems[0].url
      : mediaItems[0]?.thumbnailUrl || tweet.media?.mosaic?.low?.url

    const content = cleanText(tweet.text)

    return createSuccessResult('twitter', {
      title: `${author.name} on X`,
      content,
      excerpt: generateExcerpt(content),
      author,
      thumbnailUrl,
      engagement,
      mediaItems,
      mentionedLinks: extractUrls(content),
      platformData: {
        postId: tweetId,
        isThread: tweet.is_thread,
        isReply: tweet.replying_to !== null,
        parentPostUrl: tweet.replying_to_status ? `https://twitter.com/i/status/${tweet.replying_to_status}` : undefined,
        publishedAt: tweet.created_at,
        conversationId: tweet.conversation_id,
        language: tweet.lang,
      },
    })
  }

  /**
   * Extract via Twitter's Syndication API
   * This provides the most complete data without authentication
   */
  private async extractViaSyndication(tweetId: string): Promise<ExtractionResult> {
    const apiUrl = `https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}&token=0`

    const response = await fetchWithTimeout(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Syndication API returned ${response.status}`)
    }

    const data = await response.json()

    if (!data || data.errors) {
      throw new Error('Invalid syndication response')
    }

    // Extract author info
    const author: AuthorInfo = {
      name: data.user?.name,
      handle: normalizeHandle(data.user?.screen_name),
      avatarUrl: data.user?.profile_image_url_https?.replace('_normal', '_400x400'),
      bio: data.user?.description,
      profileUrl: data.user?.screen_name ? `https://twitter.com/${data.user.screen_name}` : undefined,
      verified: data.user?.verified || data.user?.is_blue_verified,
      followerCount: data.user?.followers_count,
    }

    // Extract media
    const mediaItems: MediaItem[] = []
    if (data.mediaDetails) {
      for (const media of data.mediaDetails) {
        if (media.type === 'photo') {
          mediaItems.push({
            type: 'image',
            url: media.media_url_https,
            width: media.original_info?.width,
            height: media.original_info?.height,
          })
        } else if (media.type === 'video' || media.type === 'animated_gif') {
          const videoVariant = media.video_info?.variants
            ?.filter((v: any) => v.content_type === 'video/mp4')
            ?.sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0))[0]

          mediaItems.push({
            type: media.type === 'animated_gif' ? 'gif' : 'video',
            url: videoVariant?.url || media.media_url_https,
            thumbnailUrl: media.media_url_https,
            width: media.original_info?.width,
            height: media.original_info?.height,
            duration: media.video_info?.duration_millis ? media.video_info.duration_millis / 1000 : undefined,
          })
        }
      }
    }

    // Extract engagement
    const engagement = {
      likes: data.favorite_count,
      retweets: data.retweet_count,
      replies: data.reply_count,
      views: data.views_count,
    }

    // Get thumbnail (first image or video thumbnail)
    const thumbnailUrl = mediaItems[0]?.type === 'image'
      ? mediaItems[0].url
      : mediaItems[0]?.thumbnailUrl

    const content = cleanText(data.text)

    return createSuccessResult('twitter', {
      title: `${author.name} on X`,
      content,
      excerpt: generateExcerpt(content),
      author,
      thumbnailUrl,
      engagement,
      mediaItems,
      mentionedLinks: extractUrls(content),
      platformData: {
        postId: tweetId,
        isThread: data.self_thread?.id_str !== undefined,
        isReply: !!data.in_reply_to_status_id_str,
        parentPostUrl: data.in_reply_to_status_id_str
          ? `https://twitter.com/i/status/${data.in_reply_to_status_id_str}`
          : undefined,
        publishedAt: data.created_at,
        conversationId: data.conversation_id_str,
        language: data.lang,
      },
    })
  }

  /**
   * Extract via Twitter's oEmbed API
   * More reliable but provides less data
   */
  private async extractViaOEmbed(url: string): Promise<ExtractionResult> {
    const oEmbedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=true`

    const response = await fetchWithTimeout(oEmbedUrl)

    if (!response.ok) {
      throw new Error(`oEmbed API returned ${response.status}`)
    }

    const data = await response.json()

    // Parse author from author_name field (format: "Name (@handle)")
    const authorMatch = data.author_name?.match(/^(.+?)\s*\(@?(\w+)\)$/)
    const author: AuthorInfo = {
      name: authorMatch ? authorMatch[1] : data.author_name,
      handle: authorMatch ? authorMatch[2] : undefined,
      profileUrl: data.author_url,
    }

    // Extract text from HTML (oEmbed returns HTML)
    const htmlContent = data.html || ''
    const textMatch = htmlContent.match(/<p[^>]*>([\s\S]*?)<\/p>/)
    const content = textMatch
      ? cleanText(textMatch[1].replace(/<[^>]+>/g, ''))
      : ''

    return createSuccessResult('twitter', {
      title: `${author.name} on X`,
      content,
      excerpt: generateExcerpt(content),
      author,
      mentionedLinks: extractUrls(content),
      platformData: {
        postId: this.extractTweetId(url) || undefined,
        publishedAt: undefined,
      },
    })
  }

  /**
   * Extract via page scraping with OG tags
   * Last resort fallback
   */
  private async extractViaPageScraping(url: string): Promise<ExtractionResult> {
    const response = await fetchWithTimeout(url)

    if (!response.ok) {
      throw new Error(`Page request returned ${response.status}`)
    }

    const html = await response.text()

    // Extract OG tags
    const getMetaContent = (property: string): string | undefined => {
      const match = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'))
        || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`, 'i'))
      return match ? match[1] : undefined
    }

    const title = getMetaContent('og:title') || getMetaContent('twitter:title')
    const description = getMetaContent('og:description') || getMetaContent('twitter:description')
    const image = getMetaContent('og:image') || getMetaContent('twitter:image')

    // Try to parse author from title (format: "Author on X: \"tweet text\"")
    const authorMatch = title?.match(/^(.+?)\s+on\s+(?:Twitter|X):/i)
    const author: AuthorInfo | undefined = authorMatch ? {
      name: authorMatch[1],
    } : undefined

    const content = cleanText(description || '')

    return createSuccessResult('twitter', {
      title: title || 'Tweet',
      content,
      excerpt: generateExcerpt(content),
      author,
      thumbnailUrl: image,
      mentionedLinks: extractUrls(content),
      platformData: {
        postId: this.extractTweetId(url) || undefined,
      },
    })
  }
}

export const twitterExtractor = new TwitterExtractor()
