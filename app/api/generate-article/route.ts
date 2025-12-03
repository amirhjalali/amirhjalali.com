import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/app/actions/auth';
import { generateArticleContent, generateImage, downloadImageAsBase64 } from '@/lib/ai-service';
import { AIMetadata } from '@/lib/types';

export async function POST(request: NextRequest) {
  const session = await getSession()
  const authHeader = request.headers.get('authorization');
  const isCron = process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`;

  if (!session && !isCron) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const options: AIMetadata = await request.json().catch(() => ({}));

    // Generate article content
    const articleData = await generateArticleContent(options);

    // Generate image
    const imageUrl = await generateImage(articleData.title, {
      ...options,
      topic: options.topic // Ensure topic is passed if set
    });

    // Download image as base64
    const imageBase64 = await downloadImageAsBase64(imageUrl);

    // Calculate word count
    const wordCount = articleData.content.trim().split(/\s+/).length;

    // Save directly to database as draft
    const draft = await prisma.draft.create({
      data: {
        title: articleData.title,
        content: articleData.content,
        excerpt: articleData.excerpt,
        tags: articleData.tags || ['AI', 'Technology'],
        imageUrl: imageBase64,
        aiGenerated: true,
        metadata: options as any // Store the generation options
      }
    });

    return NextResponse.json({
      success: true,
      draft,
      topic: options.topic,
      wordCount,
      message: 'Article generated and saved as draft'
    });

  } catch (error: any) {
    console.error('Article generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate article' },
      { status: 500 }
    );
  }
}
