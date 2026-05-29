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

    return NextResponse.json({
      savedColleges: savedColleges.map((sc: { college: { id: string; name: string; slug: string; city: string; state: string; type: string; rating: number; totalFees: number; imageUrl: string | null } }) => sc.college),
      comparisons,
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
    const { collegeId } = body;

    if (!collegeId) {
      return NextResponse.json({ error: 'collegeId is required' }, { status: 422 });
    }

    const college = await prisma.college.findUnique({ where: { id: collegeId } });
    if (!college) {
      return NextResponse.json({ error: 'College not found' }, { status: 404 });
    }

    const existing = await prisma.savedCollege.findUnique({
      where: { userId_collegeId: { userId: session.user.id, collegeId } },
    });

    if (existing) {
      return NextResponse.json({ message: 'Already saved' });
    }

    await prisma.savedCollege.create({
      data: { userId: session.user.id, collegeId },
    });

    return NextResponse.json({ success: true }, { status: 201 });
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

  // Rate limiting for delete
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
    const { collegeId } = body;

    if (!collegeId) {
      return NextResponse.json({ error: 'collegeId is required' }, { status: 422 });
    }

    // IDOR check: delete only user's own saved items (enforced by userId filter)
    await prisma.savedCollege.deleteMany({
      where: { userId: session.user.id, collegeId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logSecurityEvent('API_ERROR', { userId: session.user.id, path: '/api/saved', details: { error: String(error) } });
    console.error('Saved delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}