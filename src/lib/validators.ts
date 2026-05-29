import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const questionSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(200),
  body: z.string().min(20, 'Body must be at least 20 characters').max(5000),
  tags: z.array(z.string()).min(1, 'At least one tag is required').max(5),
});

export const answerSchema = z.object({
  body: z.string().min(10, 'Answer must be at least 10 characters').max(5000),
});

export const predictSchema = z.object({
  exam: z.enum(['JEE_MAINS', 'JEE_ADVANCED', 'EAMCET_TS', 'EAMCET_AP']),
  rank: z.number().int().positive('Rank must be positive'),
  category: z.enum(['GENERAL', 'OBC', 'SC', 'ST', 'EWS']),
  branch: z.string().optional(),
});

export const examRankRanges: Record<string, { min: number; max: number }> = {
  JEE_MAINS: { min: 1, max: 1500000 },
  JEE_ADVANCED: { min: 1, max: 250000 },
  EAMCET_TS: { min: 1, max: 200000 },
  EAMCET_AP: { min: 1, max: 200000 },
};

export function validateExamRank(exam: string, rank: number): boolean {
  const range = examRankRanges[exam];
  if (!range) return false;
  return rank >= range.min && rank <= range.max;
}

export function sanitizeSearchQuery(query: string): string {
  return query.replace(/[&|!:*()]/g, ' ').trim();
}