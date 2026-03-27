import axios from "axios";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiClient } from "./client";
import { refreshAccessToken, registerApiInterceptors } from "./interceptors";
import { getAccessToken, getRefreshToken, persistSession } from "@/core/auth/auth-session";

function resetInterceptors() {
  (apiClient.interceptors.request.handlers as unknown as Array<unknown>) = [];
  (apiClient.interceptors.response.handlers as unknown as Array<unknown>) = [];
}

describe("API interceptor token refresh flow", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    resetInterceptors();
    localStorage.clear();
  });

  it("refreshAccessToken logs out when refresh token missing", async () => {
    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, href: "" },
    });

    const token = await refreshAccessToken();

    expect(token).toBeNull();
    expect(window.location.href).toBe("/login");

    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("refreshAccessToken persists new access token when refresh success", async () => {
    localStorage.setItem("semko_refresh_token", "refresh-x");
    localStorage.setItem("semko_user", JSON.stringify({ id: 5, username: "refresh-test" }));

    vi.spyOn(axios, "post").mockResolvedValue({ data: { access: "refresh-access" } });

    const token = await refreshAccessToken();

    expect(token).toBe("refresh-access");
    expect(getAccessToken()).toBe("refresh-access");
    expect(getRefreshToken()).toBe("refresh-x");
  });

  it("apiClient retries once with refreshed access after 401", async () => {
    // set initial expired access token and refresh token in localStorage.
    persistSession("old-token", "refresh-x", {
      id: 5,
      username: "refresh-user",
      email: "refresh@example.com",
    });

    let adapterCallCount = 0;

    apiClient.defaults.adapter = async (config) => {
      adapterCallCount += 1;
      if (adapterCallCount === 1) {
        const error = new Error("Unauthorized") as unknown as {
          response?: { status: number; data: Record<string, unknown>; config: unknown };
          config?: unknown;
        };
        error.response = {
          status: 401,
          data: { detail: "Token expired" },
          config,
        };
        error.config = config;
        throw error;
      }

      return {
        data: { ok: true },
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      };
    };

    vi.spyOn(axios, "post").mockResolvedValue({ data: { access: "new-token" } });

    registerApiInterceptors();

    const response = await apiClient.get("/protected");

    expect(response.data.ok).toBe(true);
    expect(adapterCallCount).toBe(2);
    expect(getAccessToken()).toBe("new-token");
    expect(axios.post).toHaveBeenCalledWith("/api/users/token/refresh/", { refresh: "refresh-x" });
  });
});
