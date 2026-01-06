import { YoutubeTranscript } from 'youtube-transcript';

export interface TranscriptSegment {
  text: string;
  offset: number;
  duration: number;
}

export interface VideoTranscript {
  videoId: string;
  title?: string;
  fullText: string;
  segments: TranscriptSegment[];
  duration: number;
  wordCount: number;
}

/**
 * Extract video ID from various YouTube URL formats
 */
export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    // Standard watch URL
    /(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.+&v=)([^&]+)/,
    // Short URL
    /youtu\.be\/([^?&]+)/,
    // Embed URL
    /youtube\.com\/embed\/([^?&]+)/,
    // Shorts URL
    /youtube\.com\/shorts\/([^?&]+)/,
    // Mobile URL
    /m\.youtube\.com\/watch\?v=([^&]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Check if a URL is a YouTube video
 */
export function isYouTubeUrl(url: string): boolean {
  return (
    url.includes('youtube.com') ||
    url.includes('youtu.be') ||
    url.includes('youtube-nocookie.com')
  );
}

/**
 * Fetch transcript for a YouTube video
 */
export async function fetchYouTubeTranscript(
  videoIdOrUrl: string
): Promise<VideoTranscript | null> {
  try {
    // Extract video ID if URL was provided
    const videoId = videoIdOrUrl.includes('http')
      ? extractYouTubeVideoId(videoIdOrUrl)
      : videoIdOrUrl;

    if (!videoId) {
      console.error('Could not extract video ID from:', videoIdOrUrl);
      return null;
    }

    // Fetch transcript segments
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);

    if (!transcriptItems || transcriptItems.length === 0) {
      console.log('No transcript available for video:', videoId);
      return null;
    }

    // Convert to our format and calculate stats
    const segments: TranscriptSegment[] = transcriptItems.map((item) => ({
      text: item.text,
      offset: item.offset,
      duration: item.duration,
    }));

    // Combine all text
    const fullText = segments
      .map((s) => s.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Calculate total duration
    const lastSegment = segments[segments.length - 1];
    const duration = lastSegment ? lastSegment.offset + lastSegment.duration : 0;

    // Word count
    const wordCount = fullText.split(/\s+/).filter(Boolean).length;

    return {
      videoId,
      fullText,
      segments,
      duration: Math.round(duration / 1000), // Convert to seconds
      wordCount,
    };
  } catch (error) {
    // Handle common errors gracefully
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('disabled')) {
      console.log('Transcript disabled for video:', videoIdOrUrl);
    } else if (errorMessage.includes('not found')) {
      console.log('Video not found:', videoIdOrUrl);
    } else {
      console.error('Error fetching transcript:', errorMessage);
    }

    return null;
  }
}

/**
 * Format duration in seconds to human readable string
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get transcript with timestamps for display
 */
export function getTimestampedTranscript(
  segments: TranscriptSegment[]
): string {
  return segments
    .map((segment) => {
      const timestamp = formatDuration(Math.round(segment.offset / 1000));
      return `[${timestamp}] ${segment.text}`;
    })
    .join('\n');
}
