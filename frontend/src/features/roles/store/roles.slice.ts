import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RoleFilters } from "@/features/roles/types/role";

export const rolesSliceKey = "roles";

const initialState: RoleFilters = {
  search: "",
};

const rolesSlice = createSlice({
  name: rolesSliceKey,
  initialState,
  reducers: {
    resetRolesFilters() {
      return initialState;
    },
    setRolesFilters(state, action: PayloadAction<Partial<RoleFilters>>) {
      return { ...state, ...action.payload };
    },
  },
});

export const { resetRolesFilters, setRolesFilters } = rolesSlice.actions;
export default rolesSlice.reducer;
