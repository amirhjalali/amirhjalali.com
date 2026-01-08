import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getSession } from '@/app/actions/auth';
import { generateArticleContent, generateImage, downloadImageAsBase64 } from '@/lib/ai-service';
import { generateEvalGroupId, generateComparisonPairId, EVAL_TEXT_MODELS } from '@/lib/eval-models';
import { createSSEStream } from '@/lib/sse-helper';

// Request validation schema
const GeneratePairSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters'),
  modelA: z.string(),
  modelB: z.string(),
  imageModel: z.string().optional().default('dall-e-3'),
});

// Generate a single article with specified model
async function generateSingleArticle(
  topic: string,
  textModel: string,
  imageModel: string,
  evalGroup: string,
  variantId: 'A' | 'B'
) {
  // Generate content
  const articleData = await generateArticleContent({
    topic,
    textModel,
  });

  // Generate image
  const imageUrl = await generateImage(articleData.title, {
    topic,
    imageModel,
  });

  // Download image if needed
  const imageBase64 = imageUrl.startsWith('data:')
    ? imageUrl
    : await downloadImageAsBase64(imageUrl);

  // Save as draft with eval metadata
  const draft = await prisma.draft.create({
    data: {
      title: articleData.title,
      content: articleData.content,
      excerpt: articleData.excerpt,
      tags: articleData.tags || ['AI', 'Technology', 'Eval'],
      imageUrl: imageBase64,
      aiGenerated: true,
      metadata: {
        textModel,
        imageModel,
        topic,
        evalGroup,
        variantId,
      },
    },
  });

  return draft;
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parseResult = GeneratePairSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { topic, modelA, modelB, imageModel } = parseResult.data;

    // Validate models exist
    if (!EVAL_TEXT_MODELS[modelA]) {
      return NextResponse.json({ error: `Unknown model: ${modelA}` }, { status: 400 });
    }
    if (!EVAL_TEXT_MODELS[modelB]) {
      return NextResponse.json({ error: `Unknown model: ${modelB}` }, { status: 400 });
    }

    const url = new URL(request.url);
    const useStreaming = url.searchParams.get('stream') === 'true';

    const evalGroup = generateEvalGroupId();
    const comparisonPairId = generateComparisonPairId();

    // Non-streaming mode
    if (!useStreaming) {
      // Generate both articles in parallel
      const [draftA, draftB] = await Promise.all([
        generateSingleArticle(topic, modelA, imageModel, evalGroup, 'A'),
        generateSingleArticle(topic, modelB, imageModel, evalGroup, 'B'),
      ]);

      // Update drafts with comparison pair ID
      await Promise.all([
        prisma.draft.update({
          where: { id: draftA.id },
          data: {
            metadata: {
              ...(draftA.metadata as object || {}),
              comparisonPairId,
            },
          },
        }),
        prisma.draft.update({
          where: { id: draftB.id },
          data: {
            metadata: {
              ...(draftB.metadata as object || {}),
              comparisonPairId,
            },
          },
        }),
      ]);

      // Create eval comparison record
      const comparison = await prisma.evalComparison.create({
        data: {
          topic,
          articleAId: draftA.id,
          modelA,
          articleBId: draftB.id,
          modelB,
          evalGroup,
          status: 'pending',
        },
      });

      return NextResponse.json({
        success: true,
        comparison,
        draftA,
        draftB,
        message: 'Eval pair generated successfully',
      });
    }

    // Streaming mode with progress
    const stream = createSSEStream(async (sseStream, controller) => {
      try {
        // Step 1: Initializing
        sseStream.sendEvent(controller, {
          step: 'initializing',
          progress: 0,
          message: 'Initializing eval pair generation...',
          estimatedTimeRemaining: 120,
        });

        // Step 2: Generate Article A
        sseStream.sendEvent(controller, {
          step: 'generating_article_a',
          progress: 10,
          message: `Generating Article A with ${EVAL_TEXT_MODELS[modelA]?.name || modelA}...`,
          estimatedTimeRemaining: 100,
        });

        const draftAPromise = generateSingleArticle(topic, modelA, imageModel, evalGroup, 'A');

        // Step 3: Generate Article B (in parallel)
        sseStream.sendEvent(controller, {
          step: 'generating_article_b',
          progress: 20,
          message: `Generating Article B with ${EVAL_TEXT_MODELS[modelB]?.name || modelB}...`,
          estimatedTimeRemaining: 90,
        });

        const draftBPromise = generateSingleArticle(topic, modelB, imageModel, evalGroup, 'B');

        // Wait for both
        const [draftA, draftB] = await Promise.all([draftAPromise, draftBPromise]);

        sseStream.sendEvent(controller, {
          step: 'articles_generated',
          progress: 80,
          message: 'Both articles generated, creating comparison...',
          estimatedTimeRemaining: 10,
        });

        // Update drafts with comparison pair ID
        await Promise.all([
          prisma.draft.update({
            where: { id: draftA.id },
            data: {
              metadata: {
                ...(draftA.metadata as object || {}),
                comparisonPairId,
              },
            },
          }),
          prisma.draft.update({
            where: { id: draftB.id },
            data: {
              metadata: {
                ...(draftB.metadata as object || {}),
                comparisonPairId,
              },
            },
          }),
        ]);

        // Create comparison record
        const comparison = await prisma.evalComparison.create({
          data: {
            topic,
            articleAId: draftA.id,
            modelA,
            articleBId: draftB.id,
            modelB,
            evalGroup,
            status: 'pending',
          },
        });

        // Completed
        sseStream.sendEvent(controller, {
          step: 'completed',
          progress: 100,
          message: 'Eval pair generated successfully!',
          estimatedTimeRemaining: 0,
        });

        // Send result
        const result = {
          success: true,
          comparison,
          draftA,
          draftB,
          step: 'result',
        };
        controller.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify(result)}\n\n`)
        );

        sseStream.sendComplete(controller);
      } catch (error) {
        console.error('Eval pair generation error:', error);
        const message = error instanceof Error ? error.message : 'Failed to generate eval pair';
        sseStream.sendError(controller, message);
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Eval pair generation error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate eval pair';
    return NextResponse.json(
      { error: 'Eval pair generation failed', details: message },
      { status: 500 }
    );
  }
}
