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
  // Core fields from backend
  id: string;
  userId: string;
  planId: string;
  planName: string;
  investmentAmount: number;
  validity: number; // Plan validity in days (from backend)
  startDate: string | any; // Can be Firestore Timestamp
  expiryDate: string | any; // Can be Firestore Timestamp
  currentLevel: number;
  totalReferrals: number;
  totalEarnings: number;
  lastPayoutDate: string | any; // Can be Firestore Timestamp
  isActive: boolean;
  status: "active" | "paused" | "completed" | "cancelled";
  createdAt: string | any;
  updatedAt: string | any;
  
  // Plan-based referral ID (new structure)
  purchaseReferralId?: string; // Format: userid-planid-increment
  myReferralCode?: string; // Format: u0001g0001 (short memorable code)

  // Optional fields that may or may not exist
  frequency?: "daily" | "weekly" | "monthly";
  initialPayment?: number;
  contributionAmount?: number;
  planValidity?: number; // Alias for validity
  nextContributionDate?: string;
  totalContributions?: number;
  missedContributions?: number;
  contributionStreak?: number;
  investmentEarnings?: number;
  referralEarnings?: number;
  todayEarnings?: number;
  withdrawableBalance?: number;

  // Network/Referral data specific to this plan
  networkSize?: number;
  directReferrals?: number;
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
    try {
      const response = await apiCall<
        ApiResponse<{
          investment: UserInvestment | null;
          pagination?: any;
        }>
      >(apiClient.get("/investment/my-investment", { params }));

      // Backend returns single investment, wrap in array for consistency
      const hasInvestment = !!response.data?.investment;
      return {
        items: hasInvestment ? [response.data!.investment!] : [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: hasInvestment ? 1 : 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    } catch (error) {
      console.error("Error fetching user investment:", error);
      // Return empty result instead of throwing
      return {
        items: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }
  }

  /**
   * Get all user's active investments (for multi-plan support)
   * Returns array of all active subscriptions
   * Actual endpoint: GET /api/investment/my-investment (singular)
   */
  async getMyInvestments(): Promise<UserInvestment[]> {
    try {
      const response = await apiCall<
        ApiResponse<{
          investments?: UserInvestment[];
          investment?: UserInvestment | null;
        }>
      >(apiClient.get("/investment/my-investment"));

      // Handle different response formats
      if (response.data?.investments) {
        return response.data.investments;
      }

      // If backend returns single investment, wrap it
      if (response.data?.investment) {
        return [response.data.investment];
      }

      // No investment found (null or undefined)
      return [];
    } catch (error) {
      console.error("Error fetching user investments:", error);
      // Return empty array instead of throwing
      return [];
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
  calculateDaysRemaining(expiryDate: string | Date | any): number {
    try {
      let expiry: Date;
      
      // Handle Firestore Timestamp object with toDate method
      if (expiryDate && typeof expiryDate === 'object' && typeof expiryDate.toDate === 'function') {
        expiry = expiryDate.toDate();
      }
      // Handle Firestore Timestamp object with _seconds (raw format from API)
      else if (expiryDate && typeof expiryDate === 'object' && '_seconds' in expiryDate) {
        expiry = new Date(expiryDate._seconds * 1000);
      }
      // Handle string date
      else if (typeof expiryDate === "string") {
        expiry = new Date(expiryDate);
      } 
      // Handle Date object
      else if (expiryDate instanceof Date) {
        expiry = expiryDate;
      } 
      // Default fallback
      else {
        return 0;
      }
      
      // Validate that we have a valid date
      if (isNaN(expiry.getTime())) {
        return 0;
      }
      
      const now = new Date();
      const daysRemaining = Math.ceil(
        (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      return Math.max(0, daysRemaining);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Format investment data for UI display
   */
  formatInvestmentForUI = (investment: UserInvestment): UserInvestment => {
    const colorMapping: { [key: string]: string } = {
      base: "#3B82F6",
      bass: "#3B82F6",
      silver: "#9CA3AF",
      gold: "#F59E0B",
      diamond: "#8B5CF6",
      platinum: "#10B981",
      elite: "#DC2626",
    };

    const normalizeToDate = (value: unknown): Date | null => {
      try {
        if (!value) return null;
        if (value instanceof Date) return value;
        if (typeof value === "string" || typeof value === "number") {
          const parsed = new Date(value);
          return isNaN(parsed.getTime()) ? null : parsed;
        }
        if (typeof value === "object") {
          const maybeDate = value as { toDate?: () => Date; _seconds?: number; seconds?: number };
          if (typeof maybeDate.toDate === "function") {
            const parsed = maybeDate.toDate();
            return isNaN(parsed.getTime()) ? null : parsed;
          }
          const seconds = maybeDate._seconds ?? maybeDate.seconds;
          if (typeof seconds === "number") {
            const parsed = new Date(seconds * 1000);
            return isNaN(parsed.getTime()) ? null : parsed;
          }
        }
        return null;
      } catch {
        return null;
      }
    };

    const planKey = investment.planName?.toLowerCase() || "base";
    const color = colorMapping[planKey] || "#3B82F6";
    const validity = investment.validity ?? investment.planValidity ?? 0;

    const normalizedStart = normalizeToDate(investment.startDate) ?? normalizeToDate(investment.createdAt);
    let normalizedExpiry = normalizeToDate(investment.expiryDate);

    if (!normalizedExpiry && normalizedStart && validity > 0) {
      normalizedExpiry = new Date(normalizedStart.getTime() + validity * 24 * 60 * 60 * 1000);
    }

    const today = new Date();
    const elapsedMs = normalizedStart ? today.getTime() - normalizedStart.getTime() : 0;
    const elapsedDays = normalizedStart ? Math.max(0, Math.floor(elapsedMs / (24 * 60 * 60 * 1000))) : 0;

    const daysRemaining = normalizedExpiry
      ? this.calculateDaysRemaining(normalizedExpiry)
      : Math.max(0, validity - elapsedDays);

    return {
      ...investment,
      color,
      validity,
      startDate: normalizedStart ?? investment.startDate,
      expiryDate: normalizedExpiry ?? investment.expiryDate,
      daysRemaining,
      totalContributions: investment.totalContributions ?? 0,
      contributionStreak: investment.contributionStreak ?? 0,
      networkSize: investment.networkSize ?? investment.totalReferrals ?? 0,
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
   * Get network data for a specific investment (level-wise breakdown)
   * Uses the plan-specific chain-tree endpoint which respects plan's numberOfLevels
   * @param planId - Investment Plan ID
   */
  async getInvestmentNetwork(planId: string): Promise<any> {
    try {
      // Use chain-tree endpoint which reads upline/downline from user document
      // This respects the plan's actual numberOfLevels (e.g., Platinum = 11 levels)
      const response = await apiCall<ApiResponse<any>>(
        apiClient.get(`/investment/chain-tree/${planId}`)
      );
      
      const backendData = response.data || {};
      const downline = backendData.downline || {};
      
      // Transform downline structure into level-wise breakdown
      const levelsMap = new Map<number, any>();
      
      // Process downline levels (C1, C2, C3, etc.)
      Object.keys(downline).forEach(levelKey => {
        const levelNum = parseInt(levelKey.replace('C', ''));
        const members = downline[levelKey] || [];
        
        levelsMap.set(levelNum, {
          level: levelNum,
          totalMembers: members.length,
          activeMembers: members.filter((m: any) => m.isActive !== false).length,
          members: members.map((member: any) => ({
            id: member.userId,
            username: member.username || 'Unknown',
            firstName: member.firstName || '',
            lastName: member.lastName || '',
            email: member.email || '',
            phoneNumber: member.phoneNumber || '',
            joinedAt: member.joinedAt || new Date(),
            isActive: member.isActive !== false,
            referralCode: member.purchaseReferralId || '',
            totalReferrals: 0,
            commissionEarned: 0,
          })),
          earnings: 0,
        });
      });
      
      // Convert map to sorted array
      const levels = Array.from(levelsMap.values()).sort((a, b) => a.level - b.level);
      
      const totalMembers = backendData.totalDownlineUsers || levels.reduce((sum, l) => sum + l.totalMembers, 0);
      const activeMembers = levels.reduce((sum, l) => sum + l.activeMembers, 0);
      const totalEarnings = levels.reduce((sum, l) => sum + l.earnings, 0);
      
      return {
        investment: null, // Not provided by backend
        levels,
        summary: {
          totalMembers,
          activeMembers,
          totalLevels: levels.length,
          totalEarnings,
          referralEarnings: totalEarnings,
        },
        downline, // Keep original downline structure
        upline: backendData.upline || {}, // Keep original upline structure
      };
    } catch (error) {
      console.error('Error fetching network data:', error);
      return { 
        investment: null,
        levels: [], 
        summary: {
          totalMembers: 0,
          activeMembers: 0,
          totalLevels: 0,
          totalEarnings: 0,
          referralEarnings: 0,
        },
        tree: [],
      };
    }
  }

  /**
   * Get full chain tree for a plan (C1, C2, C3, etc.)
   */
  async getChainTree(planId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/investment/chain-tree/${planId}`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to fetch chain tree');
    } catch (error) {
      console.error('Error fetching chain tree:', error);
      throw error;
    }
  }

  /**
   * Calculate potential returns for a plan
   */
  calculateReturns(plan: InvestmentPlan): {
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

  /**
   * Get level rewards status for an investment
   * Actual endpoint: GET /api/investment/levels-status/:investmentId
   */
  async getLevelsStatus(investmentId: string): Promise<{
    investmentId: string;
    userId: string;
    planName: string;
    planKey: string;
    currentLevel: number;
    activeLevel: number;
    highestClaimedLevel: number;
  levelSchemaVersion: number;
    totalLevels: number;
    elapsedDays: number;
    totalReferrals: number;
    startDate: string | null;
    currentLevelInfo: any;
    nextLevelInfo: any;
    claimableLevelsCount: number;
    claimableLevels: any[];
    allLevels: any[];
  }> {
    const response = await apiCall<ApiResponse<any>>(
      apiClient.get(`/investment/levels-status/${investmentId}`)
    );
    return response.data!;
  }

  /**
   * Claim level rewards
   * Actual endpoint: POST /api/investment/claim-level
   */
  async claimLevelRewards(data: {
    investmentId: string;
    levels: number[];
  }): Promise<{
    previousLevel: number;
    newLevel: number;
    levelsClaimed: number[];
    totalReward: number;
    newBalance: number;
  }> {
    const response = await apiCall<ApiResponse<any>>(
      apiClient.post("/investment/claim-level", data),
      {
        showLoading: true,
        showSuccess: true,
        successMessage: "Level rewards claimed successfully!",
      }
    );
    return response.data!;
  }
}

export const investmentService = new InvestmentService();
export default investmentService;
