import api from "./api";
import type {
  Trade,
  TradingStats,
  ApiResponse,
  PaginatedResponse,
} from "@/types";

export const tradingService = {
  // Place a trade
  async placeTrade(
    gameType: "color" | "number",
    betAmount: number,
    selectedOption: string | number
  ): Promise<Trade> {
    const response = await api.post<ApiResponse<Trade>>("/trading/place-bet", {
      gameType,
      betAmount,
      selectedOption,
    });
    return response.data.data!;
  },

  // Get trading history
  async getTradingHistory(
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Trade>> {
    const response = await api.get<PaginatedResponse<Trade>>(
      "/trading/history",
      {
        params: { page, limit },
      }
    );
    return response.data;
  },

  // Get trading stats
  async getTradingStats(): Promise<TradingStats> {
    const response = await api.get<ApiResponse<TradingStats>>("/trading/stats");
    return response.data.data!;
  },

  // Get game result
  async getGameResult(tradeId: string): Promise<Trade> {
    const response = await api.get<ApiResponse<Trade>>(`/trading/${tradeId}`);
    return response.data.data!;
  },
};
