import apiClient, { apiCall } from "./apiClient";

// Types
export interface Reward {
  _id: string;
  name: string;
  description: string;
  type: "subscription" | "voucher" | "badge" | "cash" | "bonus";
  pointsRequired: number;
  value?: number;
  image?: string;
  isActive: boolean;
  expiryDays?: number;
  stock?: number;
  createdAt: string;
}

export interface Achievement {
  _id: string;
  name: string;
  description: string;
  category: "trading" | "referral" | "earnings" | "engagement" | "milestone";
  icon: string;
  points: number;
  requirement: {
    type: string;
    target: number;
  };
  progress?: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  createdAt: string;
}

export interface UserPoints {
  totalPoints: number;
  availablePoints: number;
  usedPoints: number;
  lifetimePoints: number;
}

export interface RewardRedemption {
  _id: string;
  userId: string;
  rewardId: string;
  reward: Reward;
  pointsSpent: number;
  status: "pending" | "completed" | "failed" | "expired";
  redemptionCode?: string;
  redeemedAt: string;
  expiresAt?: string;
}

export interface PointsTransaction {
  _id: string;
  userId: string;
  type: "earn" | "spend" | "bonus" | "refund";
  amount: number;
  source: string;
  description: string;
  referenceId?: string;
  createdAt: string;
}

export interface RewardsStats {
  totalPointsEarned: number;
  totalPointsSpent: number;
  availablePoints: number;
  rewardsRedeemed: number;
  achievementsUnlocked: number;
  totalAchievements: number;
  completionPercentage: number;
  rank?: string;
  nextRankPoints?: number;
}

// API Methods
export const rewardsApi = {
  // Get user points balance
  getPoints: async () => {
    return apiCall<UserPoints>(apiClient.get("/rewards/points"));
  },

  // Get points transaction history
  getPointsHistory: async (page: number = 1, limit: number = 20) => {
    return apiCall<{
      transactions: PointsTransaction[];
      total: number;
      page: number;
      pages: number;
    }>(apiClient.get(`/rewards/points/history?page=${page}&limit=${limit}`));
  },

  // Get all available rewards
  getRewards: async (filters?: {
    type?: string;
    minPoints?: number;
    maxPoints?: number;
    sort?: "points_asc" | "points_desc" | "newest";
  }) => {
    const params = new URLSearchParams();
    if (filters?.type) params.append("type", filters.type);
    if (filters?.minPoints)
      params.append("minPoints", filters.minPoints.toString());
    if (filters?.maxPoints)
      params.append("maxPoints", filters.maxPoints.toString());
    if (filters?.sort) params.append("sort", filters.sort);

    return apiCall<Reward[]>(apiClient.get(`/rewards?${params.toString()}`));
  },

  // Get reward by ID
  getRewardById: async (rewardId: string) => {
    return apiCall<Reward>(apiClient.get(`/rewards/${rewardId}`));
  },

  // Redeem a reward
  redeemReward: async (rewardId: string) => {
    return apiCall<RewardRedemption>(
      apiClient.post("/rewards/redeem", { rewardId }),
      {
        showLoading: true,
        showSuccess: true,
        successMessage: "Reward redeemed successfully!",
      }
    );
  },

  // Get user's reward redemptions
  getRedemptions: async (filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    return apiCall<{
      redemptions: RewardRedemption[];
      total: number;
      page: number;
      pages: number;
    }>(apiClient.get(`/rewards/redemptions?${params.toString()}`));
  },

  // Get all achievements
  getAchievements: async (filters?: {
    category?: string;
    unlocked?: boolean;
  }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append("category", filters.category);
    if (filters?.unlocked !== undefined)
      params.append("unlocked", filters.unlocked.toString());

    return apiCall<Achievement[]>(
      apiClient.get(`/rewards/achievements?${params.toString()}`)
    );
  },

  // Get achievement by ID
  getAchievementById: async (achievementId: string) => {
    return apiCall<Achievement>(
      apiClient.get(`/rewards/achievements/${achievementId}`)
    );
  },

  // Claim achievement (if auto-claim is disabled)
  claimAchievement: async (achievementId: string) => {
    return apiCall<Achievement>(
      apiClient.post(`/rewards/achievements/${achievementId}/claim`),
      { showSuccess: true, successMessage: "Achievement unlocked!" }
    );
  },

  // Get rewards statistics
  getStats: async () => {
    return apiCall<RewardsStats>(apiClient.get("/rewards/stats"));
  },

  // Get leaderboard
  getLeaderboard: async (
    period: "week" | "month" | "all" = "all",
    limit: number = 50
  ) => {
    return apiCall<{
      leaderboard: {
        userId: string;
        username: string;
        points: number;
        rank: number;
        avatar?: string;
      }[];
      userRank?: number;
    }>(apiClient.get(`/rewards/leaderboard?period=${period}&limit=${limit}`));
  },

  // Check reward availability
  checkRewardAvailability: async (rewardId: string) => {
    return apiCall<{
      available: boolean;
      stock?: number;
      canAfford: boolean;
      pointsNeeded: number;
    }>(apiClient.get(`/rewards/${rewardId}/availability`));
  },

  // Get daily bonus status
  getDailyBonus: async () => {
    return apiCall<{
      available: boolean;
      points: number;
      streak: number;
      lastClaimed?: string;
      nextAvailable?: string;
    }>(apiClient.get("/rewards/daily-bonus"));
  },

  // Claim daily bonus
  claimDailyBonus: async () => {
    return apiCall<{
      points: number;
      streak: number;
      nextAvailable: string;
    }>(apiClient.post("/rewards/daily-bonus/claim"), {
      showSuccess: true,
      successMessage: "Daily bonus claimed!",
    });
  },

  // Get referral bonus info
  getReferralBonus: async () => {
    return apiCall<{
      pointsPerReferral: number;
      totalEarned: number;
      totalReferrals: number;
    }>(apiClient.get("/rewards/referral-bonus"));
  },

  // Get achievement categories
  getCategories: async () => {
    return apiCall<
      { category: string; count: number; label: string; icon: string }[]
    >(apiClient.get("/rewards/achievements/categories"));
  },

  // Gift points to another user
  giftPoints: async (recipientId: string, amount: number, message?: string) => {
    return apiCall<PointsTransaction>(
      apiClient.post("/rewards/points/gift", { recipientId, amount, message }),
      { showSuccess: true, successMessage: "Points gifted successfully!" }
    );
  },
};

export default rewardsApi;
