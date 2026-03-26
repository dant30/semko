import { apiClient } from "./client";
import { getAccessToken } from "@/core/auth/auth-session";

export function registerApiInterceptors() {
  apiClient.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  apiClient.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
  );
}
