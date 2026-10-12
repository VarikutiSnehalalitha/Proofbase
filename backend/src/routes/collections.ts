import { Router, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { createCollectionSchema, updateCollectionSchema } from '../validators';

const router = Router();

// ─── List Collections ────────────────────────────────────────────────────

router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const collections = await prisma.collection.findMany({
      where: { userId: req.userId! },
      include: {
        projects: {
          include: {
            project: {
              include: {
                skills: true,
                _count: { select: { files: true } },
              },
            },
          },
          orderBy: { addedAt: 'desc' },
        },
        _count: { select: { projects: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ collections });
  } catch (error) {
    next(error);
  }
});

// ─── Create Collection ───────────────────────────────────────────────────

router.post('/', requireAuth, validateBody(createCollectionSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const collection = await prisma.collection.create({
      data: {
        userId: req.userId!,
        ...req.body,
      },
    });

    res.status(201).json({ collection });
  } catch (error) {
    next(error);
  }
});

// ─── Update Collection ───────────────────────────────────────────────────

router.put('/:id', requireAuth, validateBody(updateCollectionSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const collection = await prisma.collection.findUnique({ where: { id } });
    if (!collection || collection.userId !== req.userId!) {
      res.status(404).json({ error: 'Collection not found' });
      return;
    }

    const updated = await prisma.collection.update({
      where: { id: collection.id },
      data: req.body,
    });

    res.json({ collection: updated });
  } catch (error) {
    next(error);
  }
});

// ─── Delete Collection ───────────────────────────────────────────────────

router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const collection = await prisma.collection.findUnique({ where: { id } });
    if (!collection || collection.userId !== req.userId!) {
      res.status(404).json({ error: 'Collection not found' });
      return;
    }

    await prisma.collection.delete({ where: { id: collection.id } });
    res.json({ message: 'Collection deleted' });
  } catch (error) {
    next(error);
  }
});

// ─── Add Project to Collection ───────────────────────────────────────────

router.post('/:id/projects', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const collection = await prisma.collection.findUnique({ where: { id } });
    if (!collection || collection.userId !== req.userId!) {
      res.status(404).json({ error: 'Collection not found' });
      return;
    }

    const { projectId } = req.body;
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.userId !== req.userId!) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Check if already in collection
    const existing = await prisma.collectionProject.findUnique({
      where: { collectionId_projectId: { collectionId: collection.id, projectId } },
    });
    if (existing) {
      res.status(409).json({ error: 'Project already in collection' });
      return;
    }

    const item = await prisma.collectionProject.create({
      data: { collectionId: collection.id, projectId },
    });

    res.status(201).json({ item });
  } catch (error) {
    next(error);
  }
});

// ─── Remove Project from Collection ──────────────────────────────────────

router.delete('/:id/projects/:projectId', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const projectId = req.params.projectId as string;
    const collection = await prisma.collection.findUnique({ where: { id } });
    if (!collection || collection.userId !== req.userId!) {
      res.status(404).json({ error: 'Collection not found' });
      return;
    }

    await prisma.collectionProject.delete({
      where: {
        collectionId_projectId: {
          collectionId: collection.id,
          projectId,
        },
      },
    });

    res.json({ message: 'Project removed from collection' });
  } catch (error) {
    next(error);
  }
});

export default router;
