import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { logSecurityEvent } from '@/lib/securityLogger';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; aid: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: questionId, aid: answerId } = await params;

    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // IDOR check: Only the question author can accept an answer
    if (question.userId !== session.user.id) {
      logSecurityEvent('IDOR_ATTEMPT', {
        userId: session.user.id,
        path: `/api/discuss/${questionId}/answers/${answerId}`,
        details: { attemptedAction: 'accept_answer', resourceOwner: question.userId },
      });
      return NextResponse.json({ error: 'Only the question author can accept an answer' }, { status: 403 });
    }

    const answer = await prisma.answer.findUnique({ where: { id: answerId } });
    if (!answer) {
      return NextResponse.json({ error: 'Answer not found' }, { status: 404 });
    }

    await prisma.answer.update({
      where: { id: answerId },
      data: { accepted: true },
    });

    logSecurityEvent('ANSWER_ACCEPTED', {
      userId: session.user.id,
      details: { questionId, answerId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logSecurityEvent('API_ERROR', { userId: session.user.id, path: '/api/discuss/[id]/answers/[aid]', details: { error: String(error) } });
    console.error('Answer accept error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; aid: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: questionId, aid: answerId } = await params;

    const answer = await prisma.answer.findUnique({ where: { id: answerId } });
    if (!answer) {
      return NextResponse.json({ error: 'Answer not found' }, { status: 404 });
    }

    // IDOR check: Only the answer author can delete it
    if (answer.userId !== session.user.id) {
      logSecurityEvent('IDOR_ATTEMPT', {
        userId: session.user.id,
        path: `/api/discuss/${questionId}/answers/${answerId}`,
        details: { attemptedAction: 'delete_answer', resourceOwner: answer.userId },
      });
      return NextResponse.json({ error: 'You can only delete your own answers' }, { status: 403 });
    }

    await prisma.answer.delete({ where: { id: answerId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    logSecurityEvent('API_ERROR', { userId: session.user.id, path: '/api/discuss/[id]/answers/[aid]', details: { error: String(error) } });
    console.error('Answer delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}