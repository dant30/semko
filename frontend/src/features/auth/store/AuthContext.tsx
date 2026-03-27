import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAppDispatch } from "@/core/store/hooks";
import { clearSession, getAccessToken, getStoredUser, persistSession } from "@/core/auth/auth-session";
import { authApi } from "@/features/auth/services/auth.api";
import { setSession, clearAuth } from "@/features/auth/store/auth.slice";
import type { AuthUser, LoginPayload } from "@/core/types/auth";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize from stored session
  useEffect(() => {
    const storedUser = getStoredUser();
    const token = getAccessToken();

    if (token && storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }

    setLoading(false);
  }, []);

  const dispatch = useAppDispatch();

  // Login handler
  const login = useCallback(async (payload: LoginPayload) => {
    setLoading(true);
    try {
      const response = await authApi.login(payload);

      if (!response.access || !response.refresh) {
        throw new Error("Invalid response from server: missing tokens");
      }

      // Ensure we always have a user object; fallback to /users/me
      const user =
        response.user ||
        (await authApi.fetchMe(response.access).catch((err) => {
          console.warn("Failed to fetch profile after login:", err);
          return null;
        }));

      // Persist session with performed and verified data
      persistSession(response.access, response.refresh, user);

      dispatch(
        setSession({
          access: response.access,
          refresh: response.refresh,
          user,
        })
      );

      setUser(user || null);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login failed:", error);
      clearSession();
      dispatch(clearAuth());
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  // Logout handler
  const logout = useCallback(() => {
    clearSession();
    dispatch(clearAuth());
    setUser(null);
    setIsAuthenticated(false);
  }, [dispatch]);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuthContext - Access authentication context
 * Must be used within AuthProvider
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within the AuthProvider");
  }
  return context;
}
