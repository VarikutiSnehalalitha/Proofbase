import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/proofbase',
  },

  session: {
    secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },

  upload: {
    dir: process.env.UPLOAD_DIR || path.resolve(__dirname, '../../uploads'),
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE_MB || '50', 10) * 1024 * 1024,
    allowedMimeTypes: [
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      'text/markdown',
      // Images
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      // Videos
      'video/mp4',
      'video/webm',
      'video/quicktime',
      // Archives
      'application/zip',
      'application/x-zip-compressed',
      'application/gzip',
      'application/x-tar',
      // Code
      'text/javascript',
      'application/javascript',
      'text/html',
      'text/css',
      'application/json',
      'application/xml',
      'text/xml',
      'application/x-python-code',
      'text/x-python',
    ],
  },

  email: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'noreply@proofbase.dev',
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback',
  },
} as const;
