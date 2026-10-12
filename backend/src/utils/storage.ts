import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import { config } from '../config';

// Ensure upload directory exists
const uploadDir = config.upload.dir;
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for disk storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

// File filter for allowed types
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if ((config.upload.allowedMimeTypes as readonly string[]).includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: 10, // max 10 files per upload
  },
});

/**
 * Delete a file from storage.
 */
export function deleteFile(filename: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const filePath = path.join(uploadDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) reject(err);
        else resolve();
      });
    } else {
      resolve();
    }
  });
}

/**
 * Get the full path to a stored file.
 */
export function getFilePath(filename: string): string {
  return path.join(uploadDir, filename);
}

/**
 * Check if a file exists in storage.
 */
export function fileExists(filename: string): boolean {
  return fs.existsSync(path.join(uploadDir, filename));
}
