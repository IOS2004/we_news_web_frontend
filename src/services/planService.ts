import api from "./api";
import type { InvestmentPlan, UserInvestment, ApiResponse } from "@/types";

export const planService = {
  // Get all available plans
  async getPlans(): Promise<InvestmentPlan[]> {
    const response = await api.get<ApiResponse<InvestmentPlan[]>>("/plans");
    return response.data.data!;
  },

  // Get user's investments
  async getUserInvestments(): Promise<UserInvestment[]> {
    const response = await api.get<ApiResponse<UserInvestment[]>>(
      "/plans/my-investments"
    );
    return response.data.data!;
  },

  // Purchase a plan
  async purchasePlan(planId: string): Promise<UserInvestment> {
    const response = await api.post<ApiResponse<UserInvestment>>(
      `/plans/${planId}/purchase`
    );
    return response.data.data!;
  },

  // Get investment details
  async getInvestmentDetails(investmentId: string): Promise<UserInvestment> {
    const response = await api.get<ApiResponse<UserInvestment>>(
      `/plans/investments/${investmentId}`
    );
    return response.data.data!;
  },
};
