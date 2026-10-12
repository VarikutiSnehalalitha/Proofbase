import { Router, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { requireAuth, optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { updateProfileSchema } from '../validators';

const router = Router();

// ─── Get Own Profile ─────────────────────────────────────────────────────

router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.userId! },
    });

    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { username: true, email: true },
    });

    res.json({ profile: { ...profile, username: user?.username, email: user?.email } });
  } catch (error) {
    next(error);
  }
});

// ─── Update Profile ──────────────────────────────────────────────────────

router.put('/', requireAuth, validateBody(updateProfileSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const profile = await prisma.profile.update({
      where: { userId: req.userId! },
      data: req.body,
    });

    await prisma.activityLog.create({
      data: {
        userId: req.userId!,
        action: 'updated',
        entityType: 'profile',
        entityId: profile.id,
      },
    });

    res.json({ profile });
  } catch (error) {
    next(error);
  }
});

// ─── Get Public Profile by Username ──────────────────────────────────────

router.get('/:username', optionalAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const username = req.params.username as string;
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        profile: true,
        projects: {
          where: {
            visibility: 'public',
            status: 'published',
          },
          include: {
            skills: true,
            _count: { select: { files: true } },
          },
          orderBy: [
            { isFeatured: 'desc' },
            { createdAt: 'desc' },
          ],
        },
      },
    });

    if (!user || !user.profile || !user.profile.isPublic) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    const isOwner = req.userId === user.id;

    // Track profile view (non-blocking)
    if (!isOwner) {
      prisma.analyticsEvent.create({
        data: {
          type: 'profile_view',
          targetType: 'profile',
          targetId: user.id,
          userId: user.id,
          visitorId: req.headers['x-visitor-id'] as string || null,
        },
      }).catch(() => {});
    }

    // Don't expose sensitive fields
    const publicProfile = {
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
      username: user.username,
    };

    const publicProjects = user.projects.map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      role: p.role,
      skills: p.skills.map((s: any) => s.name),
      isFeatured: p.isFeatured,
      createdAt: p.createdAt,
      _count: p._count,
    }));

    res.json({ profile: publicProfile, projects: publicProjects, isOwner });
  } catch (error) {
    next(error);
  }
});

export default router;
