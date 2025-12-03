import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/app/actions/auth';
import { generateArticleContent } from '@/lib/ai-service';
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

        // Generate content
        const articleData = await generateArticleContent(options);

        // Update database
        let updatedEntity;
        if (draft) {
            updatedEntity = await prisma.draft.update({
                where: { id },
                data: {
                    title: articleData.title,
                    content: articleData.content,
                    excerpt: articleData.excerpt,
                    tags: articleData.tags,
                    metadata: {
                        ...(draft.metadata as any || {}),
                        ...options
                    }
                }
            });
        } else if (article) {
            updatedEntity = await prisma.article.update({
                where: { id },
                data: {
                    title: articleData.title,
                    content: articleData.content,
                    excerpt: articleData.excerpt,
                    tags: articleData.tags,
                    metadata: {
                        ...(article.metadata as any || {}),
                        ...options
                    }
                }
            });
        }

        return NextResponse.json({
            success: true,
            draft: updatedEntity, // Return as 'draft' for consistency with client expectations
            message: 'Content regenerated successfully'
        });

    } catch (error: any) {
        console.error('Content regeneration error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to regenerate content' },
            { status: 500 }
        );
    }
}
