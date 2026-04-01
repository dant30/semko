import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";

import { useAuthContext } from "@/features/auth/store/auth-context";

export function GuestGuard({ children }: PropsWithChildren) {
  const { isAuthenticated, loading } = useAuthContext();

  if (loading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
}
