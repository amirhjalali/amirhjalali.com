import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/app/actions/auth';
import { generateArticleContent, generateImage, downloadImageAsBase64 } from '@/lib/ai-service';
import { AIMetadata } from '@/lib/types';
import { parseAPIError, calculateNextRetryTime } from '@/lib/generation-error';

/**
 * POST /api/failed-generations/[id]/retry
 * Retry a failed generation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Get the failed generation
    const failedGen = await prisma.failedGeneration.findUnique({
      where: { id },
    });

    if (!failedGen) {
      return NextResponse.json(
        { error: 'Failed generation not found' },
        { status: 404 }
      );
    }

    if (failedGen.status === 'resolved') {
      return NextResponse.json(
        { error: 'This generation has already been resolved' },
        { status: 400 }
      );
    }

    if (failedGen.attempts >= failedGen.maxAttempts) {
      // Mark as abandoned if max attempts reached
      await prisma.failedGeneration.update({
        where: { id },
        data: { status: 'abandoned' },
      });
      return NextResponse.json(
        { error: 'Max retry attempts reached' },
        { status: 400 }
      );
    }

    // Update status to retrying
    await prisma.failedGeneration.update({
      where: { id },
      data: {
        status: 'retrying',
        attempts: failedGen.attempts + 1,
        lastAttemptAt: new Date(),
      },
    });

    const options = failedGen.requestData as AIMetadata;

    // Retry based on generation type
    if (failedGen.generationType === 'article') {
      try {
        // Generate article content
        const articleData = await generateArticleContent(options);

        // Generate image
        const imageUrl = await generateImage(articleData.title, {
          ...options,
          topic: options.topic,
        });

        // Download image as base64
        const imageBase64 = imageUrl.startsWith('data:')
          ? imageUrl
          : await downloadImageAsBase64(imageUrl);

        // Save as draft
        const draft = await prisma.draft.create({
          data: {
            title: articleData.title,
            content: articleData.content,
            excerpt: articleData.excerpt,
            tags: articleData.tags || ['AI', 'Technology'],
            imageUrl: imageBase64,
            aiGenerated: true,
            metadata: options,
          },
        });

        // Mark as resolved
        await prisma.failedGeneration.update({
          where: { id },
          data: {
            status: 'resolved',
            resolvedAt: new Date(),
            resolvedDraftId: draft.id,
          },
        });

        return NextResponse.json({
          success: true,
          draft,
          message: 'Retry successful, article generated',
        });
      } catch (retryError) {
        // Update with new error and schedule next retry
        const errorDetails = parseAPIError(retryError);

        await prisma.failedGeneration.update({
          where: { id },
          data: {
            status: 'pending',
            error: errorDetails.message,
            errorDetails: JSON.stringify(errorDetails),
            errorCode: errorDetails.code,
            nextRetryAt: calculateNextRetryTime(failedGen.attempts + 1),
          },
        });

        return NextResponse.json(
          {
            error: 'Retry failed',
            details: errorDetails.message,
            errorCode: errorDetails.code,
            supportedValues: errorDetails.supportedValues,
            attemptsRemaining: failedGen.maxAttempts - (failedGen.attempts + 1),
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: `Unsupported generation type: ${failedGen.generationType}` },
      { status: 400 }
    );
  } catch (error) {
    console.error('Retry error:', error);
    return NextResponse.json(
      { error: 'Failed to retry generation' },
      { status: 500 }
    );
  }
}
