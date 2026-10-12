import { Router, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { updateAccountSchema, changePasswordSchema } from '../validators';

const router = Router();

// ─── Update Account ──────────────────────────────────────────────────────

router.put('/account', requireAuth, validateBody(updateAccountSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { email, username } = req.body;

    // Check uniqueness
    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== req.userId!) {
        res.status(409).json({ error: 'Email already in use' });
        return;
      }
    }

    if (username) {
      const existing = await prisma.user.findUnique({ where: { username } });
      if (existing && existing.id !== req.userId!) {
        res.status(409).json({ error: 'Username already taken' });
        return;
      }
    }

    const updated = await prisma.user.update({
      where: { id: req.userId! },
      data: {
        ...(email && { email, emailVerified: false }),
        ...(username && { username }),
      },
    });

    res.json({
      user: {
        id: updated.id,
        email: updated.email,
        username: updated.username,
        emailVerified: updated.emailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ─── Change Password ─────────────────────────────────────────────────────

router.put('/password', requireAuth, validateBody(changePasswordSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.userId! } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      res.status(400).json({ error: 'Current password is incorrect' });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: req.userId! },
      data: { passwordHash },
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
});

// ─── Delete Account ──────────────────────────────────────────────────────

router.delete('/account', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Delete all project files from storage
    const projects = await prisma.project.findMany({
      where: { userId: req.userId! },
      include: { files: true },
    });

    const { deleteFile } = await import('../utils/storage');
    for (const project of projects) {
      for (const file of project.files) {
        await deleteFile(file.filename).catch(() => {});
      }
    }

    // Delete user (cascading deletes handle related records)
    await prisma.user.delete({ where: { id: req.userId! } });

    req.session.destroy(() => {});

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
