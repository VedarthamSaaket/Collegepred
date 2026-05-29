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
    const q = searchParams.get('q') || '';
    const tag = searchParams.get('tag') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (q.trim()) {
      where.title = { contains: q.trim(), mode: 'insensitive' };
    }

    if (tag.trim()) {
      where.tags = { has: tag.trim() };
    }

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, image: true },
          },
          _count: {
            select: { answers: true },
          },
        },
      }),
      prisma.question.count({ where }),
    ]);

    const data = questions.map((q: { id: string; title: string; body: string; tags: string[]; views: number; createdAt: Date; user: { name: string | null; image: string | null } | null; _count: { answers: number } }) => ({
      id: q.id,
      title: q.title,
      body: q.body,
      tags: q.tags,
      answerCount: q._count.answers,
      viewCount: q.views,
      author: q.user?.name || 'Anonymous',
      createdAt: q.createdAt.toISOString(),
    }));

    return NextResponse.json({ data, total, page, limit });
  } catch (error) {
    logSecurityEvent('API_ERROR', { userId: session.user.id, path: '/api/discuss', details: { error: String(error) } });
    console.error('Discuss list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limiting for discuss posts
  const rateKey = getRateLimitKey(session.user.id, 'discuss');
  const rateCheck = checkRateLimit(rateKey, 'discuss');
  if (!rateCheck.allowed) {
    logSecurityEvent('RATE_LIMIT_HIT', {
      userId: session.user.id,
      details: { type: 'discuss', resetAt: new Date(rateCheck.resetAt).toISOString() },
    });
    return NextResponse.json(
      { error: 'Too many posts. Please wait before creating another.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { title, body: questionBody, tags } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 422 });
    }

    if (!questionBody || questionBody.trim().length < 20) {
      return NextResponse.json({ error: 'Question body must be at least 20 characters' }, { status: 422 });
    }

    const question = await prisma.question.create({
      data: {
        userId: session.user.id,
        title: title.trim(),
        body: questionBody.trim(),
        tags: tags || [],
      },
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    logSecurityEvent('API_ERROR', { userId: session.user.id, path: '/api/discuss', details: { error: String(error) } });
    console.error('Discuss create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}