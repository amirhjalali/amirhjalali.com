import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/app/actions/auth';
import { generateImage, downloadImageAsBase64 } from '@/lib/ai-service';
import { AIMetadata } from '@/lib/types';
import { createSSEStream } from '@/lib/sse-helper';

export async function POST(request: NextRequest) {
    const session = await getSession()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url);
    const useStreaming = url.searchParams.get('stream') === 'true';

    try {
        const { id, ...options }: { id: string } & AIMetadata = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        // Non-streaming mode (backward compatible)
        if (!useStreaming) {
            // Check if it's a draft or article
            let draft = await prisma.draft.findUnique({ where: { id } });
            let article = !draft ? await prisma.article.findUnique({ where: { id } }) : null;

            if (!draft && !article) {
                return NextResponse.json({ error: 'Draft or Article not found' }, { status: 404 });
            }

            const title = draft?.title || article?.title || 'Untitled';
            const topic = options.topic || (draft?.metadata as any)?.topic || (article?.metadata as any)?.topic || 'Technology';

            // Generate image
            const imageUrl = await generateImage(title, {
                ...options,
                topic
            });

            // Download image as base64 (only if it's not already a data URI)
            const imageBase64 = imageUrl.startsWith('data:')
                ? imageUrl // Already base64 data URI from Gemini
                : await downloadImageAsBase64(imageUrl); // Download from DALL-E URL

            // Update database
            if (draft) {
                await prisma.draft.update({
                    where: { id },
                    data: {
                        imageUrl: imageBase64,
                        metadata: {
                            ...(draft.metadata as any || {}),
                            ...options
                        }
                    }
                });
            } else if (article) {
                await prisma.article.update({
                    where: { id },
                    data: {
                        imageUrl: imageBase64,
                        metadata: {
                            ...(article.metadata as any || {}),
                            ...options
                        }
                    }
                });
            }

            return NextResponse.json({
                success: true,
                imageUrl: imageBase64,
                message: 'Image regenerated successfully'
            });
        }

        // Streaming mode with progress tracking
        const stream = createSSEStream(async (sseStream, controller) => {
            let imageUrl = '';
            let imageBase64 = '';

            // Step 1: Initializing (0%)
            sseStream.sendEvent(controller, {
                step: 'initializing',
                progress: 0,
                message: 'Preparing image regeneration...',
                estimatedTimeRemaining: 30
            });

            // Check if it's a draft or article
            let draft = await prisma.draft.findUnique({ where: { id } });
            let article = !draft ? await prisma.article.findUnique({ where: { id } }) : null;

            if (!draft && !article) {
                throw new Error('Draft or Article not found');
            }

            const title = draft?.title || article?.title || 'Untitled';
            const topic = options.topic || (draft?.metadata as any)?.topic || (article?.metadata as any)?.topic || 'Technology';

            // Step 2: Generating image (20%)
            sseStream.sendEvent(controller, {
                step: 'generating_image',
                progress: 20,
                message: 'Generating new cover image...',
                estimatedTimeRemaining: 25
            });

            imageUrl = await generateImage(title, {
                ...options,
                topic
            });

            // Step 3: Downloading image (60%) - only if needed
            if (!imageUrl.startsWith('data:')) {
                sseStream.sendEvent(controller, {
                    step: 'downloading_image',
                    progress: 60,
                    message: 'Downloading and converting image...',
                    estimatedTimeRemaining: 10
                });

                imageBase64 = await downloadImageAsBase64(imageUrl);
            } else {
                // Already base64 from Gemini
                imageBase64 = imageUrl;
            }

            // Step 4: Saving to database (80%)
            sseStream.sendEvent(controller, {
                step: 'saving_draft',
                progress: 80,
                message: 'Updating database...',
                estimatedTimeRemaining: 5
            });

            // Update database
            if (draft) {
                draft = await prisma.draft.update({
                    where: { id },
                    data: {
                        imageUrl: imageBase64,
                        metadata: {
                            ...(draft.metadata as any || {}),
                            ...options
                        }
                    }
                });
            } else if (article) {
                article = await prisma.article.update({
                    where: { id },
                    data: {
                        imageUrl: imageBase64,
                        metadata: {
                            ...(article.metadata as any || {}),
                            ...options
                        }
                    }
                });
            }

            // Step 5: Completed (100%)
            sseStream.sendEvent(controller, {
                step: 'completed',
                progress: 100,
                message: 'Image regenerated successfully!',
                estimatedTimeRemaining: 0
            });

            // Send final result
            const result = {
                success: true,
                imageUrl: imageBase64,
                draft: draft || undefined,
                article: article || undefined,
            };

            controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify({ ...result, step: 'completed' })}\n\n`)
            );

            sseStream.sendComplete(controller);
        });

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

    } catch (error: any) {
        console.error('Image regeneration error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to regenerate image' },
            { status: 500 }
        );
    }
}
