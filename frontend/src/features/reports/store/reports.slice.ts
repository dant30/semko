import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  PayrollPeriodRecord,
  PayrollPeriodSummaryPayload,
} from "@/features/reports/types/report";

export const reportsSliceKey = "reports";

interface ReportsState {
  periods: PayrollPeriodRecord[];
  selectedPeriodId: number | null;
  summary: PayrollPeriodSummaryPayload | null;
}

const initialState: ReportsState = {
  periods: [],
  selectedPeriodId: null,
  summary: null,
};

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    setPeriods(state, action: PayloadAction<PayrollPeriodRecord[]>) {
      state.periods = action.payload;
    },
    setSelectedPeriodId(state, action: PayloadAction<number | null>) {
      state.selectedPeriodId = action.payload;
    },
    setSummary(state, action: PayloadAction<PayrollPeriodSummaryPayload | null>) {
      state.summary = action.payload;
    },
  },
});

export const { setPeriods, setSelectedPeriodId, setSummary } = reportsSlice.actions;
export default reportsSlice.reducer;
