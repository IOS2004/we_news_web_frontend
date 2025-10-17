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
  initialPayment: number;
  contributionAmount: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  planValidity: number; // days
  dailyEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  totalEarnings: number;
  features: string[];
  isActive: boolean;
  category?: "basic" | "standard" | "premium" | "vip";
  color?: string;
  gradient?: [string, string];
  popular?: boolean;
  createdAt: string;
}

export interface UserInvestment {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  frequency: "daily" | "weekly" | "monthly";
  initialPayment: number;
  contributionAmount: number;
  planValidity: number;
  startDate: string;
  expiryDate: string;
  nextContributionDate: string;
  totalContributions: number;
  missedContributions: number;
  contributionStreak: number;
  totalEarnings: number;
  investmentEarnings: number;
  referralEarnings: number;
  todayEarnings: number;
  withdrawableBalance: number;
  status: "active" | "paused" | "completed" | "cancelled";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Network/Referral data specific to this plan
  networkSize?: number;
  directReferrals?: number;
  totalReferrals?: number;
  activeReferrals?: number;

  // UI-specific fields
  color?: string;
  daysRemaining?: number;

  // Legacy support
  plan?: InvestmentPlan;
  amount?: number;
  endDate?: string;
  totalEarned?: number;
  lastPaidAt?: string;
  nextPaymentAt?: string;
  remainingDays?: number;
}

export interface InvestmentStats {
  totalInvested: number;
  totalEarnings: number;
  activeInvestments: number;
  totalReturns: number;
  monthlyReturns?: number;
  completedInvestments?: number;
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
   * Get all user's active investments (for multi-plan support)
   * Returns array of all active subscriptions
   */
  async getMyInvestments(): Promise<UserInvestment[]> {
    try {
      const response = await apiCall<
        ApiResponse<{
          investments?: UserInvestment[];
          investment?: UserInvestment;
        }>
      >(apiClient.get("/investment/my-investments"));

      // Handle different response formats
      if (response.data?.investments) {
        return response.data.investments;
      }

      // If backend returns single investment, wrap it
      if (response.data?.investment) {
        return [response.data.investment];
      }

      return [];
    } catch (error) {
      console.error("Error fetching user investments:", error);
      // Try fallback to singular endpoint
      try {
        const singleResponse = await this.getUserInvestments({ limit: 1 });
        return singleResponse.items || [];
      } catch {
        return [];
      }
    }
  }

  /**
   * Get investment by ID
   */
  async getInvestmentById(
    investmentId: string
  ): Promise<UserInvestment | null> {
    try {
      const response = await apiCall<
        ApiResponse<{ investment: UserInvestment }>
      >(apiClient.get(`/investment/${investmentId}`));
      return response.data?.investment || null;
    } catch (error) {
      console.error("Error fetching investment:", error);
      return null;
    }
  }

  /**
   * Calculate days remaining for an investment
   */
  calculateDaysRemaining(expiryDate: string | Date): number {
    const expiry =
      typeof expiryDate === "string" ? new Date(expiryDate) : expiryDate;
    const now = new Date();
    const daysRemaining = Math.ceil(
      (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.max(0, daysRemaining);
  }

  /**
   * Format investment data for UI display
   */
  formatInvestmentForUI(investment: UserInvestment): UserInvestment {
    const colorMapping: { [key: string]: string } = {
      base: "#3B82F6",
      bass: "#3B82F6",
      silver: "#9CA3AF",
      gold: "#F59E0B",
      diamond: "#8B5CF6",
      platinum: "#10B981",
      elite: "#DC2626",
    };

    const planKey = investment.planName?.toLowerCase() || "base";
    const color = colorMapping[planKey] || "#3B82F6";
    const daysRemaining = this.calculateDaysRemaining(investment.expiryDate);

    return {
      ...investment,
      color,
      daysRemaining,
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
        totalEarnings: 0,
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
    amount: number,
    frequency: "daily" | "weekly" | "monthly" = "daily"
  ): {
    daily: number;
    weekly: number;
    monthly: number;
    total: number;
  } {
    // Use the new structure with separate earnings
    const daily = plan.dailyEarnings || 0;
    const weekly = plan.weeklyEarnings || daily * 7;
    const monthly = plan.monthlyEarnings || daily * 30;
    const total = plan.totalEarnings || monthly * (plan.planValidity / 30);

    return {
      daily,
      weekly,
      monthly,
      total,
    };
  }
}

export const investmentService = new InvestmentService();
export default investmentService;
