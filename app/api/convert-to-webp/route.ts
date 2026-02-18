import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { getSession } from '@/app/actions/auth';

/**
 * Validate that a URL does not point to a private/internal IP range
 */
function isPrivateUrl(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);
    const hostname = parsed.hostname;

    // Block localhost and common internal hostnames
    if (
      hostname === 'localhost' ||
      hostname === '0.0.0.0' ||
      hostname === '[::1]'
    ) {
      return true;
    }

    // Block private IP ranges
    const privateRanges = [
      /^127\./, // 127.0.0.0/8 loopback
      /^10\./, // 10.0.0.0/8
      /^172\.(1[6-9]|2[0-9]|3[01])\./, // 172.16.0.0/12
      /^192\.168\./, // 192.168.0.0/16
      /^169\.254\./, // 169.254.0.0/16 link-local
      /^0\./, // 0.0.0.0/8
    ];

    for (const range of privateRanges) {
      if (range.test(hostname)) {
        return true;
      }
    }

    return false;
  } catch {
    return true; // If URL parsing fails, treat as private
  }
}

/**
 * Convert an image URL to WebP base64
 * POST /api/convert-to-webp
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL is not targeting private/internal addresses
    if (isPrivateUrl(url)) {
      return NextResponse.json({ error: 'URL targets a private or internal address' }, { status: 400 });
    }

    // Download the image
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convert to WebP
    const webpBuffer = await sharp(buffer)
      .webp({ quality: 85 })
      .toBuffer();

    const base64 = webpBuffer.toString('base64');

    return NextResponse.json({
      success: true,
      imageUrl: `data:image/webp;base64,${base64}`
    });
  } catch (error: any) {
    console.error('WebP conversion error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to convert image' },
      { status: 500 }
    );
  }
}
