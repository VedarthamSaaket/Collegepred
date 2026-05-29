import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import type { Prisma } from '@prisma/client';
import { checkRateLimit, getRateLimitKey } from '@/lib/rateLimiter';
import { logSecurityEvent } from '@/lib/securityLogger';

const EXAM_RANK_LIMITS: Record<string, number> = {
  JEE_MAINS: 1500000,
  JEE_ADVANCED: 250000,
  EAMCET_TS: 200000,
  EAMCET_AP: 200000,
};

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limiting for prediction API
  const rateKey = getRateLimitKey(session.user.id, 'predict');
  const rateCheck = checkRateLimit(rateKey, 'predict');
  if (!rateCheck.allowed) {
    logSecurityEvent('RATE_LIMIT_HIT', {
      userId: session.user.id,
      details: { type: 'predict', resetAt: new Date(rateCheck.resetAt).toISOString() },
    });
    return NextResponse.json(
      { error: 'Too many prediction requests. Please wait before trying again.' },
      { status: 429 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const exam = searchParams.get('exam');
    const rankStr = searchParams.get('rank');
    const category = searchParams.get('category') || 'GENERAL';
    const branch = searchParams.get('branch') || '';
    const gender = searchParams.get('gender') || 'ALL';

    if (!exam || !rankStr) {
      return NextResponse.json({ error: 'Exam and rank are required' }, { status: 422 });
    }

    const rank = parseInt(rankStr);
    if (isNaN(rank) || rank < 1) {
      return NextResponse.json({ error: 'Rank must be a positive integer' }, { status: 422 });
    }

    const rankLimit = EXAM_RANK_LIMITS[exam];
    if (rankLimit && rank > rankLimit) {
      return NextResponse.json({ error: `Rank exceeds maximum for ${exam}` }, { status: 422 });
    }

    const validExams = ['JEE_MAINS', 'JEE_ADVANCED', 'EAMCET_TS', 'EAMCET_AP'];
    if (!validExams.includes(exam)) {
      return NextResponse.json({ error: 'Invalid exam type' }, { status: 422 });
    }

    const validCategories = ['GENERAL', 'OBC', 'SC', 'ST', 'EWS'];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 422 });
    }

    const validGenders = ['ALL', 'MALE', 'FEMALE'];
    if (!validGenders.includes(gender)) {
      return NextResponse.json({ error: 'Invalid gender' }, { status: 422 });
    }

    type ExamType = 'JEE_MAINS' | 'JEE_ADVANCED' | 'EAMCET_TS' | 'EAMCET_AP';
    type CategoryType = 'GENERAL' | 'OBC' | 'SC' | 'ST' | 'EWS';

    const examEnum = exam as ExamType;
    const categoryEnum = category as CategoryType;

    type CutoffWithCollege = Prisma.CollegeCutoffGetPayload<{
      include: { college: { select: { id: true; name: true; slug: true; city: true; state: true; type: true; rating: true; womenOnly: true } } }
    }>;

    const where: Prisma.CollegeCutoffWhereInput = {
      exam: examEnum,
      category: categoryEnum,
      rankMin: { lte: rank },
      rankMax: { gte: rank },
    };

    if (branch.trim()) {
      where.branch = { contains: branch.trim(), mode: 'insensitive' };
    }

    // Gender filtering
    if (gender === 'MALE') {
      // Exclude women-only colleges, only show male/all cutoffs
      where.college = { womenOnly: false };
      where.gender = { in: ['MALE', 'ALL'] as const };
    } else if (gender === 'FEMALE') {
      // Only show female/all cutoffs (women-only colleges still apply)
      where.gender = { in: ['FEMALE', 'ALL'] as const };
    }

    const cutoffs = await prisma.collegeCutoff.findMany({
      where,
      include: {
        college: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            state: true,
            type: true,
            rating: true,
            womenOnly: true,
          },
        },
      },
      orderBy: { rankMin: 'asc' },
    });

    if (cutoffs.length === 0 && branch.trim()) {
      const fallbackWhere: Prisma.CollegeCutoffWhereInput = {
        exam: examEnum,
        category: categoryEnum,
        rankMin: { lte: rank },
        rankMax: { gte: rank },
      };

      if (gender === 'MALE') {
        fallbackWhere.college = { womenOnly: false };
        fallbackWhere.gender = { in: ['MALE', 'ALL'] as const };
      } else if (gender === 'FEMALE') {
        fallbackWhere.gender = { in: ['FEMALE', 'ALL'] as const };
      }

      const fallback = await prisma.collegeCutoff.findMany({
        where: fallbackWhere,
        include: {
          college: {
            select: {
              id: true,
              name: true,
              slug: true,
              city: true,
              state: true,
              type: true,
              rating: true,
              womenOnly: true,
            },
          },
        },
        orderBy: { rankMin: 'asc' },
      });

      const predictions = fallback.map((cutoff: CutoffWithCollege) => {
        const range = cutoff.rankMax - cutoff.rankMin;
        const position = range > 0 ? (rank - cutoff.rankMin) / range : 0.5;
        let confidence: 'Likely' | 'Possible' | 'Stretch';
        if (position <= 0.3) confidence = 'Likely';
        else if (position <= 0.7) confidence = 'Possible';
        else confidence = 'Stretch';

        return {
          college: cutoff.college,
          branch: cutoff.branch,
          rankMin: cutoff.rankMin,
          rankMax: cutoff.rankMax,
          confidence,
        };
      });

      return NextResponse.json({
        data: predictions,
        total: predictions.length,
        note: 'Branch filter did not match any results. Showing all matches.',
      });
    }

    const predictions = cutoffs.map((cutoff: CutoffWithCollege) => {
      const range = cutoff.rankMax - cutoff.rankMin;
      const position = range > 0 ? (rank - cutoff.rankMin) / range : 0.5;
      let confidence: 'Likely' | 'Possible' | 'Stretch';
      if (position <= 0.3) confidence = 'Likely';
      else if (position <= 0.7) confidence = 'Possible';
      else confidence = 'Stretch';

      return {
        college: cutoff.college,
        branch: cutoff.branch,
        rankMin: cutoff.rankMin,
        rankMax: cutoff.rankMax,
        confidence,
      };
    });

    return NextResponse.json({
      data: predictions,
      total: predictions.length,
    });
  } catch (error) {
    logSecurityEvent('API_ERROR', { userId: session.user.id, path: '/api/predict', details: { error: String(error) } });
    console.error('Predict error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}