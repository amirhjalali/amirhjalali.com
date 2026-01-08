import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/app/actions/auth';

// GET /api/eval/pairs - List all eval comparisons
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status'); // 'pending' or 'evaluated'
    const model = url.searchParams.get('model'); // Filter by model
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Build where clause
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (model) {
      where.OR = [
        { modelA: model },
        { modelB: model },
      ];
    }

    // Fetch comparisons with counts
    const [comparisons, total] = await Promise.all([
      prisma.evalComparison.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.evalComparison.count({ where }),
    ]);

    // Fetch associated drafts for each comparison
    const enrichedComparisons = await Promise.all(
      comparisons.map(async (comparison) => {
        const [draftA, draftB] = await Promise.all([
          prisma.draft.findUnique({
            where: { id: comparison.articleAId },
            select: {
              id: true,
              title: true,
              excerpt: true,
              imageUrl: true,
              content: true,
              tags: true,
              metadata: true,
            },
          }),
          prisma.draft.findUnique({
            where: { id: comparison.articleBId },
            select: {
              id: true,
              title: true,
              excerpt: true,
              imageUrl: true,
              content: true,
              tags: true,
              metadata: true,
            },
          }),
        ]);

        return {
          ...comparison,
          draftA,
          draftB,
        };
      })
    );

    return NextResponse.json({
      comparisons: enrichedComparisons,
      total,
      hasMore: offset + comparisons.length < total,
    });
  } catch (error) {
    console.error('Error fetching eval pairs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch eval pairs' },
      { status: 500 }
    );
  }
}
