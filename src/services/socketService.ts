import { io, Socket } from "socket.io-client";
import type {
  TradingRound,
  Winning,
  RoundType,
  TradingColor,
  TradingNumber,
  RoundStatus,
} from "@/types/trading";

// Socket event types
interface SocketRoundCreated {
  round: TradingRound;
}

interface SocketRoundUpdated {
  round: TradingRound;
}

interface SocketRoundClosed {
  round: TradingRound;
}

interface SocketRoundFinalized {
  round: TradingRound;
  winners: Winning[];
}

interface SocketTradePlaced {
  roundId: string;
  tradeType: RoundType;
  selection: TradingColor | TradingNumber;
  amount: number;
  userId: string;
}

interface SocketCountdownTick {
  roundId: string;
  secondsRemaining: number;
  status: RoundStatus;
}

// Event callback types
type RoundEventCallback = (round: TradingRound) => void;
type RoundFinalizedCallback = (data: SocketRoundFinalized) => void;
type TradePlacedCallback = (data: SocketTradePlaced) => void;
type CountdownTickCallback = (data: SocketCountdownTick) => void;

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;

  /**
   * Initialize socket connection
   */
  connect(token?: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    const API_URL =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    const baseUrl = API_URL.replace("/api", ""); // Remove /api suffix for socket connection

    this.socket = io(baseUrl, {
      auth: {
        token: token || localStorage.getItem("auth_token"),
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.setupConnectionHandlers();

    return this.socket;
  }

  /**
   * Setup connection event handlers
   */
  private setupConnectionHandlers() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("✅ Socket connected:", this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("Max reconnection attempts reached");
      }
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  }

  /**
   * Disconnect socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  // ==================== TRADING EVENTS ====================

  /**
   * Listen for new round created
   */
  onRoundCreated(callback: RoundEventCallback): () => void {
    if (!this.socket) return () => {};

    this.socket.on("round:created", (data: SocketRoundCreated) => {
      console.log("🆕 New round created:", data.round.roundId);
      callback(data.round);
    });

    return () => this.socket?.off("round:created");
  }

  /**
   * Listen for round updated
   */
  onRoundUpdated(callback: RoundEventCallback): () => void {
    if (!this.socket) return () => {};

    this.socket.on("round:updated", (data: SocketRoundUpdated) => {
      console.log("🔄 Round updated:", data.round.roundId);
      callback(data.round);
    });

    return () => this.socket?.off("round:updated");
  }

  /**
   * Listen for round closed
   */
  onRoundClosed(callback: RoundEventCallback): () => void {
    if (!this.socket) return () => {};

    this.socket.on("round:closed", (data: SocketRoundClosed) => {
      console.log("🔒 Round closed:", data.round.roundId);
      callback(data.round);
    });

    return () => this.socket?.off("round:closed");
  }

  /**
   * Listen for round finalized with results
   */
  onRoundFinalized(callback: RoundFinalizedCallback): () => void {
    if (!this.socket) return () => {};

    this.socket.on("round:finalized", (data: SocketRoundFinalized) => {
      console.log(
        "🏆 Round finalized:",
        data.round.roundId,
        "Winners:",
        data.winners.length
      );
      callback(data);
    });

    return () => this.socket?.off("round:finalized");
  }

  /**
   * Listen for trades placed by anyone (for live updates)
   */
  onTradePlaced(callback: TradePlacedCallback): () => void {
    if (!this.socket) return () => {};

    this.socket.on("trade:placed", (data: SocketTradePlaced) => {
      callback(data);
    });

    return () => this.socket?.off("trade:placed");
  }

  /**
   * Listen for countdown ticks
   */
  onCountdownTick(callback: CountdownTickCallback): () => void {
    if (!this.socket) return () => {};

    this.socket.on("countdown:tick", (data: SocketCountdownTick) => {
      callback(data);
    });

    return () => this.socket?.off("countdown:tick");
  }

  // ==================== ROOM MANAGEMENT ====================

  /**
   * Join a trading room for specific round type
   */
  joinTradingRoom(roundType: RoundType) {
    if (!this.socket) {
      console.warn("Socket not connected, cannot join room");
      return;
    }

    const room = `trading:${roundType}`;
    this.socket.emit("join:room", room);
    console.log(`📥 Joined room: ${room}`);
  }

  /**
   * Leave a trading room
   */
  leaveTradingRoom(roundType: RoundType) {
    if (!this.socket) return;

    const room = `trading:${roundType}`;
    this.socket.emit("leave:room", room);
    console.log(`📤 Left room: ${room}`);
  }

  /**
   * Join specific round room
   */
  joinRoundRoom(roundId: string) {
    if (!this.socket) return;

    const room = `round:${roundId}`;
    this.socket.emit("join:room", room);
    console.log(`📥 Joined round room: ${room}`);
  }

  /**
   * Leave specific round room
   */
  leaveRoundRoom(roundId: string) {
    if (!this.socket) return;

    const room = `round:${roundId}`;
    this.socket.emit("leave:room", room);
    console.log(`📤 Left round room: ${room}`);
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
