import { Request, Response, NextFunction } from 'express';

// Extend express-session types
declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

/**
 * Requires a valid session. Returns 401 if not authenticated.
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.session?.userId) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  req.userId = req.session.userId;
  next();
}

/**
 * Optionally attaches userId if session exists, but doesn't require it.
 */
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (req.session?.userId) {
    req.userId = req.session.userId;
  }
  next();
}
