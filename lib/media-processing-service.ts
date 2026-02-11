/**
 * Media Processing Service
 * Handles downloading, storing, and processing media files
 */

import { uploadToR2 } from './upload-utils'
import crypto from 'crypto'

export interface MediaResult {
  url: string
  thumbnailUrl?: string
  contentType: string
  size: number
  width?: number
  height?: number
}

export interface ProcessMediaOptions {
  generateThumbnail?: boolean
  maxWidth?: number
  maxHeight?: number
  quality?: number
}

const DEFAULT_OPTIONS: ProcessMediaOptions = {
  generateThumbnail: true,
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 85,
}

// Supported media types
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg']

/**
 * Download media from URL and upload to R2
 */
export async function downloadAndStoreMedia(
  url: string,
  options: ProcessMediaOptions = {}
): Promise<MediaResult> {
  const _opts = { ...DEFAULT_OPTIONS, ...options }

  try {
    // Download the media
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NotesBot/1.0)',
        Accept: 'image/*,video/*',
      },
      signal: AbortSignal.timeout(30000), // 30 second timeout
    })

    if (!response.ok) {
      throw new Error(`Failed to download media: ${response.status} ${response.statusText}`)
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    const contentLength = parseInt(response.headers.get('content-length') || '0', 10)

    // Validate content type
    if (!isValidMediaType(contentType)) {
      throw new Error(`Unsupported media type: ${contentType}`)
    }

    // Check file size (limit to 50MB)
    const MAX_SIZE = 50 * 1024 * 1024
    if (contentLength > MAX_SIZE) {
      throw new Error(`Media too large: ${contentLength} bytes (max ${MAX_SIZE} bytes)`)
    }

    // Get the buffer
    const buffer = Buffer.from(await response.arrayBuffer())

    // Generate filename from URL or hash
    const extension = getExtensionFromContentType(contentType)
    const hash = crypto.createHash('md5').update(url).digest('hex').substring(0, 12)
    const fileName = `media-${hash}-${Date.now()}.${extension}`

    // Upload to R2
    const storedUrl = await uploadToR2(buffer, fileName, contentType)

    const result: MediaResult = {
      url: storedUrl,
      contentType,
      size: buffer.length,
    }

    // For images, try to extract dimensions (basic check for common formats)
    if (contentType.startsWith('image/')) {
      const dimensions = getImageDimensions(buffer, contentType)
      if (dimensions) {
        result.width = dimensions.width
        result.height = dimensions.height
      }
    }

    return result
  } catch (error: any) {
    console.error(`Failed to process media from ${url}:`, error.message)
    throw error
  }
}

/**
 * Process an image that's already in base64 format
 */
export async function processBase64Image(
  base64Data: string,
  _options: ProcessMediaOptions = {}
): Promise<MediaResult> {
  try {
    // Extract content type from data URI
    const matches = base64Data.match(/^data:([^;]+);base64,/)
    if (!matches) {
      throw new Error('Invalid base64 data URI')
    }

    const contentType = matches[1]
    if (!SUPPORTED_IMAGE_TYPES.includes(contentType)) {
      throw new Error(`Unsupported image type: ${contentType}`)
    }

    // Decode base64
    const base64Content = base64Data.split(',')[1]
    const buffer = Buffer.from(base64Content, 'base64')

    // Generate filename
    const extension = getExtensionFromContentType(contentType)
    const hash = crypto.createHash('md5').update(buffer).digest('hex').substring(0, 12)
    const fileName = `image-${hash}-${Date.now()}.${extension}`

    // Upload to R2
    const storedUrl = await uploadToR2(buffer, fileName, contentType)

    const result: MediaResult = {
      url: storedUrl,
      contentType,
      size: buffer.length,
    }

    // Extract dimensions
    const dimensions = getImageDimensions(buffer, contentType)
    if (dimensions) {
      result.width = dimensions.width
      result.height = dimensions.height
    }

    return result
  } catch (error: any) {
    console.error('Failed to process base64 image:', error.message)
    throw error
  }
}

/**
 * Get image dimensions from buffer (basic implementation for PNG and JPEG)
 */
function getImageDimensions(
  buffer: Buffer,
  contentType: string
): { width: number; height: number } | null {
  try {
    if (contentType === 'image/png') {
      // PNG: width at bytes 16-19, height at bytes 20-23
      if (buffer.length >= 24 && buffer[0] === 0x89 && buffer[1] === 0x50) {
        const width = buffer.readUInt32BE(16)
        const height = buffer.readUInt32BE(20)
        return { width, height }
      }
    } else if (contentType === 'image/jpeg') {
      // JPEG: More complex, need to find SOF marker
      let offset = 2
      while (offset < buffer.length - 1) {
        if (buffer[offset] !== 0xff) {
          offset++
          continue
        }

        const marker = buffer[offset + 1]
        // SOF markers: C0, C1, C2
        if (marker >= 0xc0 && marker <= 0xc2) {
          const height = buffer.readUInt16BE(offset + 5)
          const width = buffer.readUInt16BE(offset + 7)
          return { width, height }
        }

        // Skip to next marker
        if (marker === 0xd8 || marker === 0xd9) {
          offset += 2
        } else {
          const length = buffer.readUInt16BE(offset + 2)
          offset += 2 + length
        }
      }
    }
    return null
  } catch {
    return null
  }
}

/**
 * Check if content type is supported
 */
function isValidMediaType(contentType: string): boolean {
  const baseType = contentType.split(';')[0].trim()
  return SUPPORTED_IMAGE_TYPES.includes(baseType) || SUPPORTED_VIDEO_TYPES.includes(baseType)
}

/**
 * Get file extension from content type
 */
function getExtensionFromContentType(contentType: string): string {
  const baseType = contentType.split(';')[0].trim()
  const extensionMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/ogg': 'ogg',
  }
  return extensionMap[baseType] || 'bin'
}

/**
 * Extract video thumbnail URL from YouTube or Vimeo
 */
export function getVideoThumbnail(url: string): string | null {
  try {
    const urlObj = new URL(url)

    // YouTube
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
      let videoId: string | null = null

      if (urlObj.hostname.includes('youtu.be')) {
        videoId = urlObj.pathname.slice(1)
      } else {
        videoId = urlObj.searchParams.get('v')
      }

      if (videoId) {
        // Return high-quality thumbnail
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      }
    }

    // Vimeo - would need API call for thumbnail
    // For now, return null and let caller handle

    return null
  } catch {
    return null
  }
}

/**
 * Process media URL - main entry point
 * Downloads external media and stores it in R2
 */
export async function processMediaUrl(
  url: string,
  options: ProcessMediaOptions = {}
): Promise<MediaResult | null> {
  // Check if it's already stored in our R2
  if (url.includes(process.env.R2_PUBLIC_DOMAIN || 'r2.cloudflarestorage.com')) {
    // Already stored, just return info
    return {
      url,
      contentType: 'application/octet-stream',
      size: 0,
    }
  }

  // Check if it's a video service thumbnail
  const videoThumbnail = getVideoThumbnail(url)
  if (videoThumbnail) {
    // Download and store the video thumbnail
    try {
      return await downloadAndStoreMedia(videoThumbnail, options)
    } catch {
      // If thumbnail download fails, return original URL
      return {
        url: videoThumbnail,
        contentType: 'image/jpeg',
        size: 0,
      }
    }
  }

  // Download and store external media
  try {
    return await downloadAndStoreMedia(url, options)
  } catch {
    // If download fails, return null - caller should handle
    console.warn(`Could not process media: ${url}`)
    return null
  }
}
