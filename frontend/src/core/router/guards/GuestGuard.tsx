import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";

import { isAuthenticated } from "@/core/auth/auth-guards";

export function GuestGuard({ children }: PropsWithChildren) {
  if (isAuthenticated()) {
    return <Navigate to="/app/dashboard" replace />;
  }
  return children;
}
