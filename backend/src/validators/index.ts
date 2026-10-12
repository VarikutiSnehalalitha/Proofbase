import { z } from 'zod';

// ─── Auth Validators ─────────────────────────────────────────────────────

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// ─── Project Validators ──────────────────────────────────────────────────

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(200),
  description: z.string().max(5000).optional(),
  category: z.string().max(100).optional(),
  role: z.string().max(200).optional(),
  organization: z.string().max(200).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  responsibilities: z.string().max(3000).optional(),
  achievements: z.string().max(3000).optional(),
  outcomes: z.string().max(3000).optional(),
  skills: z.array(z.string().max(100)).max(30).optional(),
  visibility: z.enum(['public', 'private', 'shared']).optional(),
  status: z.enum(['draft', 'published']).optional(),
  isFeatured: z.boolean().optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const projectVisibilitySchema = z.object({
  visibility: z.enum(['public', 'private', 'shared']),
});

export const projectStatusSchema = z.object({
  status: z.enum(['draft', 'published', 'archived']),
});

// ─── External Link Validators ────────────────────────────────────────────

export const externalLinkSchema = z.object({
  title: z.string().min(1, 'Link title is required').max(200),
  url: z.string().url('Invalid URL'),
  type: z.enum(['github', 'gitlab', 'figma', 'website', 'docs', 'other']).optional(),
});

// ─── Profile Validators ──────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  headline: z.string().max(200).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  website: z.string().url().optional().nullable(),
  githubUrl: z.string().url().optional().nullable(),
  linkedinUrl: z.string().url().optional().nullable(),
  twitterUrl: z.string().url().optional().nullable(),
  skills: z.array(z.string().max(100)).max(50).optional(),
  experience: z.string().max(5000).optional().nullable(),
  contactEmail: z.string().email().optional().nullable(),
  isPublic: z.boolean().optional(),
});

// ─── Collection Validators ───────────────────────────────────────────────

export const createCollectionSchema = z.object({
  name: z.string().min(1, 'Collection name is required').max(200),
  description: z.string().max(1000).optional(),
});

export const updateCollectionSchema = createCollectionSchema.partial();

// ─── Share Validators ────────────────────────────────────────────────────

export const createShareLinkSchema = z.object({
  expiresInHours: z.number().min(1).max(720).optional(), // max 30 days
});

export const shareByEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// ─── Settings Validators ─────────────────────────────────────────────────

export const updateAccountSchema = z.object({
  email: z.string().email().optional(),
  username: z.string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/)
    .optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

// ─── Query Validators ────────────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(50)).optional(),
});

export const projectQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(50)).optional(),
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  visibility: z.string().optional(),
  sort: z.enum(['newest', 'oldest', 'name', 'updated']).optional(),
});

export const discoverQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(50)).optional(),
  search: z.string().optional(),
  category: z.string().optional(),
  skill: z.string().optional(),
  sort: z.enum(['newest', 'oldest', 'popular']).optional(),
});
