import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { VehiclesFilters, VehicleView } from "@/features/vehicles/types/vehicle";

export const vehiclesSliceKey = "vehicles";

const initialState: VehiclesFilters = {
  activeOnly: true,
  ownershipType: "",
  search: "",
  status: "",
  view: "fleet",
};

const vehiclesSlice = createSlice({
  name: vehiclesSliceKey,
  initialState,
  reducers: {
    resetVehiclesFilters() {
      return initialState;
    },
    setVehiclesFilters(state, action: PayloadAction<Partial<VehiclesFilters>>) {
      return { ...state, ...action.payload };
    },
    setVehiclesView(state, action: PayloadAction<VehicleView>) {
      state.view = action.payload;
    },
  },
});

export const { resetVehiclesFilters, setVehiclesFilters, setVehiclesView } =
  vehiclesSlice.actions;
export default vehiclesSlice.reducer;
