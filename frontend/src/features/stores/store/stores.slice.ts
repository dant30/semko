import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { StoresFilters, StoreView } from "@/features/stores/types/store";

export const storesSliceKey = "stores";

const initialState: StoresFilters = {
  activeOnly: true,
  reorderOnly: false,
  search: "",
  view: "items",
};

const storesSlice = createSlice({
  name: storesSliceKey,
  initialState,
  reducers: {
    resetStoresFilters() {
      return initialState;
    },
    setStoresFilters(state, action: PayloadAction<Partial<StoresFilters>>) {
      return { ...state, ...action.payload };
    },
    setStoresView(state, action: PayloadAction<StoreView>) {
      state.view = action.payload;
    },
  },
});

export const { resetStoresFilters, setStoresFilters, setStoresView } = storesSlice.actions;
export default storesSlice.reducer;
