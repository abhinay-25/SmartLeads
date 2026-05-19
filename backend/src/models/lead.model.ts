import type { LeadStatus, LeadSource } from '../types/index';
import { Schema, model } from 'mongoose';
import type { Model } from 'mongoose';
import type { BaseDocument } from './base.model';

// ── Interfaces ────────────────────────────────────────────────────

export interface ILead extends BaseDocument {
  name:        string;
  email:       string;
  phone?:      string;
  company?:    string;
  status:      LeadStatus;
  source:      LeadSource;
  notes?:      string;
  assignedTo?: string;
}

// ── Schema ────────────────────────────────────────────────────────

const leadSchema = new Schema<ILead>(
  {
    name: {
      type:      String,
      required:  [true, 'Name is required'],
      trim:      true,
      maxlength: [100, 'Name must be 100 characters or less'],
    },
    email: {
      type:      String,
      required:  [true, 'Email is required'],
      lowercase: true,
      trim:      true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please enter a valid email address',
      ],
    },
    phone: {
      type:      String,
      trim:      true,
      maxlength: [20, 'Phone must be 20 characters or less'],
    },
    company: {
      type:      String,
      trim:      true,
      maxlength: [100, 'Company must be 100 characters or less'],
    },
    status: {
      type:    String,
      enum:    {
        values:  ['new', 'contacted', 'qualified', 'converted', 'lost'],
        message: '{VALUE} is not a valid status',
      },
      default: 'new',
    },
    source: {
      type:    String,
      enum:    {
        values:  ['website', 'instagram', 'referral', 'social', 'email', 'other'],
        message: '{VALUE} is not a valid source',
      },
      required: [true, 'Source is required'],
    },
    notes: {
      type:      String,
      trim:      true,
      maxlength: [2000, 'Notes must be 2000 characters or less'],
    },
    assignedTo: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        const r = ret as Record<string, unknown>;
        delete r['__v'];
        return r;
      },
    },
    toObject: { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────
/**
 * Index strategy:
 *
 * 1. Compound (status, createdAt) — covers the most common query pattern:
 *    "list leads by status, sorted newest first"
 *
 * 2. Compound (source, createdAt) — covers source filtering with sort.
 *
 * 3. Compound (status, source, createdAt) — covers combined filter queries
 *    like ?status=qualified&source=instagram, sorted newest first.
 *
 * 4. createdAt DESC — supports sort-only queries (no filter).
 *
 * 5. assignedTo + createdAt — future: "leads assigned to me" + sort.
 *
 * NOTE: We intentionally do NOT use a $text index.
 * Reason: MongoDB $text index requires exact word matches and doesn't support
 * substring/partial search (e.g. "Rah" won't match "Rahul").
 * Instead, we use case-insensitive $regex on name + email fields.
 * For production scale (>100k docs), migrate to Atlas Search / Elasticsearch.
 */
leadSchema.index({ status: 1, createdAt: -1 });
leadSchema.index({ source: 1, createdAt: -1 });
leadSchema.index({ status: 1, source: 1, createdAt: -1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ assignedTo: 1, createdAt: -1 });

// ── Virtual ───────────────────────────────────────────────────────
leadSchema.virtual('displayName').get(function (this: ILead) {
  return this.company ? `${this.name} (${this.company})` : this.name;
});

// ── Model ─────────────────────────────────────────────────────────
type LeadModel = Model<ILead>;
export const Lead: LeadModel = model<ILead>('Lead', leadSchema);
