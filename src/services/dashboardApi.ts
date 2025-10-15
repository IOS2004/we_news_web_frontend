import { apiClient, apiCall, ApiResponse } from './apiClient';

// Types
export interface DashboardOverview {
  user: {
    name: string;
    email: string;
    level: number;
    levelProgress: number;
  };
  wallet: {
    balance: number;
    totalEarnings: number;
    todayEarnings: number;
  };
  referrals: {
    total: number;
    active: number;
    directReferrals: number;
  };
  investment: {
    totalInvested: number;
    activeInvestments: number;
    totalReturns: number;
  };
  trading: {
    totalOrders: number;
    wonOrders: number;
    profit: number;
  };
  achievements: {
    totalEarned: number;
    level: number;
    badges: number;
  };
}

export interface QuickStats {
  todayEarnings: number;
  weekEarnings: number;
  monthEarnings: number;
  totalEarnings: number;
  activeReferrals: number;
  pendingWithdrawals: number;
  walletBalance: number;
}

export interface EarningsSummary {
  period: 'today' | 'week' | 'month';
  total: number;
  breakdown: {
    referrals: number;
    investment: number;
    daily: number;
    trading: number;
    other: number;
  };
  chart: {
    labels: string[];
    values: number[];
  };
}

export interface UserProgress {
  level: {
    current: number;
    next: number;
    progress: number; // 0-100
    experienceNeeded: number;
    currentExperience: number;
  };
  achievements: {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt?: string;
    progress?: number;
  }[];
  milestones: {
    id: string;
    title: string;
    description: string;
    reward: string;
    completed: boolean;
    completedAt?: string;
  }[];
}

// Dashboard API Service
class DashboardService {
  /**
   * Get comprehensive dashboard overview
   * Actual endpoint: GET /api/dashboard/overview
   */
  async getOverview(): Promise<DashboardOverview> {
    const response = await apiCall<ApiResponse<DashboardOverview>>(
      apiClient.get('/dashboard/overview')
    );
    return response.data!;
  }

  /**
   * Get quick statistics
   * Actual endpoint: GET /api/dashboard/stats
   */
  async getQuickStats(): Promise<QuickStats> {
    const response = await apiCall<ApiResponse<QuickStats>>(
      apiClient.get('/dashboard/stats')
    );
    return response.data!;
  }

  /**
   * Get earnings summary for a period
   * Actual endpoint: GET /api/dashboard/earnings?period=today|week|month
   */
  async getEarningsSummary(period: 'today' | 'week' | 'month' = 'today'): Promise<EarningsSummary> {
    const response = await apiCall<ApiResponse<EarningsSummary>>(
      apiClient.get('/dashboard/earnings', { params: { period } })
    );
    return response.data!;
  }

  /**
   * Get user progress (levels, achievements, milestones)
   * Actual endpoint: GET /api/dashboard/progress
   */
  async getUserProgress(): Promise<UserProgress> {
    const response = await apiCall<ApiResponse<UserProgress>>(
      apiClient.get('/dashboard/progress')
    );
    return response.data!;
  }

  /**
   * Get today's earnings breakdown
   */
  async getTodayEarnings(): Promise<EarningsSummary> {
    return this.getEarningsSummary('today');
  }

  /**
   * Get this week's earnings breakdown
   */
  async getWeekEarnings(): Promise<EarningsSummary> {
    return this.getEarningsSummary('week');
  }

  /**
   * Get this month's earnings breakdown
   */
  async getMonthEarnings(): Promise<EarningsSummary> {
    return this.getEarningsSummary('month');
  }

  /**
   * Refresh dashboard data
   * Fetches all dashboard data in parallel
   */
  async refreshDashboard(): Promise<{
    overview: DashboardOverview;
    stats: QuickStats;
    earnings: EarningsSummary;
    progress: UserProgress;
  }> {
    const [overview, stats, earnings, progress] = await Promise.all([
      this.getOverview(),
      this.getQuickStats(),
      this.getEarningsSummary('today'),
      this.getUserProgress(),
    ]);

    return { overview, stats, earnings, progress };
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
