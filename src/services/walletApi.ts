import { apiClient, apiCall, ApiResponse, PaginatedResponse } from './apiClient';

// Types
export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  totalEarnings: number;
  totalWithdrawals: number;
  pendingWithdrawals: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  reference?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  paymentMethod: string;
  paymentDetails: {
    accountNumber?: string;
    ifscCode?: string;
    accountHolderName?: string;
    upiId?: string;
  };
  adminNotes?: string;
  rejectionReason?: string;
  requestedAt: string;
  processedAt?: string;
}

export interface WalletStats {
  monthlyEarnings: number;
  weeklyEarnings: number;
  averageDaily: number;
  totalWithdrawn: number;
  successfulWithdrawals: number;
  pendingAmount: number;
}

export interface EarningsBreakdown {
  totalEarnings: number;
  dailyEarnings: number;
  referralEarnings: number;
  investmentEarnings: number;
  todayEarnings: number;
  breakdown: {
    referral: number;
    investment: number;
    daily: number;
    other: number;
  };
}

// Wallet API Service
class WalletService {
  /**
   * Get user's wallet balance and statistics
   * Actual endpoint: GET /api/wallet (returns wallet details)
   */
  async getBalance(): Promise<Wallet> {
    const response = await apiCall<ApiResponse<{ wallet: Wallet }>>(
      apiClient.get('/wallet')
    );
    return response.data!.wallet;
  }

  /**
   * Get transaction history with filters
   */
  async getTransactions(params?: {
    page?: number;
    limit?: number;
    type?: 'credit' | 'debit';
    status?: 'pending' | 'completed' | 'failed' | 'cancelled';
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<Transaction>> {
    const response = await apiCall<ApiResponse<{
      transactions: Transaction[];
      pagination: any;
    }>>(
      apiClient.get('/wallet/transactions', { params })
    );

    return {
      items: response.data!.transactions,
      pagination: response.data!.pagination,
    };
  }

  /**
   * Request a withdrawal
   * NOTE: No direct withdrawal endpoint in backend yet.
   * Withdrawals handled through earnings system or admin approval.
   * Using /wallet/refund as temporary alternative.
   */
  async requestWithdrawal(data: {
    amount: number;
    paymentMethod: 'bank_transfer' | 'upi';
    paymentDetails: {
      accountNumber?: string;
      ifscCode?: string;
      accountHolderName?: string;
      upiId?: string;
    };
  }): Promise<WithdrawalRequest> {
    // TODO: Backend needs to implement proper withdrawal endpoint
    // For now, this can be handled through admin panel
    const response = await apiCall<ApiResponse<{ withdrawal: WithdrawalRequest }>>(
      apiClient.post('/wallet/refund', { 
        amount: data.amount,
        reason: 'Withdrawal request',
        paymentDetails: data.paymentDetails 
      }),
      {
        showLoading: true,
        showSuccess: true,
        successMessage: 'Withdrawal request submitted successfully!',
      }
    );
    return response.data!.withdrawal;
  }

  /**
   * Get withdrawal requests history
   * NOTE: May require admin access or be part of earnings system
   */
  async getWithdrawals(params?: {
    page?: number;
    limit?: number;
    status?: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  }): Promise<PaginatedResponse<WithdrawalRequest>> {
    // TODO: Confirm actual endpoint - may be /admin/withdrawals or /earnings/withdrawals
    const response = await apiCall<ApiResponse<{
      withdrawals: WithdrawalRequest[];
      pagination: any;
    }>>(
      apiClient.get('/wallet/transactions', { params: { ...params, type: 'debit' } })
    );

    return {
      items: response.data!.withdrawals || [],
      pagination: response.data!.pagination,
    };
  }

  /**
   * Get wallet statistics
   * Actual endpoint: GET /api/dashboard/earnings or /api/earnings/stats
   */
  async getStats(): Promise<WalletStats> {
    const response = await apiCall<ApiResponse<WalletStats>>(
      apiClient.get('/earnings/stats')
    );
    return response.data!;
  }

  /**
   * Get detailed earnings breakdown
   * Actual endpoint: GET /api/earnings/summary
   */
  async getEarnings(): Promise<EarningsBreakdown> {
    const response = await apiCall<ApiResponse<EarningsBreakdown>>(
      apiClient.get('/earnings/summary', { 
        params: { 
          startDate: new Date(Date.now() - 30*24*60*60*1000).toISOString(),
          endDate: new Date().toISOString()
        }
      })
    );
    return response.data!;
  }

  /**
   * Initiate wallet top-up
   * Actual endpoint: POST /api/wallet/topup
   */
  async topUp(data: {
    amount: number;
    paymentMethod: string;
  }): Promise<any> {
    const response = await apiCall<ApiResponse<any>>(
      apiClient.post('/wallet/topup', data),
      {
        showLoading: true,
        showSuccess: true,
        successMessage: 'Top-up initiated successfully!',
      }
    );
    return response.data!;
  }

  /**
   * Process payment from wallet
   * Actual endpoint: POST /api/wallet/pay
   */
  async pay(data: {
    amount: number;
    serviceType: string;
    description?: string;
  }): Promise<any> {
    const response = await apiCall<ApiResponse<any>>(
      apiClient.post('/wallet/pay', data),
      {
        showLoading: true,
        showSuccess: true,
        successMessage: 'Payment processed successfully!',
      }
    );
    return response.data!;
  }

  /**
   * Check if user can pay amount
   * Actual endpoint: GET /api/wallet/can-pay
   */
  async canPay(amount: number): Promise<{ canPay: boolean; balance: number }> {
    const response = await apiCall<ApiResponse<{ canPay: boolean; balance: number }>>(
      apiClient.get('/wallet/can-pay', { params: { amount } })
    );
    return response.data!;
  }
}

export const walletService = new WalletService();
export default walletService;
