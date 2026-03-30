import { apiClient } from "@/core/api/client";
import type { DashboardSummaryPayload } from "@/features/dashboard/types/dashboard";

interface DashboardSummaryResponse {
  success: boolean;
  data: DashboardSummaryPayload;
}

export const dashboardApi = {
  async fetchSummary(): Promise<DashboardSummaryPayload> {
    const response = await apiClient.get<DashboardSummaryResponse>(
      "/core/dashboard/summary/"
    );

    if (!response.data.success) {
      throw new Error("Invalid dashboard summary response.");
    }

    return response.data.data;
  },
};
