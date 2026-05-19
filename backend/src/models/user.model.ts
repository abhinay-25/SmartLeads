import { Schema, model } from 'mongoose';
import type { Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { BaseDocument } from './base.model';
import type { UserRole } from '../types/index';

// ── Interface ─────────────────────────────────────────────────────

/**
 * IUser describes a user document stored in MongoDB.
 *
 * Design decisions:
 * - Password is never returned in API responses (select: false)
 * - comparePassword is an instance method — keeps the service clean
 * - isActive flag enables soft-disable without deletion
 */
export interface IUser extends BaseDocument {
  name:       string;
  email:      string;
  password:   string;   // bcrypt hash — never exposed via API
  role:       UserRole;
  isActive:   boolean;
  lastLogin?: Date | undefined;

  // Instance method
  comparePassword(candidate: string): Promise<boolean>;
}

// ── Schema ────────────────────────────────────────────────────────

const userSchema = new Schema<IUser>(
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
      unique:    true,        // Enforced at DB level — catches race conditions
      lowercase: true,
      trim:      true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please enter a valid email address',
      ],
    },

    password: {
      type:      String,
      required:  [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select:    false,   // ← CRITICAL: never returned by .find() / .findOne()
    },

    role: {
      type:    String,
      enum:    {
        values:  ['admin', 'sales_user'] satisfies UserRole[],
        message: '{VALUE} is not a valid role',
      },
      default: 'sales_user',
    },

    isActive: {
      type:    Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,

    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        const r = ret as Record<string, unknown>;
        delete r['password'];   // extra safety — select:false handles DB level
        delete r['__v'];
        return r;
      },
    },

    toObject: { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────
// Note: email unique index is already created by { unique: true } in the schema field.
// Only add additional non-schema indexes here.
userSchema.index({ role: 1 });  // fast RBAC queries

// ── Pre-save: hash password only when it changes ──────────────────
/**
 * Using pre-save (not pre-validate) so we hash the final validated password.
 * bcrypt rounds: 12 is the industry standard in 2024 (~250ms on modern hardware).
 * Do NOT use more than 14 — it becomes a DoS vector.
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const SALT_ROUNDS = 12;
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  next();
});

// ── Instance method: safe password comparison ─────────────────────
/**
 * Uses bcrypt.compare — constant-time comparison that defeats timing attacks.
 * Never compare passwords with === or other naive string comparison.
 */
userSchema.methods['comparePassword'] = async function (
  this: IUser,
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

// ── Model ─────────────────────────────────────────────────────────
type UserModel = Model<IUser>;
export const User: UserModel = model<IUser>('User', userSchema);
