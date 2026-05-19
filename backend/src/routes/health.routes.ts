import { Router } from 'express';
import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { sendSuccess } from '@utils/apiResponse';

const healthRouter = Router();

healthRouter.get('/', (_req: Request, res: Response) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState] ?? 'unknown';

  sendSuccess(res, {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus,
    version: process.env['npm_package_version'] ?? '1.0.0',
  });
});

export { healthRouter };
