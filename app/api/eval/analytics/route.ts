import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/app/actions/auth';
import { EVAL_TEXT_MODELS } from '@/lib/eval-models';

interface ModelStats {
  model: string;
  modelName: string;
  wins: number;
  losses: number;
  ties: number;
  total: number;
  winRate: number;
}

interface HeadToHead {
  modelA: string;
  modelB: string;
  modelAWins: number;
  modelBWins: number;
  ties: number;
  total: number;
}

// GET /api/eval/analytics - Get evaluation analytics
export async function GET(_request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch all evaluated comparisons
    const comparisons = await prisma.evalComparison.findMany({
      where: { status: 'evaluated' },
    });

    // Calculate model stats
    const modelStatsMap: Record<string, { wins: number; losses: number; ties: number }> = {};

    // Initialize stats for all known models
    Object.keys(EVAL_TEXT_MODELS).forEach((model) => {
      modelStatsMap[model] = { wins: 0, losses: 0, ties: 0 };
    });

    // Process comparisons
    for (const comparison of comparisons) {
      // Ensure models are tracked
      if (!modelStatsMap[comparison.modelA]) {
        modelStatsMap[comparison.modelA] = { wins: 0, losses: 0, ties: 0 };
      }
      if (!modelStatsMap[comparison.modelB]) {
        modelStatsMap[comparison.modelB] = { wins: 0, losses: 0, ties: 0 };
      }

      if (comparison.winner === 'A') {
        modelStatsMap[comparison.modelA].wins++;
        modelStatsMap[comparison.modelB].losses++;
      } else if (comparison.winner === 'B') {
        modelStatsMap[comparison.modelB].wins++;
        modelStatsMap[comparison.modelA].losses++;
      } else if (comparison.winner === 'tie') {
        modelStatsMap[comparison.modelA].ties++;
        modelStatsMap[comparison.modelB].ties++;
      }
    }

    // Convert to array and calculate win rates
    const modelStats: ModelStats[] = Object.entries(modelStatsMap)
      .filter(([_, stats]) => stats.wins + stats.losses + stats.ties > 0)
      .map(([model, stats]) => {
        const total = stats.wins + stats.losses + stats.ties;
        return {
          model,
          modelName: EVAL_TEXT_MODELS[model]?.name || model,
          wins: stats.wins,
          losses: stats.losses,
          ties: stats.ties,
          total,
          winRate: total > 0 ? Math.round((stats.wins / total) * 100) : 0,
        };
      })
      .sort((a, b) => b.winRate - a.winRate);

    // Calculate head-to-head records
    const headToHeadMap: Record<string, HeadToHead> = {};

    for (const comparison of comparisons) {
      // Create a consistent key (alphabetically sorted)
      const models = [comparison.modelA, comparison.modelB].sort();
      const key = models.join('_vs_');

      if (!headToHeadMap[key]) {
        headToHeadMap[key] = {
          modelA: models[0],
          modelB: models[1],
          modelAWins: 0,
          modelBWins: 0,
          ties: 0,
          total: 0,
        };
      }

      headToHeadMap[key].total++;

      if (comparison.winner === 'tie') {
        headToHeadMap[key].ties++;
      } else if (comparison.winner === 'A') {
        // Determine which model won based on original comparison
        if (comparison.modelA === models[0]) {
          headToHeadMap[key].modelAWins++;
        } else {
          headToHeadMap[key].modelBWins++;
        }
      } else if (comparison.winner === 'B') {
        if (comparison.modelB === models[0]) {
          headToHeadMap[key].modelAWins++;
        } else {
          headToHeadMap[key].modelBWins++;
        }
      }
    }

    const headToHead = Object.values(headToHeadMap).sort((a, b) => b.total - a.total);

    // Get recent evaluations
    const recentEvaluations = await prisma.evalComparison.findMany({
      where: { status: 'evaluated' },
      orderBy: { evaluatedAt: 'desc' },
      take: 10,
    });

    // Summary stats
    const totalComparisons = comparisons.length;
    const pendingComparisons = await prisma.evalComparison.count({
      where: { status: 'pending' },
    });

    return NextResponse.json({
      summary: {
        totalEvaluated: totalComparisons,
        pendingEvaluations: pendingComparisons,
        uniqueModels: modelStats.length,
      },
      modelStats,
      headToHead,
      recentEvaluations: recentEvaluations.map((e) => ({
        id: e.id,
        topic: e.topic,
        modelA: e.modelA,
        modelB: e.modelB,
        winner: e.winner,
        evaluatedAt: e.evaluatedAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
