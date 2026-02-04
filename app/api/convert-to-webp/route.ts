import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

/**
 * Convert an image URL to WebP base64
 * POST /api/convert-to-webp
 */
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
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
