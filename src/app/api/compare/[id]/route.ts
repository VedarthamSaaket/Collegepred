import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { logSecurityEvent } from '@/lib/securityLogger';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let comparisonId = '';
  try {
    const { id } = await params;
    comparisonId = id;

    const comparison = await prisma.comparison.findUnique({
      where: { id },
    });

    if (!comparison) {
      return NextResponse.json({ error: 'Comparison not found' }, { status: 404 });
    }

    if (comparison.userId !== session.user.id) {
      logSecurityEvent('IDOR_ATTEMPT', {
        userId: session.user.id,
        path: `/api/compare/${id}`,
        details: { attemptedAction: 'delete_comparison', resourceOwner: comparison.userId },
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.comparison.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    logSecurityEvent('API_ERROR', { userId: session.user.id, path: `/api/compare/${comparisonId}`, details: { error: String(error) } });
    console.error('Compare delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
