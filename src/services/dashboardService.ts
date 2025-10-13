import api from "./api";
import type { DashboardStats, ApiResponse } from "@/types";

export const dashboardService = {
  // Get dashboard stats
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<ApiResponse<DashboardStats>>(
      "/dashboard/stats"
    );
    return response.data.data!;
  },

  // Get earnings summary
  async getEarningsSummary(
    period: "today" | "week" | "month" | "all" = "all"
  ): Promise<{
    total: number;
    byCategory: Record<string, number>;
  }> {
    const response = await api.get<ApiResponse<any>>("/dashboard/earnings", {
      params: { period },
    });
    return response.data.data!;
  },
};
