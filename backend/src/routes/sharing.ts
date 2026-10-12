import { Router, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';
import { requireAuth, optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { createShareLinkSchema, shareByEmailSchema } from '../validators';
import { sendShareNotificationEmail } from '../utils/email';
import { config } from '../config';

const router = Router();

// ─── Create Share Link ───────────────────────────────────────────────────

router.post('/:id/share', requireAuth, validateBody(createShareLinkSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project || project.userId !== req.userId!) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const token = uuidv4();
    const expiresAt = req.body.expiresInHours
      ? new Date(Date.now() + req.body.expiresInHours * 60 * 60 * 1000)
      : null;

    const shareLink = await prisma.shareLink.create({
      data: {
        projectId: project.id,
        token,
        expiresAt,
      },
    });

    if (project.visibility === 'private') {
      await prisma.project.update({
        where: { id: project.id },
        data: { visibility: 'shared' },
      });
    }

    await prisma.activityLog.create({
      data: {
        userId: req.userId!,
        action: 'shared',
        entityType: 'project',
        entityId: project.id,
        metadata: { type: 'link', expiresAt: expiresAt?.toISOString() },
      },
    });

    const shareUrl = `${config.frontendUrl}/shared/${token}`;
    res.status(201).json({ shareLink: { ...shareLink, url: shareUrl } });
  } catch (error) {
    next(error);
  }
});

// ─── Access Shared Project via Token ─────────────────────────────────────

router.get('/access/:token', optionalAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.params.token as string;
    const shareLink = await prisma.shareLink.findUnique({
      where: { token },
      include: {
        project: {
          include: {
            skills: true,
            files: { select: { id: true, originalName: true, mimeType: true, size: true, createdAt: true } },
            externalLinks: true,
            user: {
              include: {
                profile: { select: { name: true, headline: true, avatarUrl: true } },
              },
            },
          },
        },
      },
    });

    if (!shareLink || !shareLink.isActive) {
      res.status(404).json({ error: 'Share link not found or has been revoked' });
      return;
    }

    if (shareLink.expiresAt && shareLink.expiresAt < new Date()) {
      res.status(410).json({ error: 'This share link has expired' });
      return;
    }

    await prisma.shareLink.update({
      where: { id: shareLink.id },
      data: { accessCount: { increment: 1 } },
    });

    prisma.analyticsEvent.create({
      data: {
        type: 'project_view',
        targetType: 'project',
        targetId: shareLink.project.id,
        userId: shareLink.project.userId,
        visitorId: (req.headers['x-visitor-id'] as string) || null,
        referrer: 'share_link',
      },
    }).catch(() => {});

    res.json({ project: shareLink.project });
  } catch (error) {
    next(error);
  }
});

// ─── Share by Email ──────────────────────────────────────────────────────

router.post('/:id/share/email', requireAuth, validateBody(shareByEmailSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const project = await prisma.project.findUnique({
      where: { id },
      include: { user: { include: { profile: true } } },
    });

    if (!project || project.userId !== req.userId!) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const { email } = req.body;

    const existing = await prisma.sharePermission.findFirst({
      where: { projectId: project.id, email },
    });

    if (existing) {
      res.status(409).json({ error: 'Already shared with this email' });
      return;
    }

    const recipientUser = await prisma.user.findUnique({ where: { email } });

    const permission = await prisma.sharePermission.create({
      data: {
        projectId: project.id,
        grantedById: req.userId!,
        grantedToId: recipientUser?.id || null,
        email,
      },
    });

    const token = uuidv4();
    await prisma.shareLink.create({
      data: {
        projectId: project.id,
        token,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    if (project.visibility === 'private') {
      await prisma.project.update({
        where: { id: project.id },
        data: { visibility: 'shared' },
      });
    }

    const shareUrl = `${config.frontendUrl}/shared/${token}`;
    const sharedByName = (project as any).user?.profile?.name || (project as any).user?.username || 'A colleague';

    sendShareNotificationEmail(email, project.name, sharedByName, shareUrl).catch(err => {
      console.error('[EMAIL] Failed to send share notification:', err.message);
    });

    await prisma.activityLog.create({
      data: {
        userId: req.userId!,
        action: 'shared',
        entityType: 'project',
        entityId: project.id,
        metadata: { type: 'email', recipient: email },
      },
    });

    res.status(201).json({ permission, shareUrl });
  } catch (error) {
    next(error);
  }
});

// ─── Get Share Links for Project ─────────────────────────────────────────

router.get('/:id/shares', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project || project.userId !== req.userId!) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const [shareLinks, sharePermissions] = await Promise.all([
      prisma.shareLink.findMany({
        where: { projectId: project.id },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.sharePermission.findMany({
        where: { projectId: project.id },
        include: {
          grantedTo: {
            select: { username: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    res.json({
      shareLinks: shareLinks.map(link => ({
        ...link,
        url: `${config.frontendUrl}/shared/${link.token}`,
      })),
      sharePermissions,
    });
  } catch (error) {
    next(error);
  }
});

// ─── Revoke Share Link ───────────────────────────────────────────────────

router.delete('/:id/share/:shareId', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const shareId = req.params.shareId as string;
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project || project.userId !== req.userId!) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    await prisma.shareLink.update({
      where: { id: shareId },
      data: { isActive: false },
    });

    res.json({ message: 'Share link revoked' });
  } catch (error) {
    next(error);
  }
});

// ─── Revoke Email Permission ─────────────────────────────────────────────

router.delete('/:id/share/email/:permId', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const permId = req.params.permId as string;
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project || project.userId !== req.userId!) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    await prisma.sharePermission.delete({ where: { id: permId } });

    res.json({ message: 'Share permission revoked' });
  } catch (error) {
    next(error);
  }
});

export default router;
