import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";

import { isAuthenticated } from "@/core/auth/auth-guards";

export function AuthenticatedGuard({ children }: PropsWithChildren) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
