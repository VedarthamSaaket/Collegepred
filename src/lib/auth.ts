import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { compare } from 'bcryptjs';
import { prisma } from './prisma';
import { logSecurityEvent } from './securityLogger';
import { checkRateLimit, getRateLimitKey } from './rateLimiter';

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours - sessions expire after 24 hours
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Rate limiting on login attempts
        const rateKey = getRateLimitKey(email, 'login');
        const rateCheck = checkRateLimit(rateKey, 'login');
        if (!rateCheck.allowed) {
          logSecurityEvent('RATE_LIMIT_HIT', {
            email,
            details: { type: 'login', resetAt: new Date(rateCheck.resetAt).toISOString() },
          });
          throw new Error('Too many login attempts. Please try again later.');
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          logSecurityEvent('LOGIN_FAILURE', { email });
          return null;
        }

        const isValid = await compare(password, user.password);

        if (!isValid) {
          logSecurityEvent('LOGIN_FAILURE', { email });
          return null;
        }

        logSecurityEvent('LOGIN_SUCCESS', { userId: user.id, email });

        // Update last login timestamp
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        token.id = user.id;
        token.provider = account.provider;
        token.createdAt = Math.floor(Date.now() / 1000);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        const existing = await prisma.user.findUnique({
          where: { email: user.email },
        });
        if (!existing) {
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
              emailVerified: new Date(), // OAuth users are auto-verified
            },
          });
        }
      }
      return true;
    },
  },
});