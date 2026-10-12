import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email';

const router = Router();

// ─── Register ────────────────────────────────────────────────────────────

router.post('/register', validateBody(registerSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, username } = req.body;

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) {
      res.status(409).json({ error: 'This username is already taken' });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user and profile in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          username,
        },
      });

      // Create default profile
      await tx.profile.create({
        data: {
          userId: newUser.id,
          name,
        },
      });

      // Create email verification token
      const token = uuidv4();
      await tx.emailVerification.create({
        data: {
          userId: newUser.id,
          token,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      });

      // Send verification email (non-blocking)
      sendVerificationEmail(email, token).catch(err => {
        console.error('[EMAIL] Failed to send verification email:', err.message);
      });

      return newUser;
    });

    // Set session
    req.session.userId = user.id;

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        emailVerified: user.emailVerified,
      },
      message: 'Account created. Please check your email to verify your account.',
    });
  } catch (error) {
    next(error);
  }
});

// ─── Login ───────────────────────────────────────────────────────────────

router.post('/login', validateBody(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Set session
    req.session.userId = user.id;

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        emailVerified: user.emailVerified,
        profile: user.profile ? {
          name: user.profile.name,
          headline: user.profile.headline,
          avatarUrl: user.profile.avatarUrl,
        } : null,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ─── Logout ──────────────────────────────────────────────────────────────

router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: 'Failed to logout' });
      return;
    }
    res.clearCookie('proofbase.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

// ─── Get Current User ────────────────────────────────────────────────────

router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      include: { profile: true },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        profile: user.profile ? {
          name: user.profile.name,
          headline: user.profile.headline,
          bio: user.profile.bio,
          location: user.profile.location,
          avatarUrl: user.profile.avatarUrl,
          website: user.profile.website,
          githubUrl: user.profile.githubUrl,
          linkedinUrl: user.profile.linkedinUrl,
          twitterUrl: user.profile.twitterUrl,
          skills: user.profile.skills,
          experience: user.profile.experience,
          contactEmail: user.profile.contactEmail,
          isPublic: user.profile.isPublic,
        } : null,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ─── Verify Email ────────────────────────────────────────────────────────

router.get('/verify-email/:token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.params.token as string;

    const verification = await prisma.emailVerification.findUnique({
      where: { token },
    });

    if (!verification || verification.used || verification.expiresAt < new Date()) {
      res.status(400).json({ error: 'Invalid or expired verification link' });
      return;
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: verification.userId },
        data: { emailVerified: true },
      }),
      prisma.emailVerification.update({
        where: { id: verification.id },
        data: { used: true },
      }),
    ]);

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
});

// ─── Forgot Password ────────────────────────────────────────────────────

router.post('/forgot-password', validateBody(forgotPasswordSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    // Always return success to prevent email enumeration
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const token = uuidv4();
      await prisma.passwordReset.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
      });

      sendPasswordResetEmail(email, token).catch(err => {
        console.error('[EMAIL] Failed to send password reset email:', err.message);
      });
    }

    res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
  } catch (error) {
    next(error);
  }
});

// ─── Reset Password ─────────────────────────────────────────────────────

router.post('/reset-password', validateBody(resetPasswordSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;

    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token },
    });

    if (!resetRecord || resetRecord.used || resetRecord.expiresAt < new Date()) {
      res.status(400).json({ error: 'Invalid or expired reset link' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash },
      }),
      prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { used: true },
      }),
    ]);

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
