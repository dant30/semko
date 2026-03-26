import { getAccessToken, getStoredUser } from "./auth-session";

export function isAuthenticated() {
  return Boolean(getAccessToken());
}

export function getCurrentUser() {
  return getStoredUser();
}
