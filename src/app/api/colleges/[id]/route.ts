import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { checkRateLimit, getRateLimitKey } from '@/lib/rateLimiter';
import { logSecurityEvent } from '@/lib/securityLogger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limiting for college detail views
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

  let id = '';

  try {
    const { id: resolvedId } = await params;
    id = resolvedId;
    if (!id || id.length < 5) {
      return NextResponse.json({ error: 'Invalid college ID' }, { status: 400 });
    }

    const college = await prisma.college.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
        ],
      },
      include: {
        courses: {
          orderBy: { name: 'asc' },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        cutoffs: {
          orderBy: [{ exam: 'asc' }, { rankMin: 'asc' }],
        },
      },
    });

    if (!college) {
      return NextResponse.json({ error: 'College not found' }, { status: 404 });
    }

    return NextResponse.json(college);
  } catch (error) {
    logSecurityEvent('API_ERROR', { userId: session.user.id, path: `/api/colleges/${id}`, details: { error: String(error) } });
    console.error('College detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}