import type { Request, Response } from 'express';
import * as leadService from '@services/lead.service';
import { sendSuccess, sendCreated, sendNoContent, sendPaginated } from '@utils/apiResponse';
import { asyncHandler } from '@utils/asyncHandler';
import type { CreateLeadInput, UpdateLeadInput, LeadsQueryInput } from '@validators/lead.validator';

// ─────────────────────────────────────────────────────────────────
// LeadController — thin HTTP adapter only.
//
// Architecture rules:
// 1. No business logic here — all logic lives in leadService
// 2. No manual query parsing — Zod validate() middleware already
//    parses, coerces, and validates req.query / req.body before
//    this controller runs. We just cast to the inferred type.
// 3. Consistent response format via sendSuccess/sendPaginated helpers
// ─────────────────────────────────────────────────────────────────

/** GET /api/v1/leads */
export const getLeads = asyncHandler(async (req: Request, res: Response) => {
  // req.query was already parsed + validated by validate(leadsQuerySchema, 'query')
  const query = req.query as unknown as LeadsQueryInput;
  const result = await leadService.findAllLeads(query);
  sendPaginated(res, result, 'Leads retrieved successfully');
});

/** GET /api/v1/leads/export */
export const exportLeads = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as LeadsQueryInput;
  const csvData = await leadService.exportLeadsToCSV(query);
  
  // Set headers for file download
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="leads_export.csv"');
  
  // Return raw CSV string instead of standard JSON wrapper
  res.status(200).send(csvData);
});

/** GET /api/v1/leads/stats */
export const getLeadStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await leadService.getLeadStats();
  sendSuccess(res, stats, 'Lead stats retrieved');
});

/** GET /api/v1/leads/:id */
export const getLeadById = asyncHandler(async (req: Request, res: Response) => {
  const lead = await leadService.findLeadById(req.params['id'] ?? '');
  sendSuccess(res, lead, 'Lead retrieved successfully');
});

/** POST /api/v1/leads */
export const createLead = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as CreateLeadInput;
  const lead  = await leadService.createLead(input);
  sendCreated(res, lead, 'Lead created successfully');
});

/** PATCH /api/v1/leads/:id */
export const updateLead = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as UpdateLeadInput;
  const lead  = await leadService.updateLead(req.params['id'] ?? '', input);
  sendSuccess(res, lead, 'Lead updated successfully');
});

/** DELETE /api/v1/leads/:id */
export const deleteLead = asyncHandler(async (req: Request, res: Response) => {
  await leadService.deleteLead(req.params['id'] ?? '');
  sendNoContent(res);
});

/** DELETE /api/v1/leads — bulk delete */
export const bulkDeleteLeads = asyncHandler(async (req: Request, res: Response) => {
  const { ids } = req.body as { ids: string[] };
  const deletedCount = await leadService.bulkDeleteLeads(ids);
  sendSuccess(res, { deletedCount }, `${deletedCount} lead${deletedCount !== 1 ? 's' : ''} deleted`);
});
