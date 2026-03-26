import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { MaintenanceFilters, MaintenanceView } from "@/features/maintenance/types/maintenance";

export const maintenanceSliceKey = "maintenance";

const initialState: MaintenanceFilters = {
  activeOnly: true,
  search: "",
  view: "schedules",
};

const maintenanceSlice = createSlice({
  name: maintenanceSliceKey,
  initialState,
  reducers: {
    resetMaintenanceFilters() {
      return initialState;
    },
    setMaintenanceFilters(state, action: PayloadAction<Partial<MaintenanceFilters>>) {
      return { ...state, ...action.payload };
    },
    setMaintenanceView(state, action: PayloadAction<MaintenanceView>) {
      state.view = action.payload;
    },
  },
});

export const { resetMaintenanceFilters, setMaintenanceFilters, setMaintenanceView } =
  maintenanceSlice.actions;
export default maintenanceSlice.reducer;
