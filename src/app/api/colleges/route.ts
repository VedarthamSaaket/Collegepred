import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { searchColleges } from '@/lib/fts';
import { checkRateLimit, getRateLimitKey } from '@/lib/rateLimiter';
import { logSecurityEvent } from '@/lib/securityLogger';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limiting for college searches
  const rateKey = getRateLimitKey(session.user.id, 'colleges');
  const rateCheck = checkRateLimit(rateKey, 'colleges');
  if (!rateCheck.allowed) {
    logSecurityEvent('RATE_LIMIT_HIT', {
      userId: session.user.id,
      details: { type: 'colleges', resetAt: new Date(rateCheck.resetAt).toISOString() },
    });
    return NextResponse.json(
      { error: 'Too many requests. Please slow down.' },
      { status: 429 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const type = searchParams.get('type');
    const state = searchParams.get('state');
    const feeMin = searchParams.get('feeMin');
    const feeMax = searchParams.get('feeMax');
    const naac = searchParams.get('naac');
    const nirfMin = searchParams.get('nirfMin');
    const nirfMax = searchParams.get('nirfMax');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12')));

    // If there's a search query, use full-text search via fts.ts
    if (q.trim()) {
      const types = type ? type.split(',').filter(Boolean) : undefined;
      const naacGrades = naac ? naac.split(',').filter(Boolean) : undefined;

      const result = await searchColleges({
        query: q.trim(),
        types,
        state: state || undefined,
        feeMin: feeMin ? parseInt(feeMin) : undefined,
        feeMax: feeMax ? parseInt(feeMax) : undefined,
        naac: naacGrades,
        nirfMin: nirfMin ? parseInt(nirfMin) : undefined,
        nirfMax: nirfMax ? parseInt(nirfMax) : undefined,
        page,
        limit,
      });

      return NextResponse.json({
        data: result.data,
        total: result.total,
        page,
        limit,
      });
    }

    // No search query - use regular Prisma filtering
    const skip = (page - 1) * limit;
    const where: any = {};

    if (type) {
      const types = type.split(',').filter(Boolean);
      if (types.length > 0) {
        where.type = { in: types };
      }
    }

    if (state) {
      where.state = state;
    }

    if (feeMin || feeMax) {
      where.totalFees = {};
      if (feeMin) where.totalFees.gte = parseInt(feeMin);
      if (feeMax) where.totalFees.lte = parseInt(feeMax);
    }

    if (naac) {
      const naacGrades = naac.split(',').filter(Boolean);
      if (naacGrades.length > 0) {
        where.naacGrade = { in: naacGrades };
      }
    }

    if (nirfMin || nirfMax) {
      where.nirfRank = {};
      if (nirfMin) where.nirfRank.gte = parseInt(nirfMin);
      if (nirfMax) where.nirfRank.lte = parseInt(nirfMax);
    }

    const [colleges, total] = await Promise.all([
      prisma.college.findMany({
        where,
        skip,
        take: limit,
        orderBy: { rating: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          location: true,
          city: true,
          state: true,
          type: true,
          rating: true,
          totalFees: true,
          naacGrade: true,
          nirfRank: true,
          placementAvg: true,
          imageUrl: true,
          logoUrl: true,
          createdAt: true,
        },
      }),
      prisma.college.count({ where }),
    ]);

    return NextResponse.json({
      data: colleges,
      total,
      page,
      limit,
    });
  } catch (error) {
    logSecurityEvent('API_ERROR', { userId: session.user.id, path: '/api/colleges', details: { error: String(error) } });
    console.error('Colleges list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}