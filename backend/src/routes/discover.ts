import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { validateQuery } from '../middleware/validation';
import { discoverQuerySchema } from '../validators';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// ─── Discover Public Projects ────────────────────────────────────────────

router.get('/projects', validateQuery(discoverQuerySchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, search, category, skill, sort = 'newest' } = req.query as any;
    const skip = (page - 1) * limit;

    const where: any = {
      visibility: 'public',
      status: 'published',
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) where.category = category;
    if (skill) {
      where.skills = {
        some: { name: { contains: skill, mode: 'insensitive' } },
      };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'oldest') orderBy = { createdAt: 'asc' };
    // For 'popular', we'll sort by creation date as a simple fallback
    // (real popularity would use analytics aggregation)

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          skills: true,
          user: {
            include: {
              profile: {
                select: { name: true, headline: true, avatarUrl: true },
              },
            },
          },
          _count: { select: { files: true, externalLinks: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);

    // Get unique categories for filters
    const categories = await prisma.project.groupBy({
      by: ['category'],
      where: { visibility: 'public', status: 'published', category: { not: null } },
      _count: { category: true },
      orderBy: { _count: { category: 'desc' } },
      take: 20,
    });

    res.json({
      projects: projects.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        category: p.category,
        role: p.role,
        skills: p.skills.map(s => s.name),
        createdAt: p.createdAt,
        isFeatured: p.isFeatured,
        user: {
          username: p.user.username,
          profile: p.user.profile,
        },
        _count: p._count,
      })),
      categories: categories
        .filter(c => c.category)
        .map(c => ({ name: c.category!, count: c._count.category })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

// ─── Discover Public Profiles ────────────────────────────────────────────

router.get('/profiles', validateQuery(discoverQuerySchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, search, skill } = req.query as any;
    const skip = (page - 1) * limit;

    const where: any = {
      isPublic: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { headline: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (skill) {
      where.skills = { has: skill };
    }

    const [profiles, total] = await Promise.all([
      prisma.profile.findMany({
        where,
        include: {
          user: {
            select: {
              username: true,
              _count: {
                select: {
                  projects: {
                    where: { visibility: 'public', status: 'published' },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.profile.count({ where }),
    ]);

    res.json({
      profiles: profiles.map(p => ({
        name: p.name,
        headline: p.headline,
        location: p.location,
        avatarUrl: p.avatarUrl,
        skills: p.skills,
        username: p.user.username,
        projectCount: p.user._count.projects,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

// ─── Get Public Project Detail ───────────────────────────────────────────

router.get('/project/:id', optionalAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        skills: true,
        files: { select: { id: true, originalName: true, mimeType: true, size: true, createdAt: true } },
        externalLinks: true,
        user: {
          include: {
            profile: {
              select: { name: true, headline: true, avatarUrl: true, location: true },
            },
          },
        },
      },
    });

    if (!project || project.visibility !== 'public' || project.status !== 'published') {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Track view
    prisma.analyticsEvent.create({
      data: {
        type: 'project_view',
        targetType: 'project',
        targetId: project.id,
        userId: project.userId,
        visitorId: req.headers['x-visitor-id'] as string || null,
      },
    }).catch(() => {});

    res.json({
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        category: project.category,
        role: project.role,
        organization: project.organization,
        startDate: project.startDate,
        endDate: project.endDate,
        responsibilities: project.responsibilities,
        achievements: project.achievements,
        outcomes: project.outcomes,
        skills: project.skills.map((s: any) => s.name),
        files: project.files,
        externalLinks: project.externalLinks,
        isFeatured: project.isFeatured,
        createdAt: project.createdAt,
        user: {
          username: project.user.username,
          profile: project.user.profile,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
