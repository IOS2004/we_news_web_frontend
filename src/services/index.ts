// API Services Index
// Central export point for all API services

// Core API Client
export { apiClient, apiCall } from "./apiClient";
export type { ApiResponse, PaginatedResponse } from "./apiClient";

// Authentication Service
export { default as authService } from "./authApi";
export type {
  User,
  LoginCredentials,
  SignupData,
  AuthResponse,
} from "./authApi";

// User Profile Service
export { default as userService } from "./userApi";
export type {
  UpdateProfileData,
  SavedArticle,
  ReadingHistory,
} from "./userApi";

// Wallet Service
export { default as walletService } from "./walletApi";
export type {
  Wallet,
  Transaction,
  WithdrawalRequest,
  WalletStats,
  EarningsBreakdown,
} from "./walletApi";

// Referral/Network Service
export { default as referralService } from "./referralApi";
export type {
  ReferralStats,
  ReferredUser,
  ReferralTree,
  ReferralCommission,
} from "./referralApi";

// Investment Service
export { default as investmentService } from "./investmentApi";
export type {
  InvestmentPlan,
  UserInvestment,
  InvestmentStats,
} from "./investmentApi";

// Trading Service
export { default as tradingService } from "./tradingApi";
export type {
  TradingRound,
  TradingOrder,
  TradingSelection,
  TradingStats,
} from "./tradingApi";

// Dashboard Service
export { default as dashboardService } from "./dashboardApi";
export type {
  DashboardOverview,
  QuickStats,
  EarningsSummary as DashboardEarningsSummary,
  UserProgress,
} from "./dashboardApi";

// Earnings Service
export { default as earningsService } from "./earningsApi";
export type {
  DailyEarning,
  TodayEarning,
  EarningsSummary,
  UserLevel,
  LevelReward,
  EarningsStats,
} from "./earningsApi";

// News Service (existing - if available)
// export { default as newsService } from './newsService';

// Combined API object for convenient access
import authService from "./authApi";
import userService from "./userApi";
import walletService from "./walletApi";
import referralService from "./referralApi";
import investmentService from "./investmentApi";
import tradingService from "./tradingApi";
import dashboardService from "./dashboardApi";
import earningsService from "./earningsApi";

export const api = {
  auth: authService,
  user: userService,
  wallet: walletService,
  referral: referralService,
  investment: investmentService,
  trading: tradingService,
  dashboard: dashboardService,
  earnings: earningsService,
};

// Default export
export default api;
