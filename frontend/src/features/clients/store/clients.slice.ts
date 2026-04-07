import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ClientFilters } from "@/features/clients/types/client";

export const clientsSliceKey = "clients";

const initialState: ClientFilters = {
  search: "",
  clientType: "",
  status: "",
  activeOnly: true,
};

const clientsSlice = createSlice({
  name: clientsSliceKey,
  initialState,
  reducers: {
    resetClientsFilters() {
      return initialState;
    },
    setClientsFilters(state, action: PayloadAction<Partial<ClientFilters>>) {
      return { ...state, ...action.payload };
    },
  },
});

export const { resetClientsFilters, setClientsFilters } = clientsSlice.actions;
export default clientsSlice.reducer;
