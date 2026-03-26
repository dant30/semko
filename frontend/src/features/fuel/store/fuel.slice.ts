import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { FuelFilters, FuelView } from "@/features/fuel/types/fuel";

export const fuelSliceKey = "fuel";

const initialState: FuelFilters = {
  activeOnly: true,
  search: "",
  view: "transactions",
};

const fuelSlice = createSlice({
  name: fuelSliceKey,
  initialState,
  reducers: {
    resetFuelFilters() {
      return initialState;
    },
    setFuelFilters(state, action: PayloadAction<Partial<FuelFilters>>) {
      return { ...state, ...action.payload };
    },
    setFuelView(state, action: PayloadAction<FuelView>) {
      state.view = action.payload;
    },
  },
});

export const { resetFuelFilters, setFuelFilters, setFuelView } = fuelSlice.actions;
export default fuelSlice.reducer;
