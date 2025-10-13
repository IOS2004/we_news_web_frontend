import api from "./api";
import type {
  WithdrawalRequest,
  ApiResponse,
  PaginatedResponse,
} from "@/types";

export const withdrawalService = {
  // Request withdrawal
  async requestWithdrawal(
    amount: number,
    bankDetails: WithdrawalRequest["bankDetails"]
  ): Promise<WithdrawalRequest> {
    const response = await api.post<ApiResponse<WithdrawalRequest>>(
      "/withdrawals/request",
      { amount, bankDetails }
    );
    return response.data.data!;
  },

  // Get withdrawal history
  async getWithdrawalHistory(
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<WithdrawalRequest>> {
    const response = await api.get<PaginatedResponse<WithdrawalRequest>>(
      "/withdrawals/history",
      { params: { page, limit } }
    );
    return response.data;
  },

  // Get pending withdrawals
  async getPendingWithdrawals(): Promise<WithdrawalRequest[]> {
    const response = await api.get<ApiResponse<WithdrawalRequest[]>>(
      "/withdrawals/pending"
    );
    return response.data.data!;
  },

  // Cancel withdrawal request
  async cancelWithdrawal(withdrawalId: string): Promise<void> {
    await api.delete(`/withdrawals/${withdrawalId}`);
  },
};
