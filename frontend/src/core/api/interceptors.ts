// frontend/src/core/api/interceptors.ts
import axios, { AxiosError, AxiosResponse } from "axios";
import { apiClient } from "./client";
import { getAccessToken, clearSession, getRefreshToken } from "@/core/auth/auth-session";
import { API_BASE_URL } from "@/core/constants/app";

/**
 * Register global API interceptors for handling authentication, token refresh, CORS, and errors.
 *
 * Request interceptor:
 * - Automatically adds Bearer token to Authorization header.
 *
 * Response interceptor:
 * - Passes successful responses through.
 * - On 401: Attempts to refresh token using refresh token and retries request.
 * - Handles error responses with proper logging and hints for CORS issues.
 */

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (value?: unknown) => void;
}> = [];

const processQueue = (
  error: unknown,
  token: string | null = null
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  isRefreshing = false;
  failedQueue = [];
};

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearSession();
    window.location.href = "/login";
    return null;
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/users/token/refresh/`, {
      refresh: refreshToken,
    });

    const { access } = response.data;
    if (access) {
      // Update local storage with new access token
      const user = JSON.parse(localStorage.getItem("semko_user") || "null");
      const settings = await import("@/core/auth/auth-session");
      settings.persistSession(access, refreshToken, user);
      return access;
    }
  } catch (error) {
    console.error("Token refresh failed:", error);
    clearSession();
    window.location.href = "/login";
    return null;
  }

  return null;
}

export function registerApiInterceptors() {
  // ========================================================================
  // Request Interceptor: Add authentication token
  // ========================================================================
  apiClient.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Ensure CORS-friendly headers
    config.headers["Content-Type"] = "application/json";
    return config;
  });

  // ========================================================================
  // Response Interceptor: Handle errors and auto-refresh on 401
  // ========================================================================
  apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as any;

      // Handle CORS errors (no response received)
      if (!error.response) {
        if (error.message === "Network Error") {
          console.error(
            "API Network Error - possible CORS issue. Ensure backend allows this origin.",
            {
              origin: window.location.origin,
              errorDetails: error,
            }
          );
        }
        return Promise.reject({
          ...error,
          isCorsError: true,
          userMessage:
            "Unable to connect to API. Please check your connection and try again.",
        });
      }

      const { status, data } = error.response;

      // Handle Unauthorized (401): Attempt token refresh
      if (status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: (token: unknown) => {
                if (token) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                  resolve(apiClient(originalRequest));
                } else {
                  reject(error);
                }
              },
              reject,
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const newToken = await refreshAccessToken();
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return apiClient(originalRequest);
        } else {
          processQueue(error);
          clearSession();
          window.location.href = "/login";
          return Promise.reject(error);
        }
      }

      // Forbidden (403): User lacks permission
      if (status === 403) {
        console.warn("Forbidden (403): User lacks permission to access this resource.");
      }

      return Promise.reject(error);
    }
  );
}

