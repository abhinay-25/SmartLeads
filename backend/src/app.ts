import 'express-async-errors';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import { corsOptions } from '@config/cors.config';
import { rateLimiter } from '@middleware/rateLimiter.middleware';
import { requestIdMiddleware, requestLogger, notFoundHandler } from '@middleware/requestLogger.middleware';
import { errorHandler } from '@middleware/errorHandler.middleware';
import { apiRouter } from '@routes/index';

const app = express();

// ══════════════════════════════════════════════════════════════════
// Middleware Pipeline — ORDER MATTERS
// ══════════════════════════════════════════════════════════════════

// ── 1. Request ID (first — gives every log a correlatable ID) ────
app.use(requestIdMiddleware);

// ── 2. Security headers ──────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,  // handled by frontend SPA
  crossOriginEmbedderPolicy: false,
}));
app.use(cors(corsOptions));

// ── 3. Rate limiting (before parsing — saves CPU on flood attacks)
app.use(rateLimiter);

// ── 4. Body parsing ──────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// ── 5. Development HTTP logger (morgan) ──────────────────────────
if (process.env['NODE_ENV'] !== 'production') {
  app.use(morgan('dev'));
}

// ── 6. Structured request logger ─────────────────────────────────
app.use(requestLogger);

// ── 7. Application routes ─────────────────────────────────────────
app.use('/api', apiRouter);

// ── 8. 404 — must come after all routes ──────────────────────────
app.use(notFoundHandler);

// ── 9. Centralized error handler — MUST be last ──────────────────
app.use(errorHandler);

export default app;
