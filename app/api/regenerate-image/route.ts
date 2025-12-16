import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/app/actions/auth';
import { generateImage, downloadImageAsBase64 } from '@/lib/ai-service';
import { AIMetadata } from '@/lib/types';

export async function POST(request: NextRequest) {
    const session = await getSession()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { id, ...options }: { id: string } & AIMetadata = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

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

    } catch (error: any) {
        console.error('Image regeneration error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to regenerate image' },
            { status: 500 }
        );
    }
}
