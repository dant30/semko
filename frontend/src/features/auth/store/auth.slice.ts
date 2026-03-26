import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  persistSession,
} from "@/core/auth/auth-session";
import type { AuthUser } from "@/core/types/auth";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
}

const initialState: AuthState = {
  user: getStoredUser(),
  accessToken: getAccessToken(),
  refreshToken: getRefreshToken(),
  status: getAccessToken() ? "authenticated" : "unauthenticated",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession(
      state,
      action: PayloadAction<{
        access: string;
        refresh: string;
        user?: AuthUser | null;
      }>
    ) {
      state.accessToken = action.payload.access;
      state.refreshToken = action.payload.refresh;
      state.user = action.payload.user || null;
      state.status = "authenticated";
      persistSession(
        action.payload.access,
        action.payload.refresh,
        action.payload.user || null
      );
    },
    clearAuth(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.status = "unauthenticated";
      clearSession();
    },
    updateUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      persistSession(state.accessToken || "", state.refreshToken || "", action.payload);
    },
    setAuthLoading(state) {
      state.status = "loading";
    },
  },
});

export const { setSession, clearAuth, updateUser, setAuthLoading } = authSlice.actions;
export default authSlice.reducer;
