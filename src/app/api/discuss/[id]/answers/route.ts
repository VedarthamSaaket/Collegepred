import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { checkRateLimit, getRateLimitKey } from '@/lib/rateLimiter';
import { logSecurityEvent } from '@/lib/securityLogger';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limiting for answers
  const rateKey = getRateLimitKey(session.user.id, 'answer');
  const rateCheck = checkRateLimit(rateKey, 'answer');
  if (!rateCheck.allowed) {
    logSecurityEvent('RATE_LIMIT_HIT', {
      userId: session.user.id,
      details: { type: 'answer', resetAt: new Date(rateCheck.resetAt).toISOString() },
    });
    return NextResponse.json(
      { error: 'Too many answers. Please wait before posting another.' },
      { status: 429 }
    );
  }

  try {
    const { id: questionId } = await params;
    const body = await request.json();
    const { body: answerBody } = body;

    if (!answerBody || answerBody.trim().length < 10) {
      return NextResponse.json({ error: 'Answer must be at least 10 characters' }, { status: 422 });
    }

    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const answer = await prisma.answer.create({
      data: {
        questionId,
        userId: session.user.id,
        body: answerBody.trim(),
      },
      include: {
        user: {
          select: { name: true, image: true },
        },
      },
    });

    return NextResponse.json({
      id: answer.id,
      body: answer.body,
      author: answer.user?.name || 'Anonymous',
      userId: answer.userId,
      accepted: answer.accepted,
      createdAt: answer.createdAt.toISOString(),
    }, { status: 201 });
  } catch (error) {
    logSecurityEvent('API_ERROR', { userId: session.user.id, path: `/api/discuss/${(await params).id}/answers`, details: { error: String(error) } });
    console.error('Answer create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}