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
  metrics: [
    { label: "Trips Today", value: "24", tone: "success" },
    { label: "Open Requisitions", value: "6", tone: "warning" },
    { label: "Fuel Cost Today", value: "KES 182,400", tone: "default" },
    { label: "Overdue Maintenance", value: "3", tone: "danger" },
  ],
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
