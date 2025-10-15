import { apiClient, apiCall, ApiResponse, PaginatedResponse } from './apiClient';

// Types
export interface ReferralStats {
  totalReferrals: number;
  directReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  monthlyEarnings: number;
  pendingEarnings: number;
  levelBreakdown: {
    level: number;
    count: number;
    earnings: number;
  }[];
}

export interface ReferredUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email?: string;
  level: number;
  status: 'active' | 'inactive';
  joinedAt: string;
  totalInvested: number;
  earnings: number;
  referralCode: string;
}

export interface ReferralTree {
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    level: number;
  };
  children: ReferralTree[];
  directReferrals: number;
  totalReferrals: number;
}

export interface ReferralCommission {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  level: number;
  source: string;
  description: string;
  status: 'pending' | 'credited';
  createdAt: string;
}

// Referral/Network API Service
class ReferralService {
  /**
   * Get referral statistics
   * Actual endpoint: GET /api/referrals/info (note: referrals with 's')
   */
  async getStats(): Promise<ReferralStats> {
    const response = await apiCall<ApiResponse<ReferralStats>>(
      apiClient.get('/referrals/info')
    );
    return response.data!;
  }

  /**
   * Get list of referred users
   * Actual endpoint: GET /api/referrals/info (contains referral list)
   */
  async getReferrals(params?: {
    page?: number;
    limit?: number;
    level?: number;
    status?: 'active' | 'inactive';
  }): Promise<PaginatedResponse<ReferredUser>> {
    const response = await apiCall<ApiResponse<{
      referrals: ReferredUser[];
      pagination: any;
    }>>(
      apiClient.get('/referrals/info', { params })
    );

    return {
      items: response.data!.referrals || [],
      pagination: response.data!.pagination,
    };
  }

  /**
   * Get referral tree structure
   * Actual endpoint: GET /api/referrals/tree?levels=<maxDepth>
   */
  async getTree(maxDepth?: number): Promise<ReferralTree> {
    const response = await apiCall<ApiResponse<{ tree: ReferralTree }>>(
      apiClient.get('/referrals/tree', { params: { levels: maxDepth || 5 } })
    );
    return response.data!.tree;
  }

  /**
   * Get referral commissions history
   * Actual endpoint: GET /api/referrals/info (includes commission data)
   */
  async getCommissions(params?: {
    page?: number;
    limit?: number;
    level?: number;
    status?: 'pending' | 'credited';
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<ReferralCommission>> {
    const response = await apiCall<ApiResponse<{
      commissions: ReferralCommission[];
      pagination: any;
    }>>(
      apiClient.get('/referrals/info', { params })
    );

    return {
      items: response.data!.commissions || [],
      pagination: response.data!.pagination,
    };
  }

  /**
   * Get user's referral code
   * Actual endpoint: GET /api/referrals/info (contains referralCode)
   */
  async getReferralCode(): Promise<string> {
    const response = await apiCall<ApiResponse<{ referralCode: string }>>(
      apiClient.get('/referrals/info')
    );
    return response.data!.referralCode;
  }

  /**
   * Generate referral link
   */
  generateReferralLink(referralCode: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/signup?ref=${referralCode}`;
  }

  /**
   * Validate referral code
   * Actual endpoint: GET /api/referrals/validate/:referralCode
   */
  async validateCode(code: string): Promise<boolean> {
    try {
      const response = await apiCall<ApiResponse<{ valid: boolean }>>(
        apiClient.get(`/referrals/validate/${code}`)
      );
      return response.data!.valid;
    } catch {
      return false;
    }
  }

  /**
   * Get earnings by level
   * Actual endpoint: GET /api/referrals/info (includes level breakdown)
   */
  async getEarningsByLevel(): Promise<{
    level: number;
    count: number;
    earnings: number;
  }[]> {
    const response = await apiCall<ApiResponse<{
      levels: { level: number; count: number; earnings: number }[];
    }>>(
      apiClient.get('/referrals/info')
    );
    return response.data!.levels || [];
  }

  /**
   * Get commission rates
   * Actual endpoint: GET /api/referrals/commission-rates (public)
   */
  async getCommissionRates(): Promise<any> {
    const response = await apiCall<ApiResponse<any>>(
      apiClient.get('/referrals/commission-rates')
    );
    return response.data!;
  }
}

export const referralService = new ReferralService();
export default referralService;
