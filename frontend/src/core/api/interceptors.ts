import { apiClient } from "./client";
import { getAccessToken } from "@/core/auth/auth-session";

/**
 * Register global API interceptors for handling authentication, CORS, and errors.
 *
 * Request interceptor:
 * - Automatically adds Bearer token to Authorization header.
 *
 * Response interceptor:
 * - Passes successful responses through.
 * - Handles error responses with proper logging and hints for CORS issues.
 */
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
  // Response Interceptor: Handle errors and CORS issues
  // ========================================================================
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle CORS errors (no response received, typically a browser CORS block)
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
          userMessage: "Unable to connect to API. Please check your connection and try again.",
        });
      }

      // Handle HTTP errors with specific logic
      const { status, data } = error.response;

      // Unauthorized (401): Token may be expired or invalid
      if (status === 401) {
        console.warn("Unauthorized (401): Token may be expired or invalid.");
        // TODO: Trigger token refresh or redirect to login if needed
      }

      // Forbidden (403): User lacks permission
      if (status === 403) {
        console.warn("Forbidden (403): User lacks permission to access this resource.");
      }

      return Promise.reject(error);
    }
  );
}
