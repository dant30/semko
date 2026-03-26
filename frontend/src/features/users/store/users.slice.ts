import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UserFilters } from "@/features/users/types/user";

export const usersSliceKey = "users";

const initialState: UserFilters = {
  activeOnly: true,
  search: "",
};

const usersSlice = createSlice({
  name: usersSliceKey,
  initialState,
  reducers: {
    resetUsersFilters() {
      return initialState;
    },
    setUsersFilters(state, action: PayloadAction<Partial<UserFilters>>) {
      return { ...state, ...action.payload };
    },
  },
});

export const { resetUsersFilters, setUsersFilters } = usersSlice.actions;
export default usersSlice.reducer;
