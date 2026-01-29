import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getSession } from '@/app/actions/auth';

// GET /api/eval/pairs/[pairId] - Get a specific eval comparison
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pairId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { pairId } = await params;

    const comparison = await prisma.evalComparison.findUnique({
      where: { id: pairId },
    });

    if (!comparison) {
      return NextResponse.json({ error: 'Comparison not found' }, { status: 404 });
    }

    // Fetch associated drafts
    const [draftA, draftB] = await Promise.all([
      prisma.draft.findUnique({
        where: { id: comparison.articleAId },
      }),
      prisma.draft.findUnique({
        where: { id: comparison.articleBId },
      }),
    ]);

    return NextResponse.json({
      comparison,
      draftA,
      draftB,
    });
  } catch (error) {
    console.error('Error fetching eval pair:', error);
    return NextResponse.json(
      { error: 'Failed to fetch eval pair' },
      { status: 500 }
    );
  }
}

// Evaluation request schema
const EvaluateSchema = z.object({
  winner: z.enum(['A', 'B', 'tie']),
  reason: z.string().optional(),
});

// POST /api/eval/pairs/[pairId] - Submit evaluation for a comparison
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ pairId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { pairId } = await params;
    const body = await request.json();
    const parseResult = EvaluateSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { winner, reason } = parseResult.data;

    // Check if comparison exists
    const existing = await prisma.evalComparison.findUnique({
      where: { id: pairId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Comparison not found' }, { status: 404 });
    }

    // Update comparison with evaluation
    const comparison = await prisma.evalComparison.update({
      where: { id: pairId },
      data: {
        winner,
        winnerReason: reason,
        status: 'evaluated',
        evaluatedAt: new Date(),
        evaluatedBy: "admin",
      },
    });

    // Update the winning draft's metadata to mark it as preferred
    const winnerId = winner === 'A' ? existing.articleAId : winner === 'B' ? existing.articleBId : null;
    const loserId = winner === 'A' ? existing.articleBId : winner === 'B' ? existing.articleAId : null;

    if (winnerId) {
      const winnerDraft = await prisma.draft.findUnique({ where: { id: winnerId } });
      if (winnerDraft) {
        await prisma.draft.update({
          where: { id: winnerId },
          data: {
            metadata: {
              ...(winnerDraft.metadata as object || {}),
              preferredInComparison: true,
              rating: 5,
              ratedAt: new Date().toISOString(),
            },
          },
        });
      }
    }

    if (loserId) {
      const loserDraft = await prisma.draft.findUnique({ where: { id: loserId } });
      if (loserDraft) {
        await prisma.draft.update({
          where: { id: loserId },
          data: {
            metadata: {
              ...(loserDraft.metadata as object || {}),
              preferredInComparison: false,
              rating: 1,
              ratedAt: new Date().toISOString(),
            },
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      comparison,
      message: 'Evaluation submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting evaluation:', error);
    return NextResponse.json(
      { error: 'Failed to submit evaluation' },
      { status: 500 }
    );
  }
}

// DELETE /api/eval/pairs/[pairId] - Delete an eval comparison
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ pairId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { pairId } = await params;

    const comparison = await prisma.evalComparison.findUnique({
      where: { id: pairId },
    });

    if (!comparison) {
      return NextResponse.json({ error: 'Comparison not found' }, { status: 404 });
    }

    // Delete the comparison (optionally keep or delete the associated drafts)
    await prisma.evalComparison.delete({
      where: { id: pairId },
    });

    return NextResponse.json({
      success: true,
      message: 'Evaluation deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting eval pair:', error);
    return NextResponse.json(
      { error: 'Failed to delete eval pair' },
      { status: 500 }
    );
  }
}
