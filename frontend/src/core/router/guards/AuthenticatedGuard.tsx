import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";

import { useAuthContext } from "@/features/auth/store/AuthContext";

export function AuthenticatedGuard({ children }: PropsWithChildren) {
  const { isAuthenticated, loading } = useAuthContext();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
