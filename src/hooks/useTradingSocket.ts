import { useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import socketService from "@/services/socketService";
import type { TradingRound } from "@/types/trading";

interface UseTradingSocketProps {
  gameType?: "color" | "number";
  onRoundCreated?: (round: TradingRound) => void;
  onRoundUpdated?: (round: TradingRound) => void;
  onRoundClosed?: (round: TradingRound) => void;
  onRoundFinalized?: (data: { round: TradingRound; winners: any[] }) => void;
  enabled?: boolean;
}

/**
 * Hook to manage trading socket connections and events
 */
export const useTradingSocket = ({
  gameType,
  onRoundCreated,
  onRoundUpdated,
  onRoundClosed,
  onRoundFinalized,
  enabled = true,
}: UseTradingSocketProps) => {
  // Handle round finalized (result declared)
  const handleRoundFinalized = useCallback(
    (data: { round: TradingRound; winners: any[] }) => {
      console.log("🏆 Round finalized received:", data);

      const round = data.round;
      let winningOption: string | number = "Unknown";

      if (round.result && typeof round.result === "object") {
        const resultObj = round.result as any;
        winningOption =
          resultObj.winningColor || resultObj.winningNumber || "Unknown";
      }

      // Show toast notification
      toast.success(
        `Result Declared! 🎉\nRound ${round.roundId?.slice(
          0,
          8
        )}...\nWinner: ${winningOption}`,
        {
          duration: 5000,
          icon: "🏆",
          style: {
            background: "#10B981",
            color: "#fff",
            fontWeight: "bold",
          },
        }
      );

      // Call custom handler if provided
      if (onRoundFinalized) {
        onRoundFinalized(data);
      }
    },
    [onRoundFinalized]
  );

  // Handle round closed (trading ended)
  const handleRoundClosed = useCallback(
    (round: TradingRound) => {
      console.log("🔒 Round closed received:", round);

      toast("Trading Closed!\nWaiting for result...", {
        icon: "⏳",
        duration: 3000,
      });

      if (onRoundClosed) {
        onRoundClosed(round);
      }
    },
    [onRoundClosed]
  );

  useEffect(() => {
    if (!enabled) return;

    // Connect socket
    socketService.connect();
    console.log("🔌 Trading socket connected");

    // Join trading room if gameType is specified
    if (gameType) {
      const roomType = gameType === "color" ? "colour" : "number";
      socketService.joinTradingRoom(roomType as any);
    }

    // Setup event listeners
    const unsubscribeCreated = onRoundCreated
      ? socketService.onRoundCreated((round) => {
          console.log("🆕 Round created received:", round);
          onRoundCreated(round);
        })
      : () => {};

    const unsubscribeUpdated = onRoundUpdated
      ? socketService.onRoundUpdated((round) => {
          console.log("🔄 Round updated received:", round);
          onRoundUpdated(round);
        })
      : () => {};

    const unsubscribeClosed = socketService.onRoundClosed(handleRoundClosed);

    const unsubscribeFinalized =
      socketService.onRoundFinalized(handleRoundFinalized);

    // Cleanup on unmount
    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeClosed();
      unsubscribeFinalized();
      console.log("🔌 Trading socket listeners cleaned up");
    };
  }, [
    enabled,
    gameType,
    onRoundCreated,
    onRoundUpdated,
    handleRoundClosed,
    handleRoundFinalized,
  ]);

  return {
    isConnected: socketService.isConnected(),
  };
};
