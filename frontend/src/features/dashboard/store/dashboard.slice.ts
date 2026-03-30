import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface DashboardMetric {
  label: string;
  value: string;
  tone?: "default" | "success" | "warning" | "danger";
}

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
