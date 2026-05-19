import { Router } from 'express';
import * as leadController from '@controllers/lead.controller';
import { validate, validateObjectId } from '@middleware/validate.middleware';
import { authenticate, authorize } from '@middleware/auth.middleware';
import {
  createLeadSchema,
  updateLeadSchema,
  leadsQuerySchema,
} from '@validators/lead.validator';

/**
 * Leads router — /api/v1/leads
 *
 * ALL leads routes require authentication.
 * Apply router-level authenticate once instead of per-route.
 *
 * Route map:
 *   GET    /           — paginated + filtered list
 *   POST   /           — create lead
 *   DELETE /           — bulk delete (body: { ids })
 *   GET    /stats      — pipeline counts by status  (before /:id!)
 *   GET    /:id        — single lead
 *   PATCH  /:id        — partial update
 *   DELETE /:id        — delete single
 */

const leadsRouter = Router();

// Apply authentication to ALL leads routes at the router level
leadsRouter.use(authenticate);

// ── Collection routes ──────────────────────────────────────────────
leadsRouter
  .route('/')
  .get(authorize('admin', 'sales_user'), validate(leadsQuerySchema, 'query'), leadController.getLeads)
  .post(authorize('admin'),              validate(createLeadSchema),          leadController.createLead)
  .delete(authorize('admin'),                                                 leadController.bulkDeleteLeads);

// ── Stats (before /:id to avoid conflict) ─────────────────────────
leadsRouter.get('/stats', authorize('admin', 'sales_user'), leadController.getLeadStats);

// ── Export (before /:id) ──────────────────────────────────────────
leadsRouter.get('/export', authorize('admin'), validate(leadsQuerySchema, 'query'), leadController.exportLeads);

// ── Document routes ─────────────────────────────────────────────────
leadsRouter
  .route('/:id')
  .get(authorize('admin', 'sales_user'),   validateObjectId(),                               leadController.getLeadById)
  .patch(authorize('admin', 'sales_user'), validateObjectId(), validate(updateLeadSchema),   leadController.updateLead)
  .delete(authorize('admin'),              validateObjectId(),                               leadController.deleteLead);

export { leadsRouter };
