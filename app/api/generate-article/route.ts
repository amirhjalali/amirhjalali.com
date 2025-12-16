import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/app/actions/auth';
import { generateArticleContent, generateImage, downloadImageAsBase64 } from '@/lib/ai-service';
import { AIMetadata } from '@/lib/types';
import { createSSEStream } from '@/lib/sse-helper';

export async function POST(request: NextRequest) {
  const session = await getSession()
  const authHeader = request.headers.get('authorization');
  const isCron = process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`;

  if (!session && !isCron) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const options: AIMetadata = await request.json().catch(() => ({}));
    const url = new URL(request.url);
    const useStreaming = url.searchParams.get('stream') === 'true';

    // Non-streaming mode (backward compatibility)
    if (!useStreaming) {
      // Generate article content
      const articleData = await generateArticleContent(options);

      // Generate image
      const imageUrl = await generateImage(articleData.title, {
        ...options,
        topic: options.topic // Ensure topic is passed if set
      });

      // Download image as base64 (only if it's not already a data URI)
      const imageBase64 = imageUrl.startsWith('data:')
        ? imageUrl // Already base64 data URI from Gemini
        : await downloadImageAsBase64(imageUrl); // Download from DALL-E URL

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
    }

    // Streaming mode with progress tracking
    const stream = createSSEStream(async (sseStream, controller) => {
      let articleData: any;
      let imageUrl: string;
      let imageBase64: string;
      let draft: any;

      try {
        // Step 1: Initializing (0%)
        sseStream.sendEvent(controller, {
          step: 'initializing',
          progress: 0,
          message: 'Initializing article generation...',
          estimatedTimeRemaining: 60
        });

        // Step 2: Generating content (10-60%)
        sseStream.sendEvent(controller, {
          step: 'generating_content',
          progress: 10,
          message: 'Generating article content with AI...',
          estimatedTimeRemaining: 50
        });

        articleData = await generateArticleContent(options);

        sseStream.sendEvent(controller, {
          step: 'generating_excerpt',
          progress: 60,
          message: 'Article content generated successfully',
          estimatedTimeRemaining: 30
        });

        // Step 3: Generating image (70%)
        sseStream.sendEvent(controller, {
          step: 'generating_image',
          progress: 70,
          message: 'Generating cover image...',
          estimatedTimeRemaining: 20
        });

        imageUrl = await generateImage(articleData.title, {
          ...options,
          topic: options.topic
        });

        // Step 4: Downloading image (85%) - only if needed
        if (!imageUrl.startsWith('data:')) {
          sseStream.sendEvent(controller, {
            step: 'downloading_image',
            progress: 85,
            message: 'Downloading and converting image...',
            estimatedTimeRemaining: 10
          });

          imageBase64 = await downloadImageAsBase64(imageUrl);
        } else {
          // Already base64 from Gemini - skip download step
          imageBase64 = imageUrl;
        }

        // Step 5: Saving to database (95%)
        sseStream.sendEvent(controller, {
          step: 'saving_draft',
          progress: 95,
          message: 'Saving draft to database...',
          estimatedTimeRemaining: 3
        });

        const wordCount = articleData.content.trim().split(/\s+/).length;

        draft = await prisma.draft.create({
          data: {
            title: articleData.title,
            content: articleData.content,
            excerpt: articleData.excerpt,
            tags: articleData.tags || ['AI', 'Technology'],
            imageUrl: imageBase64,
            aiGenerated: true,
            metadata: options as any
          }
        });

        // Step 6: Completed (100%)
        sseStream.sendEvent(controller, {
          step: 'completed',
          progress: 100,
          message: 'Article generated successfully!',
          estimatedTimeRemaining: 0
        });

        // Send final result data
        const finalData = {
          success: true,
          draft,
          topic: options.topic,
          wordCount,
          message: 'Article generated and saved as draft'
        };

        controller.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify({ ...finalData, step: 'result' })}\n\n`)
        );

        sseStream.sendComplete(controller);

      } catch (error: any) {
        console.error('Article generation error:', error);
        sseStream.sendError(controller, error.message || 'Failed to generate article');
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('Article generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate article' },
      { status: 500 }
    );
  }
}
