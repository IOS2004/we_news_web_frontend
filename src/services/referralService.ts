import api from "./api";
import type { ReferralNode, ApiResponse } from "@/types";

export const referralService = {
  // Get referral tree/network
  async getReferralTree(levels: number = 3): Promise<ReferralNode> {
    const response = await api.get<ApiResponse<ReferralNode>>(
      "/referrals/tree",
      {
        params: { levels },
      }
    );
    return response.data.data!;
  },

  // Get direct referrals
  async getDirectReferrals(): Promise<ReferralNode[]> {
    const response = await api.get<ApiResponse<ReferralNode[]>>(
      "/referrals/direct"
    );
    return response.data.data!;
  },

  // Get referral stats
  async getReferralStats(): Promise<{
    totalReferrals: number;
    totalEarnings: number;
    activeReferrals: number;
  }> {
    const response = await api.get<ApiResponse<any>>("/referrals/stats");
    return response.data.data!;
  },
};
