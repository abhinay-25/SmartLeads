import type { UserRole } from '@/types/auth.types';

/**
 * Domain-specific permission strings.
 * This abstracts away the concept of a "role" in the UI.
 * The UI only asks "Does the user have this permission?", making it 
 * incredibly easy to add new roles or change role capabilities later.
 */
export type Permission =
  | 'leads:view'
  | 'leads:create'
  | 'leads:edit'
  | 'leads:delete'
  | 'leads:export'
  | 'dashboard:all';

/**
 * The single source of truth mapping roles to their capabilities.
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'leads:view',
    'leads:create',
    'leads:edit',
    'leads:delete',
    'leads:export',
    'dashboard:all',
  ],
  sales_user: [
    'leads:view',
    'leads:edit',
    // Deliberately omitting leads:create, leads:delete, dashboard:all
  ],
};
