import { apiClient, apiCall } from "./apiClient";
import type {
  TradingRound,
  TradingColor,
  TradingNumber,
  RoundType,
  Trade,
  UserTrades,
  PlaceTradeResponse,
  ActiveRoundsResponse,
  RoundDetailsResponse,
  UserTradesResponse,
  AllUserTradesResponse,
  WinningsResponse,
  WalletBalanceResponse,
} from "@/types/trading";
import toast from "react-hot-toast";

// Color configuration for UI
export interface ColorConfig {
  displayName: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  hoverClass: string;
}

/**
 * Trading API Service - Real Backend Integration
 * Base URL: /api/trading
 */
class TradingService {
  // Available colors in the system
  private readonly colors: TradingColor[] = [
    "red",
    "blue",
    "green",
    "yellow",
    "orange",
    "purple",
    "pink",
    "brown",
    "cyan",
    "magenta",
    "lime",
    "violet",
  ];

  // Available bet amounts
  private readonly betAmounts = [100, 200, 500, 1000, 2000, 5000];

  // Color configurations for UI
  private readonly colorConfigs: Record<TradingColor, ColorConfig> = {
    red: {
      displayName: "Red",
      bgClass: "bg-red-500",
      textClass: "text-white",
      borderClass: "border-red-600",
      hoverClass: "hover:bg-red-600",
    },
    blue: {
      displayName: "Blue",
      bgClass: "bg-blue-500",
      textClass: "text-white",
      borderClass: "border-blue-600",
      hoverClass: "hover:bg-blue-600",
    },
    green: {
      displayName: "Green",
      bgClass: "bg-green-500",
      textClass: "text-white",
      borderClass: "border-green-600",
      hoverClass: "hover:bg-green-600",
    },
    yellow: {
      displayName: "Yellow",
      bgClass: "bg-yellow-500",
      textClass: "text-white",
      borderClass: "border-yellow-600",
      hoverClass: "hover:bg-yellow-600",
    },
    orange: {
      displayName: "Orange",
      bgClass: "bg-orange-500",
      textClass: "text-white",
      borderClass: "border-orange-600",
      hoverClass: "hover:bg-orange-600",
    },
    purple: {
      displayName: "Purple",
      bgClass: "bg-purple-500",
      textClass: "text-white",
      borderClass: "border-purple-600",
      hoverClass: "hover:bg-purple-600",
    },
    pink: {
      displayName: "Pink",
      bgClass: "bg-pink-500",
      textClass: "text-white",
      borderClass: "border-pink-600",
      hoverClass: "hover:bg-pink-600",
    },
    brown: {
      displayName: "Brown",
      bgClass: "bg-amber-700",
      textClass: "text-white",
      borderClass: "border-amber-800",
      hoverClass: "hover:bg-amber-800",
    },
    cyan: {
      displayName: "Cyan",
      bgClass: "bg-cyan-500",
      textClass: "text-white",
      borderClass: "border-cyan-600",
      hoverClass: "hover:bg-cyan-600",
    },
    magenta: {
      displayName: "Magenta",
      bgClass: "bg-fuchsia-500",
      textClass: "text-white",
      borderClass: "border-fuchsia-600",
      hoverClass: "hover:bg-fuchsia-600",
    },
    lime: {
      displayName: "Lime",
      bgClass: "bg-lime-500",
      textClass: "text-white",
      borderClass: "border-lime-600",
      hoverClass: "hover:bg-lime-600",
    },
    violet: {
      displayName: "Violet",
      bgClass: "bg-violet-500",
      textClass: "text-white",
      borderClass: "border-violet-600",
      hoverClass: "hover:bg-violet-600",
    },
  };

  /**
   * Place a trade
   * POST /api/trading/place-trade
   * Backend expects: { roundId, tradeType, selection, amount }
   * Returns: { success, message, data: { trade, transaction, roundInfo } }
   */
  async placeTrade(
    roundId: string,
    tradeType: RoundType,
    selection: TradingColor | TradingNumber,
    amount: number
  ): Promise<PlaceTradeResponse["data"] | null> {
    try {
      const response = await apiCall<PlaceTradeResponse>(
        apiClient.post("/trading/place-trade", {
          roundId,
          tradeType,
          selection,
          amount,
        }),
        {
          showLoading: true,
        }
      );

      if (response.success) {
        toast.success("Trade placed successfully!");
        return response.data;
      }
      return null;
    } catch (error: any) {
      console.error("Error placing trade:", error);
      toast.error(error.response?.data?.message || "Failed to place trade");
      throw error;
    }
  }

  /**
   * Get active rounds
   * GET /api/trading/active-rounds?roundType=colour|number
   * Backend returns: { success, count, data: [ ...rounds ] }
   */
  async getActiveRounds(roundType?: RoundType): Promise<TradingRound[]> {
    try {
      const params = roundType ? { roundType } : {};
      const response = await apiCall<ActiveRoundsResponse>(
        apiClient.get("/trading/active-rounds", { params })
      );

      if (response.success) {
        return response.data;
      }
      return [];
    } catch (error: any) {
      console.error("Error fetching active rounds:", error);
      return [];
    }
  }

  /**
   * Get upcoming rounds
   * GET /api/trading/upcoming-rounds?roundType=colour|number&limit=10
   * Backend returns: { success, count, data: [ ...rounds ] }
   */
  async getUpcomingRounds(
    roundType?: RoundType,
    limit?: number
  ): Promise<TradingRound[]> {
    try {
      const params: any = {};
      if (roundType) params.roundType = roundType;
      if (limit) params.limit = limit;

      const response = await apiCall<ActiveRoundsResponse>(
        apiClient.get("/trading/upcoming-rounds", { params })
      );

      if (response.success) {
        return response.data;
      }
      return [];
    } catch (error: any) {
      console.error("Error fetching upcoming rounds:", error);
      return [];
    }
  }

  /**
   * Get rounds by status (DEPRECATED - use getActiveRounds or getUpcomingRounds instead)
   * GET /api/trading/rounds?gameType=color|number&status=upcoming|open|closed|settled
   * Backend returns: { success, data: { rounds: [...] } }
   */
  async getRoundsByStatus(
    gameType?: "color" | "number",
    status?: "upcoming" | "open" | "closed" | "settled" | "cancelled" | "all",
    limit?: number
  ): Promise<TradingRound[]> {
    try {
      const params: any = {};
      if (gameType) params.gameType = gameType;
      if (status) params.status = status;
      if (limit) params.limit = limit;

      const response = await apiCall<{ success: boolean; data: { rounds: TradingRound[] } }>(
        apiClient.get("/trading/rounds", { params })
      );

      if (response.success && response.data?.rounds) {
        return response.data.rounds;
      }
      return [];
    } catch (error: any) {
      console.error("Error fetching rounds by status:", error);
      return [];
    }
  }

  /**
   * Get specific round details
   * GET /api/trading/rounds/:roundId
   * Backend returns: { success, data: { id, roundId, roundNumber, roundType, ... } }
   */
  async getRoundDetails(roundId: string): Promise<TradingRound | null> {
    try {
      const response = await apiCall<RoundDetailsResponse>(
        apiClient.get(`/trading/rounds/${roundId}`)
      );

      if (response.success) {
        return response.data;
      }
      return null;
    } catch (error: any) {
      console.error("Error fetching round details:", error);
      return null;
    }
  }

  /**
   * Get user's trades in a specific round
   * GET /api/trading/rounds/:roundId/my-trades
   * Backend returns: { success, data: { roundId, userId, colorTrades, numberTrades, totalColorAmount, totalNumberAmount, totalAmount } }
   */
  async getMyTradesInRound(roundId: string): Promise<UserTrades> {
    try {
      const response = await apiCall<UserTradesResponse>(
        apiClient.get(`/trading/rounds/${roundId}/my-trades`)
      );

      if (response.success) {
        return response.data;
      }
      
      // Return empty structure if no trades
      return {
        roundId,
        userId: "",
        colorTrades: {} as Record<TradingColor, Trade[]>,
        numberTrades: {},
        totalColorAmount: 0,
        totalNumberAmount: 0,
        totalAmount: 0,
      };
    } catch (error: any) {
      console.error("Error fetching my trades:", error);
      // Return empty structure on error
      return {
        roundId,
        userId: "",
        colorTrades: {} as Record<TradingColor, Trade[]>,
        numberTrades: {},
        totalColorAmount: 0,
        totalNumberAmount: 0,
        totalAmount: 0,
      };
    }
  }
  /**
   * Get all user's trades across all rounds
   * GET /api/trading/my-trades
   * Backend returns: { success, count, data: [ ...userTrades ] }
   */
  async getAllMyTrades(): Promise<UserTrades[]> {
    try {
      const response = await apiCall<AllUserTradesResponse>(
        apiClient.get("/trading/my-trades")
      );

      if (response.success) {
        return response.data;
      }
      return [];
    } catch (error: any) {
      console.error("Error fetching all trades:", error);
      return [];
    }
  }

  /**
   * Check user's winnings in a round
   * GET /api/trading/rounds/:roundId/check-winnings
   * Backend returns: { success, data: { hasWon, winnings, totalAmount, result, walletBalance } }
   */
  async checkWinnings(roundId: string): Promise<WinningsResponse["data"] | null> {
    try {
      const response = await apiCall<WinningsResponse>(
        apiClient.get(`/trading/rounds/${roundId}/check-winnings`)
      );

      if (response.success) {
        return response.data;
      }
      return null;
    } catch (error: any) {
      console.error("Error checking winnings:", error);
      return null;
    }
  }

  /**
   * Get wallet balance
   * GET /api/trading/wallet-balance
   */
  async getWalletBalance(): Promise<WalletBalanceResponse["data"]> {
    try {
      const response = await apiCall<WalletBalanceResponse>(
        apiClient.get("/trading/wallet-balance")
      );

      if (response.success) {
        return response.data;
      }
      
      // Return default structure
      return {
        balance: 0,
        formattedBalance: "₹0.00",
        status: "active",
        canTrade: false,
      };
    } catch (error: any) {
      console.error("Error fetching wallet balance:", error);
      return {
        balance: 0,
        formattedBalance: "₹0.00",
        status: "active",
        canTrade: false,
      };
    }
  }

  // Helper methods
  getAllColors(): TradingColor[] {
    return this.colors;
  }

  getBetAmounts(): number[] {
    return this.betAmounts;
  }

  getColorConfig(color: TradingColor): ColorConfig {
    return this.colorConfigs[color] || this.colorConfigs.red;
  }

  /**
   * Calculate time remaining in seconds
   */
  calculateTimeRemaining(endTime: any): number {
    try {
      let endDate: Date;
      
      // Handle Firestore Timestamp
      if (endTime?.toDate) {
        endDate = endTime.toDate();
      } 
      // Handle ISO string
      else if (typeof endTime === 'string') {
        endDate = new Date(endTime);
      }
      // Handle Date object
      else if (endTime instanceof Date) {
        endDate = endTime;
      } else {
        return 0;
      }

      const now = new Date();
      const diff = endDate.getTime() - now.getTime();
      return Math.max(0, Math.floor(diff / 1000));
    } catch (error) {
      console.error("Error calculating time remaining:", error);
      return 0;
    }
  }

  /**
   * Format time in MM:SS format
   */
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
}

export const tradingService = new TradingService();
export default tradingService;
