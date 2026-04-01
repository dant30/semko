import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export const payrollSliceKey = "payroll";

export interface PayrollState {
  selectedPayrollPeriodId: number | null;
}

const initialState: PayrollState = {
  selectedPayrollPeriodId: null,
};

const payrollSlice = createSlice({
  name: payrollSliceKey,
  initialState,
  reducers: {
    setSelectedPayrollPeriodId(state, action: PayloadAction<number | null>) {
      state.selectedPayrollPeriodId = action.payload;
    },
    clearSelectedPayrollPeriodId(state) {
      state.selectedPayrollPeriodId = null;
    },
  },
});

export const { setSelectedPayrollPeriodId, clearSelectedPayrollPeriodId } = payrollSlice.actions;
export default payrollSlice.reducer;
