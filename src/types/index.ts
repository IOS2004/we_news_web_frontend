// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "user" | "admin";
  referralCode: string;
  referredBy?: string;
  totalReferrals: number;
  referralEarnings: number;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  profileImage?: string;
  phone?: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phoneNumber: string;
  referralCode?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

// Wallet Types
export interface Wallet {
  userId: string;
  balance: number;
  totalEarnings: number;
  totalWithdrawals: number;
  totalInvestments: number;
  lastUpdated: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: "credit" | "debit";
  amount: number;
  category:
    | "news_reading"
    | "referral"
    | "investment"
    | "withdrawal"
    | "trading"
    | "plan_purchase"
    | "bonus";
  description: string;
  status: "pending" | "completed" | "failed";
  createdAt: string;
  metadata?: any;
}

// News Types
export interface News {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  imageUrl?: string;
  source: string;
  author?: string;
  publishedAt: string;
  url: string;
  readCount: number;
  earnings: number;
}

export interface NewsReadRecord {
  userId: string;
  newsId: string;
  earnedAmount: number;
  readAt: string;
}

// Investment Plan Types
export interface InvestmentPlan {
  id: string;
  name: string;
  description: string;
  amount: number;
  duration: number; // days
  dailyReturn: number;
  totalReturn: number;
  isActive: boolean;
  features: string[];
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
  dailyEarnings: number;
}

// Trading Types
export interface Trade {
  id: string;
  userId: string;
  gameType: "color" | "number";
  betAmount: number;
  selectedOption: string | number;
  result: string | number;
  status: "pending" | "won" | "lost";
  winAmount?: number;
  createdAt: string;
}

export interface TradingStats {
  totalGames: number;
  gamesWon: number;
  gamesLost: number;
  totalBetAmount: number;
  totalWinAmount: number;
  winRate: number;
}

// Referral/Network Types
export interface ReferralNode {
  id: string;
  username: string;
  email: string;
  referralCode: string;
  totalReferrals: number;
  joinedAt: string;
  level: number;
  children?: ReferralNode[];
}

// Dashboard Types
export interface DashboardStats {
  totalEarnings: number;
  todayEarnings: number;
  walletBalance: number;
  totalReferrals: number;
  activeInvestments: number;
  newsRead: number;
  tradingProfit: number;
}

// Withdrawal Types
export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    bankName: string;
  };
  status: "pending" | "approved" | "rejected" | "completed";
  requestedAt: string;
  processedAt?: string;
  remarks?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}
