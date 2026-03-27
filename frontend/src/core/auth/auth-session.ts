// frontend/src/core/auth/auth-session.ts
import type { AuthUser } from "@/core/types/auth";
import {
  getLocalValue,
  removeLocalValue,
  setLocalValue,
} from "@/core/storage/local-storage";

const ACCESS_TOKEN_KEY = "semko_access_token";
const REFRESH_TOKEN_KEY = "semko_refresh_token";
const USER_KEY = "semko_user";
const SESSION_EXPIRES_KEY = "semko_session_expires";

export function getAccessToken() {
  return getLocalValue(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return getLocalValue(REFRESH_TOKEN_KEY);
}

export function getStoredUser() {
  const raw = getLocalValue(USER_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function getSessionExpiry() {
  const raw = getLocalValue(SESSION_EXPIRES_KEY);
  if (!raw) return null;
  try {
    return new Date(raw);
  } catch {
    return null;
  }
}

export function persistSession(access: string, refresh: string, user?: AuthUser | null) {
  setLocalValue(ACCESS_TOKEN_KEY, access);
  setLocalValue(REFRESH_TOKEN_KEY, refresh);
  
  if (user) {
    setLocalValue(USER_KEY, JSON.stringify(user));
  }

  // Calculate and store session expiry (15 min from now for access token)
  // In a real app, extract from JWT payload
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  setLocalValue(SESSION_EXPIRES_KEY, expiresAt.toISOString());
}

export function isSessionExpired(): boolean {
  const expiry = getSessionExpiry();
  if (!expiry) return false;
  return new Date() >= expiry;
}

export function clearSession() {
  removeLocalValue(ACCESS_TOKEN_KEY);
  removeLocalValue(REFRESH_TOKEN_KEY);
  removeLocalValue(USER_KEY);
  removeLocalValue(SESSION_EXPIRES_KEY);
}
