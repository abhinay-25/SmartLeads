import { useAuthStore, selectUser } from '@store/authStore';
import { ROLE_PERMISSIONS, type Permission } from '@config/rbac.config';
import type { UserRole } from '@/types/auth.types';

export const usePermissions = () => {
  const user = useAuthStore(selectUser);
  const role = user?.role;

  // Fallback to empty array if no user or role isn't mapped
  const permissions = role ? ROLE_PERMISSIONS[role] ?? [] : [];

  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission);
  };

  const isRole = (checkRole: UserRole): boolean => {
    return role === checkRole;
  };

  return {
    hasPermission,
    isRole,
    role,
  };
};
