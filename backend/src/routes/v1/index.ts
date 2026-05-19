import { Router } from 'express';
import { authRouter }  from './auth.routes';
import { leadsRouter } from './leads.routes';

/**
 * Version 1 router — mounted at /api/v1 in the root apiRouter.
 *
 * Route map:
 *   /api/v1/auth/*   → authRouter
 *   /api/v1/leads/*  → leadsRouter
 */
const v1Router = Router();

v1Router.use('/auth',  authRouter);
v1Router.use('/leads', leadsRouter);

export { v1Router };
