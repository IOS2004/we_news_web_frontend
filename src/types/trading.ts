/**
 * Trading System Type Definitions
 * Matches backend data structures for color and number trading
 */

// Trading colors available in the system
export type TradingColor =
  | "red"
  | "blue"
  | "green"
  | "yellow"
  | "orange"
  | "purple"
  | "pink"
  | "brown"
  | "cyan"
  | "magenta"
  | "lime"
  | "violet";

// Trading numbers (0-100)
export type TradingNumber = number; // 0 to 100

// Round type
export type RoundType = "colour" | "number";

// Round status
export type RoundStatus = "active" | "completed" | "cancelled" | "closed";

// Trade summary for a specific color or number
export interface TradeSummary {
  totalAmount: number;
  totalTrades: number;
}

// Individual trade
export interface Trade {
  tradeId: string;
  userId: string;
  amount: number;
  timestamp: any; // Firestore Timestamp
  selection?: TradingColor | TradingNumber | string;
  tradeType?: RoundType;
  status?: "pending" | "won" | "lost";
  winAmount?: number;
  _id?: string;
}

// Trading round
export interface TradingRound {
  id: string; // Firestore document ID
  roundId: string; // Unique round identifier
  roundNumber: number;
  roundType: RoundType;
  startTime: any; // Firestore Timestamp
  resultDeclarationTime: any; // Firestore Timestamp
  status: RoundStatus;
  result?: TradingColor | TradingNumber | null; // Winning color or number
  profitMargin?: number; // Percentage
  maxGiveawayPercent?: number; // Percentage
  mode?: "automatic" | "manual";

  // Color trading data
  colorTradeSummary?: Record<TradingColor, TradeSummary>;
  totalColorAmount?: number;

  // Number trading data
  numberTradeSummary?: Record<number, TradeSummary>;
  totalNumberAmount?: number;

  // General
  totalTrades?: number;
  createdAt?: any;
  updatedAt?: any;
}

// User's trades in a specific round
export interface UserTrades {
  roundId: string;
  userId: string;
  colorTrades: Record<TradingColor, Trade[]>;
  numberTrades: Record<number, Trade[]>;
  totalColorAmount: number;
  totalNumberAmount: number;
  totalAmount: number;
  roundType?: RoundType;
  status?: RoundStatus;
  result?: TradingColor | TradingNumber | null;
  startTime?: any;
  resultDeclarationTime?: any;
}

// Winning entry
export interface Winning {
  userId: string;
  amount: number;
  tradeType: RoundType;
  selection: TradingColor | TradingNumber;
}

// Place trade request
export interface PlaceTradeRequest {
  roundId: string;
  tradeType: RoundType;
  selection: TradingColor | TradingNumber;
  amount: number;
}

// Place trade response
export interface PlaceTradeResponse {
  success: true;
  message: string;
  data: {
    trade: Trade;
    transaction: {
      transactionId: string;
      amount: number;
      previousBalance: number;
      newBalance: number;
    };
    roundInfo: {
      roundId: string;
      roundNumber: number;
      roundType: RoundType;
    };
  };
}

// Active rounds response
export interface ActiveRoundsResponse {
  success: true;
  count: number;
  data: TradingRound[];
}

// Round details response
export interface RoundDetailsResponse {
  success: true;
  data: TradingRound;
}

// User trades response
export interface UserTradesResponse {
  success: true;
  data: UserTrades;
}

// All user trades response
export interface AllUserTradesResponse {
  success: true;
  count: number;
  data: UserTrades[];
}

// Winnings response
export interface WinningsResponse {
  success: true;
  data: {
    hasWon: boolean;
    winnings: Winning[];
    totalAmount: number;
    result: TradingColor | TradingNumber | null;
    walletBalance: number;
  };
}

// Wallet balance response
export interface WalletBalanceResponse {
  success: true;
  data: {
    balance: number;
    formattedBalance: string;
    status: string;
    canTrade: boolean;
  };
}

// Socket.IO event types
export interface SocketRoundCreated {
  round: TradingRound;
}

export interface SocketRoundUpdated {
  round: TradingRound;
}

export interface SocketRoundClosed {
  round: TradingRound;
}

export interface SocketRoundFinalized {
  round: TradingRound;
  winners: Winning[];
}

export interface SocketTradePlaced {
  roundId: string;
  tradeType: RoundType;
  selection: TradingColor | TradingNumber;
  amount: number;
  userId: string;
}

export interface SocketCountdownTick {
  roundId: string;
  secondsRemaining: number;
  status: RoundStatus;
}

// UI-specific types
export interface ColorOption {
  color: TradingColor;
  displayName: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

export interface BetAmount {
  value: number;
  label: string;
}
