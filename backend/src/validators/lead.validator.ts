import { z } from 'zod';

// ── Shared primitives ─────────────────────────────────────────────

export const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId format');

// ── Lead-specific enum schemas (reused in query + mutation) ───────

const leadStatusEnum  = z.enum(['new', 'contacted', 'qualified', 'converted', 'lost']);
const leadSourceEnum  = z.enum(['website', 'instagram', 'referral', 'social', 'email', 'other']);
const sortShorthand   = z.enum(['latest', 'oldest']);

// ── Base pagination fields (flat object — no .transform here) ─────
// Keeping this as a plain object schema so it can be merged cleanly.

const paginationFields = {
  page:      z.coerce.number().int().min(1).default(1),
  limit:     z.coerce.number().int().min(1).max(100).default(10),
  sortBy:    z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
};

/**
 * Standalone pagination schema (for non-lead resources in future).
 * sort shorthand is mapped in the leadsQuerySchema transform.
 */
export const paginationQuerySchema = z.object(paginationFields);

// ── Combined query schema ─────────────────────────────────────────
/**
 * leadsQuerySchema — validates GET /api/v1/leads query params.
 *
 * Supports all filter combinations:
 *   ?status=qualified&source=instagram&search=Rahul&page=2&sort=latest
 *
 * sort shorthand:
 *   sort=latest  → sortBy=createdAt, sortOrder=desc
 *   sort=oldest  → sortBy=createdAt, sortOrder=asc
 *
 * Explicit sort fields are also supported for future use:
 *   ?sortBy=name&sortOrder=asc
 */
export const leadsQuerySchema = z
  .object({
    ...paginationFields,
    // Sort shorthand — overrides sortBy/sortOrder when provided
    sort:       sortShorthand.optional(),
    // Search — matched against name and email with case-insensitive $regex
    search:     z.string().trim().max(200).optional(),
    // Exact enum filters
    status:     leadStatusEnum.optional(),
    source:     leadSourceEnum.optional(),
    // Free-text filters (also $regex in service)
    company:    z.string().trim().max(100).optional(),
    assignedTo: z.string().optional(),
    // Date range — ISO 8601 strings
    startDate:  z.string().optional(),
    endDate:    z.string().optional(),
  })
  .transform((data) => {
    // Map sort shorthand to canonical sortBy + sortOrder
    const sortBy    = data.sort === 'oldest' ? 'createdAt' : data.sortBy ?? 'createdAt';
    const sortOrder = data.sort === 'oldest' ? ('asc' as const)
                    : data.sort === 'latest' ? ('desc' as const)
                    : data.sortOrder;
    return { ...data, sortBy, sortOrder };
  });

// ── Lead mutations ────────────────────────────────────────────────

export const createLeadSchema = z.object({
  name:       z.string().trim().min(1, 'Name is required').max(100),
  email:      z.string().email('Invalid email address').toLowerCase(),
  phone:      z.string().trim().max(20).optional(),
  company:    z.string().trim().max(100).optional(),
  status:     leadStatusEnum.default('new'),
  source:     leadSourceEnum,
  notes:      z.string().trim().max(2000).optional(),
  assignedTo: z.string().optional(),
});

/**
 * updateLeadSchema — partial update, at least one field required.
 *
 * Built from a SEPARATE base WITHOUT .default() values.
 * Reason: createLeadSchema has status.default('new'). If we do
 * createLeadSchema.partial(), Zod still applies the default during
 * parsing, so {} becomes { status: 'new' } and the refine passes.
 * The fix: use a defaults-free base for the update schema.
 */
const updateLeadBase = z.object({
  name:       z.string().trim().min(1).max(100),
  email:      z.string().email().toLowerCase(),
  phone:      z.string().trim().max(20),
  company:    z.string().trim().max(100),
  status:     leadStatusEnum,   // no .default() here
  source:     leadSourceEnum,
  notes:      z.string().trim().max(2000),
  assignedTo: z.string(),
});

export const updateLeadSchema = updateLeadBase.partial().refine(
  // Use .some() on values — more robust than key count
  (data) => Object.values(data).some((v) => v !== undefined),
  { message: 'At least one field must be provided for update' }
);

export const bulkDeleteSchema = z.object({
  ids: z
    .array(objectIdSchema)
    .min(1, 'At least one ID is required')
    .max(100, 'Cannot delete more than 100 leads at once'),
});

// ── Inferred types ────────────────────────────────────────────────

export type CreateLeadInput  = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput  = z.infer<typeof updateLeadSchema>;
export type LeadsQueryInput  = z.infer<typeof leadsQuerySchema>;
export type BulkDeleteInput  = z.infer<typeof bulkDeleteSchema>;
