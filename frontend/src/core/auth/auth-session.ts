import type { AuthUser } from "@/core/types/auth";
import {
  getLocalValue,
  removeLocalValue,
  setLocalValue,
} from "@/core/storage/local-storage";

const ACCESS_TOKEN_KEY = "semko_access_token";
const REFRESH_TOKEN_KEY = "semko_refresh_token";
const USER_KEY = "semko_user";

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

export function persistSession(access: string, refresh: string, user?: AuthUser | null) {
  setLocalValue(ACCESS_TOKEN_KEY, access);
  setLocalValue(REFRESH_TOKEN_KEY, refresh);
  if (user) {
    setLocalValue(USER_KEY, JSON.stringify(user));
  }
}

export function clearSession() {
  removeLocalValue(ACCESS_TOKEN_KEY);
  removeLocalValue(REFRESH_TOKEN_KEY);
  removeLocalValue(USER_KEY);
}
