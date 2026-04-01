import { apiClient } from "@/core/api/client";
import { endpoints } from "@/core/api/endpoints";
import type {
  PayrollPeriodCreatePayload,
  PayrollPeriodRecord,
} from "@/features/payroll/types/payroll";

export const payrollApi = {
  async fetchPayrollPeriods(): Promise<PayrollPeriodRecord[]> {
    const response = await apiClient.get<PayrollPeriodRecord[]>(endpoints.payroll.periods);
    return response.data ?? [];
  },

  async createPayrollPeriod(
    payload: PayrollPeriodCreatePayload
  ): Promise<PayrollPeriodRecord> {
    const response = await apiClient.post<PayrollPeriodRecord>(endpoints.payroll.periods, payload);
    return response.data;
  },

  async generatePayrollFromTrips(payrollPeriodId: number): Promise<void> {
    await apiClient.post(endpoints.payroll.generatePayrollFromTrips(payrollPeriodId));
  },

  async approvePayrollPeriod(payrollPeriodId: number): Promise<void> {
    await apiClient.post(endpoints.payroll.approvePayrollPeriod(payrollPeriodId));
  },

  async lockPayrollPeriod(payrollPeriodId: number): Promise<void> {
    await apiClient.post(endpoints.payroll.lockPayrollPeriod(payrollPeriodId));
  },
};
