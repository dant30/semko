// frontend/src/core/auth/auth-guards.ts
import { getAccessToken, getStoredUser } from "./auth-session";

function decodeJwt<T = Record<string, unknown>>(token: string): T | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join("")
    );
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  const token = getAccessToken();
  if (!token) return false;

  const payload = decodeJwt<{ exp?: number }>(token);
  if (!payload || !payload.exp) return false;

  const nowSeconds = Math.floor(Date.now() / 1000);
  return payload.exp > nowSeconds;
}

export function getCurrentUser() {
  return getStoredUser();
}
