import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { checkRateLimit, getRateLimitKey } from '@/lib/rateLimiter';
import { logSecurityEvent } from '@/lib/securityLogger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password } = body;

    if (!email || !name || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 422 });
    }

    // Rate limiting on signup attempts
    const rateKey = getRateLimitKey(email, 'signup');
    const rateCheck = checkRateLimit(rateKey, 'signup');
    if (!rateCheck.allowed) {
      logSecurityEvent('RATE_LIMIT_HIT', {
        email,
        details: { type: 'signup', resetAt: new Date(rateCheck.resetAt).toISOString() },
      });
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 422 });
    }

    const hashedPassword = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        emailVerified: new Date(), // Auto-verify - email verification skipped
      },
    });

    logSecurityEvent('SIGNUP_SUCCESS', { userId: user.id, email });

    return NextResponse.json(
      {
        message: 'Account created successfully.',
      },
      { status: 201 }
    );
  } catch (error) {
    logSecurityEvent('API_ERROR', { details: { error: String(error), path: '/api/auth/signup' } });
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
