import { Router } from 'express';
import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { sendSuccess } from '@utils/apiResponse';
import { v1Router } from './v1/index';

const DB_STATES = ['disconnected', 'connected', 'connecting', 'disconnecting'] as const;

const apiRouter = Router();

// ── Health check ───────────────────────────────────────────────────
apiRouter.get('/health', (_req: Request, res: Response) => {
  const dbState  = mongoose.connection.readyState as 0 | 1 | 2 | 3;
  const dbStatus = DB_STATES[dbState];

  sendSuccess(res, {
    status:    'ok',
    database:  dbStatus,
    uptime:    `${Math.floor(process.uptime())}s`,
    version:   process.env['npm_package_version'] ?? '1.0.0',
    timestamp: new Date().toISOString(),
  }, 'Service is healthy');
});

// ── Versioned routes ───────────────────────────────────────────────
apiRouter.use('/v1', v1Router);

export { apiRouter };
