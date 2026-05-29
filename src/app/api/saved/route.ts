import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { checkRateLimit, getRateLimitKey } from '@/lib/rateLimiter';
import { logSecurityEvent } from '@/lib/securityLogger';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const savedColleges = await prisma.savedCollege.findMany({
      where: { userId: session.user.id },
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
            totalFees: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { savedAt: 'desc' },
    });

    const comparisons = await prisma.comparison.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch college names for each comparison
    const allCollegeIds = [...new Set(comparisons.flatMap((c) => c.collegeIds))];
    const colleges = allCollegeIds.length > 0
      ? await prisma.college.findMany({
          where: { id: { in: allCollegeIds } },
          select: { id: true, name: true, slug: true },
        })
      : [];
    const collegeMap = Object.fromEntries(colleges.map((c) => [c.id, c]));

    const comparisonsWithNames = comparisons.map((c) => ({
      ...c,
      colleges: c.collegeIds.map((id) => collegeMap[id]).filter(Boolean),
    }));

    return NextResponse.json({
      savedColleges: savedColleges.map((sc) => sc.college),
      comparisons: comparisonsWithNames,
    });
  } catch (error) {
    logSecurityEvent('API_ERROR', { userId: session.user.id, path: '/api/saved', details: { error: String(error) } });
    console.error('Saved list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limiting for save actions
  const rateKey = getRateLimitKey(session.user.id, 'saved');
  const rateCheck = checkRateLimit(rateKey, 'saved');
  if (!rateCheck.allowed) {
    logSecurityEvent('RATE_LIMIT_HIT', {
      userId: session.user.id,
      details: { type: 'saved', resetAt: new Date(rateCheck.resetAt).toISOString() },
    });
    return NextResponse.json(
      { error: 'Too many save/unsave actions. Please slow down.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { collegeId, action } = body;

    if (!collegeId) {
      return NextResponse.json({ error: 'collegeId is required' }, { status: 422 });
    }

    const college = await prisma.college.findUnique({ where: { id: collegeId } });
    if (!college) {
      return NextResponse.json({ error: 'College not found' }, { status: 404 });
    }

    // If action is 'remove' or it's already saved, handle unsave
    if (action === 'remove') {
      await prisma.savedCollege.deleteMany({
        where: { userId: session.user.id, collegeId },
      });
      return NextResponse.json({ success: true, saved: false });
    }

    // Otherwise toggle
    const existing = await prisma.savedCollege.findUnique({
      where: { userId_collegeId: { userId: session.user.id, collegeId } },
    });

    if (existing) {
      await prisma.savedCollege.deleteMany({
        where: { userId: session.user.id, collegeId },
      });
      return NextResponse.json({ success: true, saved: false });
    }

    await prisma.savedCollege.create({
      data: { userId: session.user.id, collegeId },
    });

    return NextResponse.json({ success: true, saved: true }, { status: 201 });
  } catch (error) {
    logSecurityEvent('API_ERROR', { userId: session.user.id, path: '/api/saved', details: { error: String(error) } });
    console.error('Saved create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { collegeId } = body;

    if (!collegeId) {
      return NextResponse.json({ error: 'collegeId is required' }, { status: 422 });
    }

    await prisma.savedCollege.deleteMany({
      where: { userId: session.user.id, collegeId },
    });

    return NextResponse.json({ success: true, saved: false });
  } catch (error) {
    logSecurityEvent('API_ERROR', { userId: session.user.id, path: '/api/saved', details: { error: String(error) } });
    console.error('Saved delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}