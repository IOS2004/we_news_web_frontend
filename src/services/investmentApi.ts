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
   * Get network data for a specific investment (level-wise breakdown)
   * Note: Backend doesn't have /investment/:id/network endpoint
   * Using /referrals/tree instead which provides network data
   * @param investmentId - Investment ID (currently not used as backend returns all referrals)
   */
  async getInvestmentNetwork(_investmentId: string): Promise<any> {
    try {
      // Use referrals/tree endpoint instead since investment/:id/network doesn't exist
      const response = await apiCall<ApiResponse<any>>(
        apiClient.get('/referrals/tree', { params: { levels: 15 } })
      );
      
      const backendData = response.data || {};
      const tree = backendData.tree || [];
      
      // Transform tree structure into level-wise breakdown
      const levelsMap = new Map<number, any>();
      
      const processTreeNode = (node: any) => {
        if (!node || !node.user) return;
        
        const level = node.level || 1;
        
        if (!levelsMap.has(level)) {
          levelsMap.set(level, {
            level,
            totalMembers: 0,
            activeMembers: 0,
            members: [],
            earnings: 0,
          });
        }
        
        const levelData = levelsMap.get(level)!;
        levelData.totalMembers++;
        
        if (node.user.isActive || node.user.status === 'active') {
          levelData.activeMembers++;
        }
        
        levelData.members.push({
          id: node.user.id,
          username: node.user.username || 'Unknown',
          firstName: node.user.firstName || '',
          lastName: node.user.lastName || '',
          email: node.user.email || '',
          phoneNumber: node.user.phoneNumber || '',
          joinedAt: node.user.createdAt || new Date(),
          isActive: node.user.isActive || node.user.status === 'active',
          referralCode: node.user.referralCode || '',
          totalReferrals: node.referral?.totalReferrals || 0,
          commissionEarned: node.referral?.commissionEarnings || 0,
        });
        
        levelData.earnings += node.referral?.commissionEarnings || 0;
        
        // Process downline recursively
        if (node.downline && Array.isArray(node.downline)) {
          node.downline.forEach(processTreeNode);
        }
      };
      
      // Process all tree nodes
      tree.forEach(processTreeNode);
      
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
        tree, // Keep original tree structure
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
}

export const investmentService = new InvestmentService();
export default investmentService;
