import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { checkRateLimit, getRateLimitKey } from '@/lib/rateLimiter';
import { logSecurityEvent } from '@/lib/securityLogger';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids');

    if (!ids) {
      return NextResponse.json({ error: 'Missing college IDs' }, { status: 400 });
    }

    const collegeIds = ids.split(',').filter(Boolean);
    if (collegeIds.length < 2 || collegeIds.length > 3) {
      return NextResponse.json({ error: 'Provide 2-3 college IDs' }, { status: 400 });
    }

    const colleges = await prisma.college.findMany({
      where: { id: { in: collegeIds } },
      include: {
        courses: {
          orderBy: { name: 'asc' },
        },
        cutoffs: {
          orderBy: [{ exam: 'asc' }, { rankMin: 'asc' }],
          take: 5,
        },
      },
    });

    if (colleges.length !== collegeIds.length) {
      return NextResponse.json({ error: 'One or more colleges not found' }, { status: 404 });
    }

    return NextResponse.json({ data: colleges });
  } catch (error) {
    logSecurityEvent('API_ERROR', { userId: session.user.id, path: '/api/compare', details: { error: String(error) } });
    console.error('Compare fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limiting for creating comparisons
  const rateKey = getRateLimitKey(session.user.id, 'compare');
  const rateCheck = checkRateLimit(rateKey, 'compare');
  if (!rateCheck.allowed) {
    logSecurityEvent('RATE_LIMIT_HIT', {
      userId: session.user.id,
      details: { type: 'compare', resetAt: new Date(rateCheck.resetAt).toISOString() },
    });
    return NextResponse.json(
      { error: 'Too many comparison requests. Please slow down.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { collegeIds, name } = body;

    if (!collegeIds || !Array.isArray(collegeIds) || collegeIds.length < 2 || collegeIds.length > 3) {
      return NextResponse.json({ error: 'Provide 2-3 college IDs' }, { status: 422 });
    }

    const comparison = await prisma.comparison.create({
      data: {
        userId: session.user.id,
        collegeIds,
        name: name || null,
      },
    });

    return NextResponse.json(comparison, { status: 201 });
  } catch (error) {
    logSecurityEvent('API_ERROR', { userId: session.user.id, path: '/api/compare', details: { error: String(error) } });
    console.error('Compare save error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}