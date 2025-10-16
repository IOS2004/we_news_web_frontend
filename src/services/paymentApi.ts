import { apiCall } from "./apiClient";

// ============================================
// TYPES
// ============================================

export interface TopupRequest {
  amount: number;
  paymentMethod: string;
}

export interface TopupResponse {
  success: boolean;
  message: string;
  data: {
    transactionId: string;
    amounts: {
      baseAmount: number;
      taxAmount: number;
      finalAmount: number;
      creditAmount: number;
    };
    paymentResponse: {
      paymentData: {
        payment_session_id: string;
        order_id: string;
        customer_details: {
          customer_id: string;
          customer_email: string;
          customer_phone: string;
        };
      };
    };
    userDetails: {
      id: string;
      name: string;
      email: string;
      phone: string;
    };
  };
}

export interface TopupSuccessRequest {
  transactionId: string;
  orderId: string;
  paymentDetails: any;
}

export interface TopupFailureRequest {
  transactionId: string;
  orderId: string;
  errorDetails: any;
}

export interface PaymentTransaction {
  id: string;
  transactionId: string;
  orderId: string;
  amount: number;
  status: "pending" | "success" | "failed" | "cancelled";
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentHistory {
  transactions: PaymentTransaction[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============================================
// PAYMENT API METHODS
// ============================================

/**
 * Initiate wallet topup
 */
export const initiateTopup = async (
  request: TopupRequest
): Promise<TopupResponse> => {
  const { default: apiClient } = await import("./apiClient");
  return apiCall<TopupResponse>(apiClient.post("/wallet/topup", request), {
    showLoading: true,
  });
};

/**
 * Handle topup success callback
 */
export const handleTopupSuccess = async (
  request: TopupSuccessRequest
): Promise<{ success: boolean; message: string }> => {
  const { default: apiClient } = await import("./apiClient");
  return apiCall<{ success: boolean; message: string }>(
    apiClient.post("/wallet/topup/success", request),
    { showSuccess: true, successMessage: "Payment verified successfully!" }
  );
};

/**
 * Handle topup failure callback
 */
export const handleTopupFailure = async (
  request: TopupFailureRequest
): Promise<{ success: boolean; message: string }> => {
  const { default: apiClient } = await import("./apiClient");
  return apiCall<{ success: boolean; message: string }>(
    apiClient.post("/wallet/topup/failure", request)
  );
};

/**
 * Get payment history
 */
export const getPaymentHistory = async (
  page = 1,
  limit = 20
): Promise<PaymentHistory> => {
  const { default: apiClient } = await import("./apiClient");
  return apiCall<PaymentHistory>(
    apiClient.get(`/wallet/payments?page=${page}&limit=${limit}`)
  );
};

/**
 * Get payment transaction details
 */
export const getTransactionDetails = async (
  transactionId: string
): Promise<PaymentTransaction> => {
  const { default: apiClient } = await import("./apiClient");
  return apiCall<PaymentTransaction>(
    apiClient.get(`/wallet/payments/${transactionId}`)
  );
};

/**
 * Cancel pending payment
 */
export const cancelPayment = async (
  transactionId: string
): Promise<{ success: boolean; message: string }> => {
  const { default: apiClient } = await import("./apiClient");
  return apiCall<{ success: boolean; message: string }>(
    apiClient.post(`/wallet/payments/${transactionId}/cancel`),
    { showSuccess: true, successMessage: "Payment cancelled" }
  );
};

/**
 * Test topup success (for testing purposes)
 */
export const testTopupSuccess = async (
  transactionId: string
): Promise<{ success: boolean; message: string }> => {
  const { default: apiClient } = await import("./apiClient");
  return apiCall<{ success: boolean; message: string }>(
    apiClient.post(`/wallet/topup/test/${transactionId}`),
    { showSuccess: true, successMessage: "Test payment successful!" }
  );
};

// ============================================
// CASHFREE INTEGRATION HELPERS
// ============================================

/**
 * Load Cashfree SDK
 */
export const loadCashfreeSDK = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ((window as any).Cashfree) {
      resolve((window as any).Cashfree);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    script.onload = () => {
      resolve((window as any).Cashfree);
    };
    script.onerror = () => {
      reject(new Error("Failed to load Cashfree SDK"));
    };
    document.head.appendChild(script);
  });
};

/**
 * Initialize Cashfree payment
 */
export const initializeCashfreePayment = async (
  _paymentSessionId: string
): Promise<any> => {
  try {
    const Cashfree = await loadCashfreeSDK();
    
    // Get environment from config
    const { default: config } = await import('../config');
    const environment = config.cashfree.mode === 'production' ? 'production' : 'sandbox';
    
    console.log('Initializing Cashfree with mode:', environment);

    const cashfree = Cashfree({
      mode: environment,
    });

    return cashfree;
  } catch (error) {
    console.error("Cashfree initialization error:", error);
    throw error;
  }
};

/**
 * Process Cashfree payment with Web SDK
 */
export const processCashfreePayment = async (
  transactionId: string,
  paymentSessionId: string,
  callbacks: {
    onSuccess?: (data: any) => void;
    onFailure?: (error: any) => void;
    onError?: (error: any) => void;
  }
): Promise<void> => {
  try {
    console.log('=== CASHFREE PAYMENT PROCESSING ===');
    console.log('Transaction ID:', transactionId);
    console.log('Payment Session ID:', paymentSessionId);
    
    const cashfree = await initializeCashfreePayment(paymentSessionId);
    console.log('Cashfree SDK initialized successfully');

    const checkoutOptions = {
      paymentSessionId: paymentSessionId,
      returnUrl: `${window.location.origin}/wallet?payment=success&txnId=${transactionId}`,
    };
    
    console.log('Opening Cashfree checkout with options:', checkoutOptions);

    cashfree
      .checkout(checkoutOptions)
      .then((result: any) => {
        console.log('Cashfree checkout result:', result);
        
        if (result.error) {
          console.error("Payment error:", result.error);
          callbacks.onError?.(result.error);
          return;
        }

        if (result.paymentDetails) {
          console.log("Payment successful:", result.paymentDetails);
          callbacks.onSuccess?.(result.paymentDetails);
        }
      })
      .catch((error: any) => {
        console.error("Payment processing error:", error);
        callbacks.onFailure?.(error);
      });
  } catch (error) {
    console.error("Cashfree payment error:", error);
    callbacks.onError?.(error);
  }
};

// Export default object with all methods
const paymentApi = {
  initiateTopup,
  handleTopupSuccess,
  handleTopupFailure,
  getPaymentHistory,
  getTransactionDetails,
  cancelPayment,
  testTopupSuccess,
  loadCashfreeSDK,
  initializeCashfreePayment,
  processCashfreePayment,
};

export default paymentApi;
