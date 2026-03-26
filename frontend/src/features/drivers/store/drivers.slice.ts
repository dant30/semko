import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { DriversFilters, DriverView } from "@/features/drivers/types/driver";

export const driversSliceKey = "drivers";

const initialState: DriversFilters = {
  activeOnly: true,
  employmentStatus: "",
  licenseStatus: "",
  search: "",
  view: "register",
};

const driversSlice = createSlice({
  name: driversSliceKey,
  initialState,
  reducers: {
    resetDriversFilters() {
      return initialState;
    },
    setDriversFilters(state, action: PayloadAction<Partial<DriversFilters>>) {
      return { ...state, ...action.payload };
    },
    setDriversView(state, action: PayloadAction<DriverView>) {
      state.view = action.payload;
    },
  },
});

export const { resetDriversFilters, setDriversFilters, setDriversView } =
  driversSlice.actions;
export default driversSlice.reducer;
