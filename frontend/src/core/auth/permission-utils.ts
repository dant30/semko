// frontend/src/core/auth/permission-utils.ts
import type { AuthUser } from "@/core/types/auth";

export function getUserPermissions(user?: AuthUser | null) {
  if (user?.is_superuser) {
    return ["*"];
  }

  if (user?.effective_permissions?.length) {
    return user.effective_permissions;
  }

  return user?.role?.permissions || [];
}

export function hasPermission(userPermissions: string[], required: string) {
  return userPermissions.includes("*") || userPermissions.includes(required);
}

export function hasAnyPermission(
  userPermissions: string[] | undefined,
  requiredPermissions?: string[]
) {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }
  const permissions = userPermissions || [];
  if (permissions.includes("*")) {
    return true;
  }
  return requiredPermissions.some((permission) => permissions.includes(permission));
}
