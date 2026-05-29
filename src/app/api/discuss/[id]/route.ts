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

  try {
    const { id } = await params;

    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true, image: true },
        },
        answers: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { name: true, image: true, id: true },
            },
          },
        },
        _count: {
          select: { answers: true },
        },
      },
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: question.id,
      title: question.title,
      body: question.body,
      tags: question.tags,
      answerCount: question._count.answers,
      viewCount: question.views,
      author: question.user?.name || 'Anonymous',
      userId: question.userId,
      createdAt: question.createdAt.toISOString(),
      answers: question.answers.map((a: { id: string; body: string; userId: string; accepted: boolean; createdAt: Date; user: { name: string | null; image: string | null; id: string } | null }) => ({
        id: a.id,
        body: a.body,
        author: a.user?.name || 'Anonymous',
        userId: a.userId,
        accepted: a.accepted,
        createdAt: a.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    logSecurityEvent('API_ERROR', { userId: session.user.id, path: '/api/discuss/[id]', details: { error: String(error) } });
    console.error('Discuss detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const question = await prisma.question.findUnique({ where: { id } });
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // IDOR check: Only the question owner can edit it
    const body = await request.json();
    if (body.title || body.body) {
      if (question.userId !== session.user.id) {
        logSecurityEvent('IDOR_ATTEMPT', {
          userId: session.user.id,
          path: `/api/discuss/${id}`,
          details: { attemptedAction: 'edit_question', resourceOwner: question.userId },
        });
        return NextResponse.json({ error: 'You can only edit your own questions' }, { status: 403 });
      }

      await prisma.question.update({
        where: { id },
        data: {
          ...(body.title ? { title: body.title.trim() } : {}),
          ...(body.body ? { body: body.body.trim() } : {}),
          ...(body.tags ? { tags: body.tags } : {}),
        },
      });

      return NextResponse.json({ success: true });
    }

    // Simple view increment (no ownership check needed)
    await prisma.question.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logSecurityEvent('API_ERROR', { userId: session.user.id, path: '/api/discuss/[id]', details: { error: String(error) } });
    console.error('Discuss update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const question = await prisma.question.findUnique({ where: { id } });
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // IDOR check: Only the question owner can delete it
    if (question.userId !== session.user.id) {
      logSecurityEvent('IDOR_ATTEMPT', {
        userId: session.user.id,
        path: `/api/discuss/${id}`,
        details: { attemptedAction: 'delete_question', resourceOwner: question.userId },
      });
      return NextResponse.json({ error: 'You can only delete your own questions' }, { status: 403 });
    }

    // Delete associated answers first
    await prisma.answer.deleteMany({ where: { questionId: id } });
    await prisma.question.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    logSecurityEvent('API_ERROR', { userId: session.user.id, path: '/api/discuss/[id]', details: { error: String(error) } });
    console.error('Discuss delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}