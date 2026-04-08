// frontend/src/features/auth/hooks/useAuth.ts
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearSession, getAccessToken, getStoredUser } from "@/core/auth/auth-session";
import type { AuthUser } from "@/core/types/auth";

/**
 * useAuth - Get current authenticated user and loading state
 * Returns user data, loading state, and authentication status
 */
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    const storedUser = getStoredUser();

    if (token && storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }

    setLoading(false);
  }, []);

  return {
    user,
    loading,
    isAuthenticated,
  };
}

/**
 * useAuthStatus - Check if user is authenticated
 * Simpler hook for just checking auth status
 */
export function useAuthStatus() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  return { isAuthenticated, loading };
}

/**
 * useLogout - Logout functionality
 * Clears session and redirects to login page
 */
export function useLogout() {
  const navigate = useNavigate();

  const logout = useCallback(() => {
    clearSession();
    navigate("/login", { replace: true });
  }, [navigate]);

  const logoutWithRedirect = useCallback(
    (redirectTo: string = "/login") => {
      clearSession();
      navigate(redirectTo, { replace: true });
    },
    [navigate]
  );

  return { logout, logoutWithRedirect };
}

/**
 * useRequireAuth - Protect a component requiring authentication
 * Redirects to login if not authenticated
 */
export function useRequireAuth() {
  const { isAuthenticated, loading } = useAuthStatus();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  return { isAuthenticated, loading };
}
