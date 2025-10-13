import api from "./api";
import type {
  Wallet,
  Transaction,
  PaginatedResponse,
  ApiResponse,
} from "@/types";

export const walletService = {
  // Get wallet balance
  async getWallet(): Promise<Wallet> {
    const response = await api.get<ApiResponse<Wallet>>("/wallet");
    return response.data.data!;
  },

  // Get transactions
  async getTransactions(
    page: number = 1,
    limit: number = 20,
    type?: "credit" | "debit"
  ): Promise<PaginatedResponse<Transaction>> {
    const response = await api.get<PaginatedResponse<Transaction>>(
      "/wallet/transactions",
      {
        params: { page, limit, type },
      }
    );
    return response.data;
  },

  // Add money (initiate payment)
  async addMoney(
    amount: number
  ): Promise<{ orderId: string; paymentSessionId: string }> {
    const response = await api.post<
      ApiResponse<{ orderId: string; paymentSessionId: string }>
    >("/wallet/add-money", { amount });
    return response.data.data!;
  },

  // Verify payment
  async verifyPayment(orderId: string): Promise<void> {
    await api.post("/wallet/verify-payment", { orderId });
  },
};
