import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { MaterialFilters } from "@/features/materials/types/material";

interface MaterialsState {
  filters: MaterialFilters;
  selectedMaterialId: number | null;
}

const initialState: MaterialsState = {
  filters: {
    search: "",
    category: "",
    unitOfMeasure: "",
    activeOnly: true,
  },
  selectedMaterialId: null,
};

const materialsSlice = createSlice({
  name: "materials",
  initialState,
  reducers: {
    setMaterialsFilters(state, action: PayloadAction<Partial<MaterialFilters>>) {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },
    resetMaterialsFilters(state) {
      state.filters = initialState.filters;
    },
    setSelectedMaterialId(state, action: PayloadAction<number | null>) {
      state.selectedMaterialId = action.payload;
    },
  },
});

export const { resetMaterialsFilters, setMaterialsFilters, setSelectedMaterialId } =
  materialsSlice.actions;

export default materialsSlice.reducer;
