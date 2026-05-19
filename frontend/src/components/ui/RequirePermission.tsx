import { ReactNode } from 'react';
import { usePermissions } from '@hooks/usePermissions';
import type { Permission } from '@config/rbac.config';

interface RequirePermissionProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Conditionally renders children if the current user has the required permission.
 * Otherwise, renders nothing (or the optional fallback).
 */
export const RequirePermission = ({
  permission,
  children,
  fallback = null,
}: RequirePermissionProps) => {
  const { hasPermission } = usePermissions();

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
