import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";

import { getUserPermissions, hasAnyPermission } from "@/core/auth/permission-utils";
import { useAppSelector } from "@/core/store/hooks";
import { appRoutes } from "@/core/constants/routes";

interface PermissionGuardProps extends PropsWithChildren {
  requiredPermissions?: string[];
}

export function PermissionGuard({
  children,
  requiredPermissions,
}: PermissionGuardProps) {
  const user = useAppSelector((state) => state.auth.user);
  const userPermissions = getUserPermissions(user);

  if (!hasAnyPermission(userPermissions, requiredPermissions)) {
    return <Navigate replace to={appRoutes.unauthorized} />;
  }

  return children;
}
