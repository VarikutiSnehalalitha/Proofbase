import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { config } from './config';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import profileRoutes from './routes/profile';
import sharingRoutes from './routes/sharing';
import collectionRoutes from './routes/collections';
import analyticsRoutes from './routes/analytics';
import discoverRoutes from './routes/discover';
import settingsRoutes from './routes/settings';

const app = express();

// ─── Security Middleware ─────────────────────────────────────────────────

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Visitor-Id'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many auth attempts, please try again later' },
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ─── Body Parsing ────────────────────────────────────────────────────────

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Session ─────────────────────────────────────────────────────────────

app.use(session({
  name: 'proofbase.sid',
  secret: config.session.secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.nodeEnv === 'production',
    httpOnly: true,
    maxAge: config.session.maxAge,
    sameSite: config.nodeEnv === 'production' ? 'strict' : 'lax',
  },
}));

// ─── API Routes ──────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/projects', sharingRoutes);  // Shares are under /api/projects/:id/share
app.use('/api/share', sharingRoutes);     // Also /api/share/access/:token
app.use('/api/collections', collectionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/discover', discoverRoutes);
app.use('/api/settings', settingsRoutes);

// ─── Health Check ────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Error Handling ──────────────────────────────────────────────────────

app.use('/api/*', notFoundHandler);
app.use(errorHandler);

import { ensureDatabase } from './config/embeddedDb';

// ─── Start Server ────────────────────────────────────────────────────────

ensureDatabase().finally(() => {
  app.listen(config.port, () => {
    console.log(`\n🚀 Proofbase API running at http://localhost:${config.port}`);
    console.log(`   Environment: ${config.nodeEnv}`);
    console.log(`   Frontend URL: ${config.frontendUrl}\n`);
  });
});

export default app;
