import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/app/actions/auth';

/**
 * GET /api/failed-generations
 * List failed generations with optional filtering
 */
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'pending';
  const type = searchParams.get('type');
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  try {
    const where: Record<string, unknown> = {};

    if (status !== 'all') {
      where.status = status;
    }

    if (type) {
      where.generationType = type;
    }

    const failedGenerations = await prisma.failedGeneration.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const counts = await prisma.failedGeneration.groupBy({
      by: ['status'],
      _count: true,
    });

    const statusCounts = counts.reduce(
      (acc, { status, _count }) => {
        acc[status] = _count;
        return acc;
      },
      {} as Record<string, number>
    );

    return NextResponse.json({
      failedGenerations,
      counts: statusCounts,
      total: failedGenerations.length,
    });
  } catch (error) {
    console.error('Error fetching failed generations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch failed generations' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/failed-generations
 * Clear resolved or abandoned failed generations
 */
export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'resolved';

  try {
    const result = await prisma.failedGeneration.deleteMany({
      where: { status },
    });

    return NextResponse.json({
      success: true,
      deleted: result.count,
    });
  } catch (error) {
    console.error('Error clearing failed generations:', error);
    return NextResponse.json(
      { error: 'Failed to clear failed generations' },
      { status: 500 }
    );
  }
}
