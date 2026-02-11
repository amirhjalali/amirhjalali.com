/**
 * Reddit Platform Extractor
 *
 * Uses Reddit's JSON API by appending .json to URLs
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
  fetchWithTimeout,
} from './base'

export class RedditExtractor implements PlatformExtractor {
  platform = 'reddit' as const
  version = EXTRACTOR_VERSION

  canHandle(url: string): boolean {
    return /^https?:\/\/(www\.|old\.|new\.)?reddit\.com\//i.test(url) ||
           /^https?:\/\/redd\.it\//i.test(url)
  }

  async extract(url: string): Promise<ExtractionResult> {
    try {
      // Normalize URL and add .json
      const normalizedUrl = this.normalizeUrl(url)
      const jsonUrl = normalizedUrl.replace(/\/?$/, '.json')

      const response = await fetchWithTimeout(jsonUrl, {
        headers: {
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Reddit API returned ${response.status}`)
      }

      const data = await response.json()

      // Reddit returns an array, first item is post, second is comments
      const postData = data[0]?.data?.children?.[0]?.data
      if (!postData) {
        throw new Error('Could not parse Reddit response')
      }

      return this.parsePostData(postData, normalizedUrl)
    } catch (error) {
      return createFailureResult('reddit', `Extraction failed: ${error}`)
    }
  }

  private normalizeUrl(url: string): string {
    // Convert redd.it short URLs to full URLs
    if (url.includes('redd.it/')) {
      const match = url.match(/redd\.it\/(\w+)/)
      if (match) {
        return `https://www.reddit.com/comments/${match[1]}`
      }
    }

    // Normalize old/new reddit to www
    return url
      .replace('old.reddit.com', 'www.reddit.com')
      .replace('new.reddit.com', 'www.reddit.com')
      .replace(/\?.*$/, '') // Remove query params
  }

  private parsePostData(post: any, _url: string): ExtractionResult {
    // Author info
    const author: AuthorInfo = {
      name: post.author,
      handle: post.author,
      profileUrl: post.author !== '[deleted]' ? `https://www.reddit.com/user/${post.author}` : undefined,
    }

    // Extract content based on post type
    let content = ''
    let excerpt = ''

    if (post.is_self && post.selftext) {
      // Text post
      content = cleanText(post.selftext)
      excerpt = generateExcerpt(content)
    } else if (post.title) {
      // Link post
      content = cleanText(post.title)
      excerpt = content
    }

    // Build media items
    const mediaItems: MediaItem[] = []

    // Check for images
    if (post.preview?.images) {
      for (const image of post.preview.images) {
        const source = image.source
        if (source?.url) {
          mediaItems.push({
            type: 'image',
            url: this.decodeHtmlEntities(source.url),
            width: source.width,
            height: source.height,
          })
        }

        // Check for gif/video variants
        if (image.variants?.gif?.source?.url) {
          mediaItems.push({
            type: 'gif',
            url: this.decodeHtmlEntities(image.variants.gif.source.url),
          })
        }
        if (image.variants?.mp4?.source?.url) {
          mediaItems.push({
            type: 'video',
            url: this.decodeHtmlEntities(image.variants.mp4.source.url),
          })
        }
      }
    }

    // Check for Reddit video
    if (post.is_video && post.media?.reddit_video) {
      const video = post.media.reddit_video
      mediaItems.push({
        type: 'video',
        url: video.fallback_url,
        width: video.width,
        height: video.height,
        duration: video.duration,
      })
    }

    // Check for gallery
    if (post.is_gallery && post.media_metadata) {
      for (const [_id, media] of Object.entries(post.media_metadata as Record<string, any>)) {
        if (media.s?.u) {
          mediaItems.push({
            type: 'image',
            url: this.decodeHtmlEntities(media.s.u),
            width: media.s.x,
            height: media.s.y,
          })
        }
      }
    }

    // Get thumbnail
    let thumbnailUrl: string | undefined
    if (post.thumbnail && post.thumbnail !== 'self' && post.thumbnail !== 'default' && post.thumbnail !== 'nsfw') {
      thumbnailUrl = post.thumbnail
    } else if (mediaItems[0]?.type === 'image') {
      thumbnailUrl = mediaItems[0].url
    }

    // Engagement metrics
    const engagement = {
      upvotes: post.ups,
      downvotes: post.downs,
      score: post.score,
      comments: post.num_comments,
      shares: post.num_crossposts,
    }

    // Awards
    const awards = post.all_awardings?.map((a: any) => ({
      name: a.name,
      count: a.count,
      iconUrl: a.icon_url,
    }))

    // Mentioned links
    const mentionedLinks = extractUrls(content)

    // Add the linked URL if it's not a self post
    if (!post.is_self && post.url) {
      mentionedLinks.unshift({
        url: post.url,
        title: post.title,
        domain: post.domain,
      })
    }

    return createSuccessResult('reddit', {
      title: post.title,
      content,
      excerpt,
      author,
      thumbnailUrl,
      engagement,
      mediaItems: mediaItems.length > 0 ? mediaItems : undefined,
      mentionedLinks: mentionedLinks.length > 0 ? mentionedLinks : undefined,
      platformData: {
        postId: post.id,
        subreddit: post.subreddit,
        subredditPrefixed: post.subreddit_name_prefixed,
        isNsfw: post.over_18,
        isSpoiler: post.spoiler,
        isStickied: post.stickied,
        isPinned: post.pinned,
        isLocked: post.locked,
        flair: post.link_flair_text,
        publishedAt: post.created_utc ? new Date(post.created_utc * 1000).toISOString() : undefined,
        editedAt: post.edited ? new Date(post.edited * 1000).toISOString() : undefined,
        domain: post.domain,
        permalink: `https://www.reddit.com${post.permalink}`,
        awards,
      },
    })
  }

  private decodeHtmlEntities(str: string): string {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
  }
}

export const redditExtractor = new RedditExtractor()
