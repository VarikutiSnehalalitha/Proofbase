import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: 'Resource not found' });
}

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  // Log error (without sensitive data)
  console.error(`[ERROR] ${err.name}: ${err.message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Multer file size error
  if (err.message?.includes('File too large')) {
    res.status(413).json({ error: 'File too large. Maximum size is 50MB.' });
    return;
  }

  // Default server error
  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
}
