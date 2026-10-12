import { Router, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// ─── Overview Analytics ──────────────────────────────────────────────────

router.get('/overview', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;

    // Get project counts
    const [
      totalProjects,
      publicProjects,
      privateProjects,
      sharedProjects,
      draftProjects,
      archivedProjects,
    ] = await Promise.all([
      prisma.project.count({ where: { userId } }),
      prisma.project.count({ where: { userId, visibility: 'public' } }),
      prisma.project.count({ where: { userId, visibility: 'private' } }),
      prisma.project.count({ where: { userId, visibility: 'shared' } }),
      prisma.project.count({ where: { userId, status: 'draft' } }),
      prisma.project.count({ where: { userId, status: 'archived' } }),
    ]);

    // Get profile views (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [profileViews, projectViews, totalProfileViews, totalProjectViews] = await Promise.all([
      prisma.analyticsEvent.count({
        where: {
          userId,
          type: 'profile_view',
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.analyticsEvent.count({
        where: {
          userId,
          type: 'project_view',
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.analyticsEvent.count({
        where: { userId, type: 'profile_view' },
      }),
      prisma.analyticsEvent.count({
        where: { userId, type: 'project_view' },
      }),
    ]);

    // Unique profile visitors (last 30 days)
    const uniqueProfileVisitors = await prisma.analyticsEvent.groupBy({
      by: ['visitorId'],
      where: {
        userId,
        type: 'profile_view',
        createdAt: { gte: thirtyDaysAgo },
        visitorId: { not: null },
      },
    });

    // Recent activity
    const recentActivity = await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Popular projects
    const popularProjects = await prisma.analyticsEvent.groupBy({
      by: ['targetId'],
      where: {
        userId,
        type: 'project_view',
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: { targetId: true },
      orderBy: { _count: { targetId: 'desc' } },
      take: 5,
    });

    // Get project names for popular projects
    const popularProjectIds = popularProjects.map(p => p.targetId);
    const popularProjectDetails = await prisma.project.findMany({
      where: { id: { in: popularProjectIds } },
      select: { id: true, name: true, category: true },
    });

    // Share activity
    const shareActivity = await prisma.shareLink.count({
      where: {
        project: { userId },
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    res.json({
      projects: {
        total: totalProjects,
        public: publicProjects,
        private: privateProjects,
        shared: sharedProjects,
        draft: draftProjects,
        archived: archivedProjects,
      },
      views: {
        profileViews: {
          last30Days: profileViews,
          total: totalProfileViews,
          uniqueVisitors: uniqueProfileVisitors.length,
        },
        projectViews: {
          last30Days: projectViews,
          total: totalProjectViews,
        },
      },
      popularProjects: popularProjects.map(p => ({
        projectId: p.targetId,
        views: p._count.targetId,
        project: popularProjectDetails.find(d => d.id === p.targetId),
      })),
      shareActivity,
      recentActivity,
    });
  } catch (error) {
    next(error);
  }
});

// ─── Track Analytics Event ───────────────────────────────────────────────

router.post('/track', async (req, res, next) => {
  try {
    const { type, targetType, targetId, visitorId, referrer } = req.body;

    // Validate type
    if (!['profile_view', 'project_view', 'share_click'].includes(type)) {
      res.status(400).json({ error: 'Invalid event type' });
      return;
    }

    // Get the owner of the target
    let userId: string | null = null;
    if (targetType === 'project') {
      const project = await prisma.project.findUnique({
        where: { id: targetId },
        select: { userId: true, visibility: true, status: true },
      });
      if (!project || (project.visibility === 'private') || (project.status !== 'published')) {
        res.status(404).json({ error: 'Target not found' });
        return;
      }
      userId = project.userId;
    } else if (targetType === 'profile') {
      userId = targetId;
    }

    await prisma.analyticsEvent.create({
      data: {
        type,
        targetType,
        targetId,
        userId,
        visitorId: visitorId || null,
        referrer: referrer || null,
      },
    });

    res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
