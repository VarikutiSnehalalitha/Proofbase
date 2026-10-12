import { Router, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { requireAuth, optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validation';
import {
  createProjectSchema,
  updateProjectSchema,
  projectVisibilitySchema,
  projectStatusSchema,
  externalLinkSchema,
  projectQuerySchema,
} from '../validators';
import { upload, deleteFile, getFilePath, fileExists } from '../utils/storage';
import { AppError } from '../middleware/errorHandler';
import path from 'path';
import fs from 'fs';

const router = Router();

// ─── List User's Projects ────────────────────────────────────────────────

router.get('/', requireAuth, validateQuery(projectQuerySchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, search, category, status, visibility, sort = 'newest' } = req.query as any;
    const skip = (page - 1) * limit;

    const where: any = { userId: req.userId! };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) where.category = category;
    if (status) where.status = status;
    if (visibility) where.visibility = visibility;

    const sortMap: Record<string, any> = {
      newest: { createdAt: 'desc' },
      oldest: { createdAt: 'asc' },
      name: { name: 'asc' },
      updated: { updatedAt: 'desc' },
    };
    const orderBy = sortMap[sort as string] || { createdAt: 'desc' };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          skills: true,
          files: { select: { id: true, originalName: true, mimeType: true, size: true } },
          externalLinks: true,
          _count: { select: { files: true, externalLinks: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);

    res.json({
      projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// ─── Create Project ──────────────────────────────────────────────────────

router.post('/', requireAuth, validateBody(createProjectSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { skills, ...projectData } = req.body;

    const project = await prisma.$transaction(async (tx) => {
      const newProject = await tx.project.create({
        data: {
          ...projectData,
          userId: req.userId!,
          startDate: projectData.startDate ? new Date(projectData.startDate) : null,
          endDate: projectData.endDate ? new Date(projectData.endDate) : null,
        },
      });

      // Create skills
      if (skills && skills.length > 0) {
        await tx.projectSkill.createMany({
          data: skills.map((name: string) => ({
            projectId: newProject.id,
            name,
          })),
        });
      }

      // Log activity
      await tx.activityLog.create({
        data: {
          userId: req.userId!,
          action: 'created',
          entityType: 'project',
          entityId: newProject.id,
          metadata: { name: newProject.name },
        },
      });

      return newProject;
    });

    const fullProject = await prisma.project.findUnique({
      where: { id: project.id },
      include: {
        skills: true,
        files: true,
        externalLinks: true,
      },
    });

    res.status(201).json({ project: fullProject });
  } catch (error) {
    next(error);
  }
});

// ─── Get Project Detail ──────────────────────────────────────────────────

router.get('/:id', optionalAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
              select: { name: true, headline: true, avatarUrl: true },
            },
          },
        },
      },
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Access control
    const isOwner = req.userId === project.userId;

    if (!isOwner) {
      if (project.visibility === 'private') {
        res.status(404).json({ error: 'Project not found' });
        return;
      }
      if (project.visibility === 'shared') {
        // Check if user has share permission
        if (!req.userId) {
          res.status(404).json({ error: 'Project not found' });
          return;
        }
        const permission = await prisma.sharePermission.findFirst({
          where: {
            projectId: project.id,
            grantedToId: req.userId,
          },
        });
        if (!permission) {
          res.status(404).json({ error: 'Project not found' });
          return;
        }
      }
      if (project.status !== 'published') {
        res.status(404).json({ error: 'Project not found' });
        return;
      }
    }

    res.json({ project, isOwner });
  } catch (error) {
    next(error);
  }
});

// ─── Update Project ──────────────────────────────────────────────────────

router.put('/:id', requireAuth, validateBody(updateProjectSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project || project.userId !== req.userId!) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const { skills, ...updateData } = req.body;

    const updated = await prisma.$transaction(async (tx) => {
      // Update project
      const updatedProject = await tx.project.update({
        where: { id: project.id },
        data: {
          ...updateData,
          startDate: updateData.startDate ? new Date(updateData.startDate) : undefined,
          endDate: updateData.endDate ? new Date(updateData.endDate) : undefined,
        },
      });

      // Update skills if provided
      if (skills !== undefined) {
        await tx.projectSkill.deleteMany({ where: { projectId: project.id } });
        if (skills.length > 0) {
          await tx.projectSkill.createMany({
            data: skills.map((name: string) => ({
              projectId: project.id,
              name,
            })),
          });
        }
      }

      // Log activity
      await tx.activityLog.create({
        data: {
          userId: req.userId!,
          action: 'updated',
          entityType: 'project',
          entityId: project.id,
        },
      });

      return updatedProject;
    });

    const fullProject = await prisma.project.findUnique({
      where: { id: updated.id },
      include: {
        skills: true,
        files: { select: { id: true, originalName: true, mimeType: true, size: true } },
        externalLinks: true,
      },
    });

    res.json({ project: fullProject });
  } catch (error) {
    next(error);
  }
});

// ─── Delete Project ──────────────────────────────────────────────────────

router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const project = await prisma.project.findUnique({
      where: { id },
      include: { files: true },
    });

    if (!project || project.userId !== req.userId!) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Delete files from storage
    for (const file of project.files) {
      await deleteFile(file.filename).catch(err => {
        console.error(`Failed to delete file ${file.filename}:`, err.message);
      });
    }

    await prisma.project.delete({ where: { id: project.id } });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// ─── Update Project Visibility ───────────────────────────────────────────

router.patch('/:id/visibility', requireAuth, validateBody(projectVisibilitySchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project || project.userId !== req.userId!) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const updated = await prisma.project.update({
      where: { id: project.id },
      data: { visibility: req.body.visibility },
    });

    await prisma.activityLog.create({
      data: {
        userId: req.userId!,
        action: 'updated',
        entityType: 'project',
        entityId: project.id,
        metadata: { field: 'visibility', value: req.body.visibility },
      },
    });

    res.json({ project: updated });
  } catch (error) {
    next(error);
  }
});

// ─── Update Project Status ───────────────────────────────────────────────

router.patch('/:id/status', requireAuth, validateBody(projectStatusSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project || project.userId !== req.userId!) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const updated = await prisma.project.update({
      where: { id: project.id },
      data: { status: req.body.status },
    });

    await prisma.activityLog.create({
      data: {
        userId: req.userId!,
        action: req.body.status === 'published' ? 'published' : req.body.status === 'archived' ? 'archived' : 'updated',
        entityType: 'project',
        entityId: project.id,
      },
    });

    res.json({ project: updated });
  } catch (error) {
    next(error);
  }
});

// ─── Upload Files ────────────────────────────────────────────────────────

router.post('/:id/files', requireAuth, upload.array('files', 10), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project || project.userId !== req.userId!) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No files uploaded' });
      return;
    }

    const createdFiles = await prisma.$transaction(
      files.map(file =>
        prisma.projectFile.create({
          data: {
            projectId: project.id,
            filename: file.filename,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            storagePath: file.filename,
          },
        })
      )
    );

    res.status(201).json({ files: createdFiles });
  } catch (error) {
    next(error);
  }
});

// ─── Download File ───────────────────────────────────────────────────────

router.get('/:id/files/:fileId/download', optionalAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const fileId = req.params.fileId as string;
    const file = await prisma.projectFile.findUnique({
      where: { id: fileId },
      include: { project: true },
    });

    if (!file || file.projectId !== id) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    // Access control - same as project
    const isOwner = req.userId === file.project.userId;
    if (!isOwner) {
      if (file.project.visibility === 'private') {
        res.status(404).json({ error: 'File not found' });
        return;
      }
      if (file.project.visibility === 'shared') {
        if (!req.userId) {
          res.status(404).json({ error: 'File not found' });
          return;
        }
        const permission = await prisma.sharePermission.findFirst({
          where: {
            projectId: file.project.id,
            grantedToId: req.userId,
          },
        });
        if (!permission) {
          res.status(404).json({ error: 'File not found' });
          return;
        }
      }
    }

    const filePath = getFilePath(file.filename);
    if (!fileExists(file.filename)) {
      res.status(404).json({ error: 'File not found on server' });
      return;
    }

    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimeType);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
});

// ─── Delete File ─────────────────────────────────────────────────────────

router.delete('/:id/files/:fileId', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const fileId = req.params.fileId as string;
    const file = await prisma.projectFile.findUnique({
      where: { id: fileId },
      include: { project: true },
    });

    if (!file || file.projectId !== id || file.project.userId !== req.userId!) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    await deleteFile(file.filename);
    await prisma.projectFile.delete({ where: { id: file.id } });

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// ─── Add External Link ──────────────────────────────────────────────────

router.post('/:id/links', requireAuth, validateBody(externalLinkSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project || project.userId !== req.userId!) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const link = await prisma.externalLink.create({
      data: {
        projectId: project.id,
        ...req.body,
      },
    });

    res.status(201).json({ link });
  } catch (error) {
    next(error);
  }
});

// ─── Update External Link ───────────────────────────────────────────────

router.put('/:id/links/:linkId', requireAuth, validateBody(externalLinkSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const linkId = req.params.linkId as string;
    const link = await prisma.externalLink.findUnique({
      where: { id: linkId },
      include: { project: true },
    });

    if (!link || link.projectId !== id || link.project.userId !== req.userId!) {
      res.status(404).json({ error: 'Link not found' });
      return;
    }

    const updated = await prisma.externalLink.update({
      where: { id: link.id },
      data: req.body,
    });

    res.json({ link: updated });
  } catch (error) {
    next(error);
  }
});

// ─── Delete External Link ───────────────────────────────────────────────

router.delete('/:id/links/:linkId', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const linkId = req.params.linkId as string;
    const link = await prisma.externalLink.findUnique({
      where: { id: linkId },
      include: { project: true },
    });

    if (!link || link.projectId !== id || link.project.userId !== req.userId!) {
      res.status(404).json({ error: 'Link not found' });
      return;
    }

    await prisma.externalLink.delete({ where: { id: link.id } });

    res.json({ message: 'Link deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
