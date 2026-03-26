import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { TripFilters } from "@/features/trips/types/trip";

interface TripsState {
  filters: TripFilters;
  selectedTripId: number | null;
}

const initialState: TripsState = {
  filters: {
    search: "",
    status: "",
    tripType: "",
    activeOnly: true,
  },
  selectedTripId: null,
};

const tripsSlice = createSlice({
  name: "trips",
  initialState,
  reducers: {
    setTripFilters(state, action: PayloadAction<Partial<TripFilters>>) {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },
    resetTripFilters(state) {
      state.filters = initialState.filters;
    },
    setSelectedTripId(state, action: PayloadAction<number | null>) {
      state.selectedTripId = action.payload;
    },
  },
});

export const { resetTripFilters, setSelectedTripId, setTripFilters } = tripsSlice.actions;
export default tripsSlice.reducer;
