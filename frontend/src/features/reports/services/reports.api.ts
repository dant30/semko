import { apiClient } from "@/core/api/client";
import { endpoints } from "@/core/api/endpoints";
import type {
  PayrollPeriodRecord,
  PayrollPeriodSummaryPayload,
} from "@/features/reports/types/report";

export const reportsApi = {
  async fetchPayrollPeriods(): Promise<PayrollPeriodRecord[]> {
    const response = await apiClient.get<PayrollPeriodRecord[]>(endpoints.reports.payrollPeriods);
    return response.data ?? [];
  },

  async fetchPayrollPeriodSummary(
    payrollPeriodId: number
  ): Promise<PayrollPeriodSummaryPayload> {
    const response = await apiClient.get<PayrollPeriodSummaryPayload>(
      endpoints.reports.payrollPeriodSummary(payrollPeriodId)
    );
    return response.data;
  },

  async exportPayrollPeriodCsv(payrollPeriodId: number): Promise<Blob> {
    const response = await apiClient.get<Blob>(
      endpoints.reports.payrollPeriodExport(payrollPeriodId),
      {
        responseType: "blob",
      }
    );
    return response.data;
  },
};
