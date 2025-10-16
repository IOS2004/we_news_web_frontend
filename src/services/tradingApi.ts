import {
  apiClient,
  apiCall,
  ApiResponse,
  PaginatedResponse,
} from "./apiClient";

// Types
export interface TradingRound {
  id: string;
  gameType: "color" | "number";
  roundNumber: number;
  status: "upcoming" | "open" | "closed" | "settled" | "cancelled";
  startTime: string;
  endTime: string;
  result?: string | number;
  totalBets: number;
  totalAmount: number;
  createdAt: string;
}

export interface TradingOrder {
  id: string;
  userId: string;
  roundId: string;
  round: TradingRound;
  selections: TradingSelection[];
  totalAmount: number;
  status: "pending" | "won" | "lost" | "cancelled";
  payout?: number;
  profit?: number;
  createdAt: string;
  settledAt?: string;
}

export interface TradingSelection {
  option: string | number; // 'red', 'green', 'violet' for color; 0-9 for number
  amount: number;
  odds?: number;
}

export interface TradingStats {
  totalOrders: number;
  wonOrders: number;
  lostOrders: number;
  totalInvested: number;
  totalPayout: number;
  profit: number;
  winRate: number;
}

// Trading API Service
class TradingService {
  /**
   * Get trading rounds
   * Actual endpoint: GET /api/trading/rounds?gameType=color|number&status=...&limit=...
   */
  async getRounds(params?: {
    gameType?: "color" | "number";
    status?: "upcoming" | "open" | "closed" | "settled" | "cancelled";
    limit?: number;
    page?: number;
  }): Promise<TradingRound[]> {
    const response = await apiCall<ApiResponse<{ rounds: TradingRound[] }>>(
      apiClient.get("/trading/rounds", { params })
    );
    return response.data!.rounds || [];
  }

  /**
   * Get specific round details
   * Actual endpoint: GET /api/trading/rounds/:id
   */
  async getRound(roundId: string): Promise<TradingRound> {
    const response = await apiCall<ApiResponse<{ round: TradingRound }>>(
      apiClient.get(`/trading/rounds/${roundId}`)
    );
    return response.data!.round;
  }

  /**
   * Place a trading order
   * Actual endpoint: POST /api/trading/orders
   */
  async placeOrder(data: {
    roundId: string;
    selections: TradingSelection[];
  }): Promise<TradingOrder> {
    const response = await apiCall<ApiResponse<{ order: TradingOrder }>>(
      apiClient.post("/trading/orders", data),
      {
        showLoading: true,
        showSuccess: true,
        successMessage: "Order placed successfully!",
      }
    );
    return response.data!.order;
  }

  /**
   * Get user's trading orders
   * Actual endpoint: GET /api/trading/my-orders
   */
  async getMyOrders(params?: {
    page?: number;
    limit?: number;
    gameType?: "color" | "number";
    status?: "pending" | "won" | "lost" | "cancelled";
  }): Promise<PaginatedResponse<TradingOrder>> {
    const response = await apiCall<
      ApiResponse<{
        orders: TradingOrder[];
        pagination: any;
      }>
    >(apiClient.get("/trading/my-orders", { params }));

    return {
      items: response.data!.orders || [],
      pagination: response.data!.pagination,
    };
  }

  /**
   * Get trading statistics
   * Note: May need to calculate from orders or use dashboard API
   */
  async getStats(): Promise<TradingStats> {
    try {
      // Try to get stats from orders
      const orders = await this.getMyOrders({ limit: 100 });
      const allOrders = orders.items;

      const totalOrders = allOrders.length;
      const wonOrders = allOrders.filter((o) => o.status === "won").length;
      const lostOrders = allOrders.filter((o) => o.status === "lost").length;
      const totalInvested = allOrders.reduce(
        (sum, o) => sum + o.totalAmount,
        0
      );
      const totalPayout = allOrders.reduce(
        (sum, o) => sum + (o.payout || 0),
        0
      );

      return {
        totalOrders,
        wonOrders,
        lostOrders,
        totalInvested,
        totalPayout,
        profit: totalPayout - totalInvested,
        winRate: totalOrders > 0 ? (wonOrders / totalOrders) * 100 : 0,
      };
    } catch {
      return {
        totalOrders: 0,
        wonOrders: 0,
        lostOrders: 0,
        totalInvested: 0,
        totalPayout: 0,
        profit: 0,
        winRate: 0,
      };
    }
  }

  /**
   * Cancel a trading order
   * Actual endpoint: POST /api/trading/orders/:id/cancel
   */
  async cancelOrder(orderId: string): Promise<void> {
    await apiCall<ApiResponse<{ message: string }>>(
      apiClient.post(`/trading/orders/${orderId}/cancel`),
      {
        showLoading: true,
        showSuccess: true,
        successMessage: "Order cancelled successfully!",
      }
    );
  }

  /**
   * Get current active round for a game type
   */
  async getCurrentRound(
    gameType: "color" | "number"
  ): Promise<TradingRound | null> {
    const rounds = await this.getRounds({ gameType, status: "open", limit: 1 });
    return rounds.length > 0 ? rounds[0] : null;
  }

  /**
   * Get upcoming round for a game type
   */
  async getUpcomingRound(
    gameType: "color" | "number"
  ): Promise<TradingRound | null> {
    const rounds = await this.getRounds({
      gameType,
      status: "upcoming",
      limit: 1,
    });
    return rounds.length > 0 ? rounds[0] : null;
  }

  /**
   * Get recent results for a game type
   */
  async getRecentResults(
    gameType: "color" | "number",
    limit: number = 10
  ): Promise<TradingRound[]> {
    return this.getRounds({ gameType, status: "settled", limit });
  }

  /**
   * Calculate potential payout for selections
   */
  calculatePotentialPayout(selections: TradingSelection[]): number {
    // Default odds (can be adjusted based on actual odds from backend)
    const colorOdds = { red: 2, green: 2, violet: 4.5 };
    const numberOdds = 9; // 1:9 payout for numbers

    let totalPayout = 0;
    selections.forEach((sel) => {
      if (typeof sel.option === "string") {
        // Color game
        const odds = colorOdds[sel.option as keyof typeof colorOdds] || 2;
        totalPayout += sel.amount * odds;
      } else {
        // Number game
        totalPayout += sel.amount * numberOdds;
      }
    });

    return totalPayout;
  }
}

export const tradingService = new TradingService();
export default tradingService;
