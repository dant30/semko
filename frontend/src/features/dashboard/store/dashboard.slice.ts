// frontend/src/features/dashboard/store/dashboard.slice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DashboardMetric } from "@/features/dashboard/types/dashboard";

interface DashboardState {
  metrics: DashboardMetric[];
}

const initialState: DashboardState = {
  metrics: [],
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setMetrics(state, action: PayloadAction<DashboardMetric[]>) {
      state.metrics = action.payload;
    },
  },
});

export const { setMetrics } = dashboardSlice.actions;
export default dashboardSlice.reducer;
