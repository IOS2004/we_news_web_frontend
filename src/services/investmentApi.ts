import {
  apiClient,
  apiCall,
  ApiResponse,
  PaginatedResponse,
} from "./apiClient";

// Types
export interface InvestmentPlan {
  id: string;
  name: string;
  description: string;
  amount: number;
  duration: number; // in days
  dailyReturn: number;
  totalReturn: number;
  features: string[];
  isActive: boolean;
  category: "basic" | "standard" | "premium" | "vip";
  minInvestment?: number;
  maxInvestment?: number;
  riskLevel: "low" | "medium" | "high";
  createdAt: string;
}

export interface UserInvestment {
  id: string;
  userId: string;
  planId: string;
  plan: InvestmentPlan;
  amount: number;
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "cancelled";
  totalEarned: number;
  lastPaidAt?: string;
  nextPaymentAt?: string;
  remainingDays: number;
  createdAt: string;
}

export interface InvestmentStats {
  totalInvested: number;
  activeInvestments: number;
  totalReturns: number;
  monthlyReturns: number;
  completedInvestments: number;
  averageROI: number;
}

// Investment Plans API Service
class InvestmentService {
  /**
   * Get all available investment plans
   */
  async getPlans(params?: {
    category?: "basic" | "standard" | "premium" | "vip";
    isActive?: boolean;
  }): Promise<InvestmentPlan[]> {
    const response = await apiCall<ApiResponse<{ plans: InvestmentPlan[] }>>(
      apiClient.get("/investment/plans", { params })
    );
    return response.data!.plans;
  }

  /**
   * Get specific plan details
   * Note: Backend returns all plans; filter client-side by ID
   */
  async getPlanById(planId: string): Promise<InvestmentPlan> {
    const plans = await this.getPlans();
    const plan = plans.find((p) => p.id === planId);
    if (!plan) {
      throw new Error("Plan not found");
    }
    return plan;
  }

  /**
   * Purchase an investment plan
   * Actual endpoint: POST /api/investment/purchase
   */
  async purchasePlan(data: {
    planId: string;
    amount: number;
  }): Promise<UserInvestment> {
    const response = await apiCall<ApiResponse<{ investment: UserInvestment }>>(
      apiClient.post("/investment/purchase", data),
      {
        showLoading: true,
        showSuccess: true,
        successMessage: "Investment plan purchased successfully!",
      }
    );
    return response.data!.investment;
  }

  /**
   * Get user's current investment
   * Actual endpoint: GET /api/investment/my-investment (singular, not plural)
   */
  async getUserInvestments(params?: {
    page?: number;
    limit?: number;
    status?: "active" | "completed" | "cancelled";
  }): Promise<PaginatedResponse<UserInvestment>> {
    const response = await apiCall<
      ApiResponse<{
        investment: UserInvestment;
        pagination: any;
      }>
    >(apiClient.get("/investment/my-investment", { params }));

    // Backend returns single investment, wrap in array for consistency
    return {
      items: response.data!.investment ? [response.data!.investment] : [],
      pagination: response.data!.pagination || {
        page: 1,
        limit: 1,
        total: response.data!.investment ? 1 : 0,
      },
    };
  }

  /**
   * Get investment statistics
   * Note: Backend may not have this endpoint; derive from my-investment
   */
  async getStats(): Promise<InvestmentStats> {
    try {
      const response = await apiCall<ApiResponse<InvestmentStats>>(
        apiClient.get("/investment/my-investment")
      );
      return response.data!;
    } catch {
      // Fallback if endpoint doesn't exist
      return {
        totalInvested: 0,
        activeInvestments: 0,
        totalReturns: 0,
        monthlyReturns: 0,
        completedInvestments: 0,
        averageROI: 0,
      };
    }
  }

  /**
   * Claim daily earnings
   * Actual endpoint: POST /api/investment/claim-daily
   */
  async claimDailyEarnings(): Promise<any> {
    const response = await apiCall<ApiResponse<any>>(
      apiClient.post("/investment/claim-daily"),
      {
        showLoading: true,
        showSuccess: true,
        successMessage: "Daily earnings claimed successfully!",
      }
    );
    return response.data!;
  }

  /**
   * Get daily earning status
   * Actual endpoint: GET /api/investment/daily-status
   */
  async getDailyStatus(): Promise<any> {
    const response = await apiCall<ApiResponse<any>>(
      apiClient.get("/investment/daily-status")
    );
    return response.data!;
  }

  /**
   * Cancel an investment
   * Note: No cancel endpoint found in backend
   */
  async cancelInvestment(_investmentId: string): Promise<void> {
    // TODO: Backend doesn't have cancel endpoint
    // May need admin intervention
    throw new Error(
      "Investment cancellation requires admin approval. Please contact support."
    );
  }

  /**
   * Get investment earnings history
   * Use earnings API instead
   */
  async getEarnings(params?: {
    investmentId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<any>> {
    const response = await apiCall<
      ApiResponse<{
        earnings: any[];
        pagination: any;
      }>
    >(apiClient.get("/earnings/daily", { params }));

    return {
      items: response.data!.earnings || [],
      pagination: response.data!.pagination,
    };
  }

  /**
   * Get level structure
   * Actual endpoint: GET /api/investment/levels
   */
  async getLevels(): Promise<any> {
    const response = await apiCall<ApiResponse<any>>(
      apiClient.get("/investment/levels")
    );
    return response.data!;
  }

  /**
   * Calculate potential returns for a plan
   */
  calculateReturns(
    plan: InvestmentPlan,
    amount: number
  ): {
    daily: number;
    weekly: number;
    monthly: number;
    total: number;
  } {
    const dailyReturn = (amount * plan.dailyReturn) / 100;
    const totalReturn = (amount * plan.totalReturn) / 100;

    return {
      daily: dailyReturn,
      weekly: dailyReturn * 7,
      monthly: dailyReturn * 30,
      total: totalReturn,
    };
  }
}

export const investmentService = new InvestmentService();
export default investmentService;
