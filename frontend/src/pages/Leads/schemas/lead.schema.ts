import { z } from 'zod';

export const leadStatusEnum = z.enum(['new', 'contacted', 'qualified', 'converted', 'lost']);
export const leadSourceEnum = z.enum(['website', 'instagram', 'referral', 'social', 'email', 'other']);

export const leadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),
  
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .toLowerCase(),
  
  phone: z
    .string()
    .trim()
    .max(20, 'Phone must be 20 characters or less')
    .optional()
    .or(z.literal('')), // allows empty string instead of just undefined
  
  company: z
    .string()
    .trim()
    .max(100, 'Company must be 100 characters or less')
    .optional()
    .or(z.literal('')),
  
  status: leadStatusEnum.default('new'),
  source: leadSourceEnum,
  
  notes: z
    .string()
    .trim()
    .max(2000, 'Notes must be 2000 characters or less')
    .optional()
    .or(z.literal('')),
});

export type LeadFormData = z.infer<typeof leadSchema>;
