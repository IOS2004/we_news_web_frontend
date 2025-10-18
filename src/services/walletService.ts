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
    const response = await api.get<
      ApiResponse<{
        transactions: any[];
        totalTransactions: number;
        currentBalance: number;
      }>
    >("/wallet/transactions", {
      params: { skip: (page - 1) * limit, limit, type },
    });

    // Map backend transaction format to frontend format
    const mappedTransactions = (response.data.data?.transactions || []).map((tx: any) => {
      // Determine category from description
      let category: Transaction['category'] = 'bonus';
      const desc = (tx.description || '').toLowerCase();
      if (desc.includes('plan') || desc.includes('investment')) {
        category = 'plan_purchase';
      } else if (desc.includes('referral') || desc.includes('commission')) {
        category = 'referral';
      } else if (desc.includes('trading')) {
        category = 'trading';
      } else if (desc.includes('withdrawal') || desc.includes('refund')) {
        category = 'withdrawal';
      } else if (desc.includes('topup') || desc.includes('add money')) {
        category = 'bonus';
      }

      return {
        id: tx.id,
        userId: tx.userId,
        type: tx.transactionType, // Backend uses 'transactionType', frontend expects 'type'
        amount: tx.amount,
        category,
        description: tx.description,
        status: tx.status,
        reference: tx.transactionReference || tx.bookingId,
        metadata: {
          serviceId: tx.serviceId,
          gstAmount: tx.gstAmount,
          discountAmount: tx.discountAmount,
        },
        createdAt: tx.createdAt,
      };
    });

    return {
      success: true,
      data: mappedTransactions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil((response.data.data?.totalTransactions || 0) / limit),
        totalItems: response.data.data?.totalTransactions || 0,
        itemsPerPage: limit,
      },
    };
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
