// frontend/src/features/auth/services/auth.api.ts
import axios from "axios";

import { apiClient } from "@/core/api/client";
import { endpoints } from "@/core/api/endpoints";
import { API_BASE_URL } from "@/core/constants/app";
import type { AuthUser, LoginPayload, LoginResponse } from "@/core/types/auth";

export const authApi = {
  async login(payload: LoginPayload) {
    const response = await apiClient.post<LoginResponse>(endpoints.auth.login, payload);
    return response.data;
  },
  async fetchMe(accessToken: string) {
    const response = await axios.get<AuthUser>(`${API_BASE_URL}${endpoints.auth.me}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  },
  async updateProfile(payload: Partial<Pick<AuthUser, "first_name" | "last_name" | "email" | "phone_number">>) {
    const response = await apiClient.patch<AuthUser>(endpoints.auth.me, payload);
    return response.data;
  },
  async changePassword(payload: { old_password: string; new_password: string; new_password_confirm: string; }) {
    const response = await apiClient.post(endpoints.auth.passwordChange, payload);
    return response.data;
  },
  async forgotPassword(payload: { email: string }) {
    const response = await apiClient.post(endpoints.auth.passwordForgot, payload);
    return response.data;
  },
  async resetPassword(payload: { uid: string; token: string; new_password: string; new_password_confirm: string; }) {
    const response = await apiClient.post(endpoints.auth.passwordReset, payload);
    return response.data;
  },
};
