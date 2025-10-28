import api from "./api";
import type {
  WithdrawalRequest,
  ApiResponse,
  PaginatedResponse,
} from "@/types";

export const withdrawalService = {
  // Request withdrawal
  async requestWithdrawal(data: {
    amount: number;
    bankAccountNumber: string;
    ifscCode: string;
    accountHolderName: string;
  }): Promise<ApiResponse<{ withdrawalRequest: WithdrawalRequest; newBalance: number }>> {
    const response = await api.post<ApiResponse<{ withdrawalRequest: WithdrawalRequest; newBalance: number }>>(
      "/withdrawals/request",
      data
    );
    return response.data;
  },

  // Get user's withdrawal history
  async getMyWithdrawals(
    page: number = 1,
    limit: number = 20,
    status?: string
  ): Promise<ApiResponse<WithdrawalRequest[]>> {
    const params: any = { page, limit };
    if (status) params.status = status;
    
    const response = await api.get<ApiResponse<WithdrawalRequest[]>>(
      "/withdrawals/my-requests",
      { params }
    );
    return response.data;
  },

  // Legacy method for backward compatibility
  async getWithdrawalHistory(
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<WithdrawalRequest>> {
    const response = await this.getMyWithdrawals(page, limit);
    return {
      success: response.success,
      data: response.data || [],
      pagination: {
        currentPage: page,
        totalPages: 1,
        totalItems: response.data?.length || 0,
        itemsPerPage: limit
      }
    };
  },

  // Get pending withdrawals
  async getPendingWithdrawals(): Promise<WithdrawalRequest[]> {
    const response = await this.getMyWithdrawals(1, 100, 'pending');
    return response.data || [];
  },

  // Cancel withdrawal request (if backend supports it)
  async cancelWithdrawal(withdrawalId: string): Promise<void> {
    await api.delete(`/withdrawals/${withdrawalId}`);
  },
};
