import {
  apiClient,
  apiCall,
  ApiResponse,
  PaginatedResponse,
} from "./apiClient";

// Types
export interface DailyEarning {
  id: string;
  userId: string;
  amount: number;
  source:
    | "referral"
    | "investment"
    | "daily_login"
    | "trading"
    | "task"
    | "bonus";
  description: string;
  date: string;
  status: "pending" | "credited";
  createdAt: string;
}

export interface TodayEarning {
  total: number;
  breakdown: {
    referral: number;
    investment: number;
    daily_login: number;
    trading: number;
    task: number;
    bonus: number;
  };
  transactions: DailyEarning[];
}

export interface EarningsSummary {
  startDate: string;
  endDate: string;
  total: number;
  bySource: {
    [key: string]: number;
  };
  dailyBreakdown: {
    date: string;
    amount: number;
  }[];
}

export interface UserLevel {
  currentLevel: number;
  nextLevel: number;
  currentExperience: number;
  experienceNeeded: number;
  progress: number; // 0-100
  levelBenefits: string[];
  nextLevelBenefits: string[];
}

export interface LevelReward {
  level: number;
  rewards: {
    coins?: number;
    bonus?: number;
    features?: string[];
  };
  claimed: boolean;
}

export interface EarningsStats {
  totalEarnings: number;
  todayEarnings: number;
  weekEarnings: number;
  monthEarnings: number;
  averageDaily: number;
  highestDaily: number;
  currentStreak: number;
  longestStreak: number;
  bySource: {
    [key: string]: number;
  };
}

// Earnings API Service
class EarningsService {
  /**
   * Get daily earnings with pagination
   * Actual endpoint: GET /api/earnings/daily?page=1&limit=20&source=...
   */
  async getDailyEarnings(params?: {
    page?: number;
    limit?: number;
    source?: string;
  }): Promise<PaginatedResponse<DailyEarning>> {
    const response = await apiCall<
      ApiResponse<{
        earnings: DailyEarning[];
        pagination: any;
      }>
    >(apiClient.get("/earnings/daily", { params }));

    return {
      items: response.data!.earnings || [],
      pagination: response.data!.pagination,
    };
  }

  /**
   * Get today's earnings
   * Actual endpoint: GET /api/earnings/today
   */
  async getTodayEarnings(): Promise<TodayEarning> {
    const response = await apiCall<ApiResponse<TodayEarning>>(
      apiClient.get("/earnings/today")
    );
    return response.data!;
  }

  /**
   * Get earnings summary for date range
   * Actual endpoint: GET /api/earnings/summary?startDate=...&endDate=...
   */
  async getEarningsSummary(
    startDate: string,
    endDate: string
  ): Promise<EarningsSummary> {
    const response = await apiCall<ApiResponse<EarningsSummary>>(
      apiClient.get("/earnings/summary", { params: { startDate, endDate } })
    );
    return response.data!;
  }

  /**
   * Get user level and rewards
   * Actual endpoint: GET /api/earnings/level
   */
  async getUserLevel(): Promise<UserLevel> {
    const response = await apiCall<ApiResponse<UserLevel>>(
      apiClient.get("/earnings/level")
    );
    return response.data!;
  }

  /**
   * Add experience points
   * Actual endpoint: POST /api/earnings/experience
   */
  async addExperience(data: {
    amount: number;
    source?: string;
    description?: string;
  }): Promise<any> {
    const response = await apiCall<ApiResponse<any>>(
      apiClient.post("/earnings/experience", data),
      {
        showLoading: false,
        showSuccess: false,
      }
    );
    return response.data!;
  }

  /**
   * Get level rewards
   * Actual endpoint: GET /api/earnings/rewards
   */
  async getLevelRewards(): Promise<LevelReward[]> {
    const response = await apiCall<ApiResponse<{ rewards: LevelReward[] }>>(
      apiClient.get("/earnings/rewards")
    );
    return response.data!.rewards || [];
  }

  /**
   * Process daily login reward
   * Actual endpoint: POST /api/earnings/daily-login
   */
  async processDailyLoginReward(): Promise<any> {
    const response = await apiCall<ApiResponse<any>>(
      apiClient.post("/earnings/daily-login"),
      {
        showLoading: false,
        showSuccess: true,
        successMessage: "Daily login reward claimed!",
      }
    );
    return response.data!;
  }

  /**
   * Get earnings statistics
   * Actual endpoint: GET /api/earnings/stats
   */
  async getEarningsStats(): Promise<EarningsStats> {
    const response = await apiCall<ApiResponse<EarningsStats>>(
      apiClient.get("/earnings/stats")
    );
    return response.data!;
  }

  /**
   * Get this week's earnings summary
   */
  async getWeekSummary(): Promise<EarningsSummary> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    return this.getEarningsSummary(
      startDate.toISOString(),
      endDate.toISOString()
    );
  }

  /**
   * Get this month's earnings summary
   */
  async getMonthSummary(): Promise<EarningsSummary> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(1); // First day of month

    return this.getEarningsSummary(
      startDate.toISOString(),
      endDate.toISOString()
    );
  }

  /**
   * Get earnings by source
   */
  async getEarningsBySource(
    source: string,
    params?: {
      page?: number;
      limit?: number;
    }
  ): Promise<PaginatedResponse<DailyEarning>> {
    return this.getDailyEarnings({ ...params, source });
  }
}

export const earningsService = new EarningsService();
export default earningsService;
