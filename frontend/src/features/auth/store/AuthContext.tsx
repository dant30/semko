// frontend/src/features/auth/store/AuthContext.tsx
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useAppDispatch } from "@/core/store/hooks";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  persistSession,
  refreshSessionExpiry,
  isSessionExpired,
} from "@/core/auth/auth-session";
import { authApi } from "@/features/auth/services/auth.api";
import { setSession, clearAuth } from "@/features/auth/store/auth.slice";
import { AuthContext } from "@/features/auth/store/auth-context";
import type { AuthContextType } from "@/features/auth/store/auth-context";
import type { AuthUser, LoginPayload } from "@/core/types/auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const inactivityTimeoutRef = useRef<number | null>(null);
  const dispatch = useAppDispatch();

  // Initialize from stored session
  useEffect(() => {
    let active = true;

    async function initializeAuth() {
      const storedUser = getStoredUser();
      const accessToken = getAccessToken();
      const refreshToken = getRefreshToken();

      if (!accessToken) {
        if (active) {
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
        }
        return;
      }

      if (storedUser) {
        if (active) {
          setUser(storedUser);
          setIsAuthenticated(true);
          setLoading(false);
        }
        return;
      }

      try {
        if (active) {
          setLoading(true);
        }
        const currentUser = await authApi.fetchMe(accessToken);
        if (!active) {
          return;
        }

        setUser(currentUser);
        setIsAuthenticated(true);
        dispatch(
          setSession({
            access: accessToken,
            refresh: refreshToken || "",
            user: currentUser,
          })
        );
      } catch (error) {
        console.error("Failed to restore authenticated user session:", error);
        clearSession();
        dispatch(clearAuth());
        if (active) {
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void initializeAuth();

    return () => {
      active = false;
    };
  }, [dispatch]);

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
    if (inactivityTimeoutRef.current !== null) {
      window.clearTimeout(inactivityTimeoutRef.current);
      inactivityTimeoutRef.current = null;
    }

    clearSession();
    dispatch(clearAuth());
    setUser(null);
    setIsAuthenticated(false);
  }, [dispatch]);

  // Inactivity tracking: log out after 15 minutes without user activity.
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const EVENTS = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "wheel",
    ] as const;

    const resetTimer = () => {
      if (isSessionExpired()) {
        logout();
        return;
      }

      refreshSessionExpiry();
      if (inactivityTimeoutRef.current !== null) {
        window.clearTimeout(inactivityTimeoutRef.current);
      }

      inactivityTimeoutRef.current = window.setTimeout(() => {
        logout();
      }, 15 * 60 * 1000);
    };

    const handleActivity = () => resetTimer();

    EVENTS.forEach((eventName) => window.addEventListener(eventName, handleActivity, { passive: true }));

    resetTimer();

    const expiryCheck = window.setInterval(() => {
      if (isSessionExpired()) {
        logout();
      }
    }, 60 * 1000);

    return () => {
      if (inactivityTimeoutRef.current !== null) {
        window.clearTimeout(inactivityTimeoutRef.current);
        inactivityTimeoutRef.current = null;
      }
      window.clearInterval(expiryCheck);
      EVENTS.forEach((eventName) => window.removeEventListener(eventName, handleActivity));
    };
  }, [isAuthenticated, logout]);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
