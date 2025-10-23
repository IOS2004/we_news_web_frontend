import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { tradingService } from '@/services/tradingApi';
import { socketService } from '@/services/socketService';
import type { TradingRound, TradingColor, Trade } from '@/types/trading';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/utils/helpers';

export default function ColorTrading() {
  const navigate = useNavigate();
  const [activeRound, setActiveRound] = useState<TradingRound | null>(null);
  const [myTrades, setMyTrades] = useState<Record<TradingColor, Trade[]>>({} as any);
  const [selectedColor, setSelectedColor] = useState<TradingColor | null>(null);
  const [betAmount, setBetAmount] = useState<number>(100);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  const colors = tradingService.getAllColors();
  const betAmounts = tradingService.getBetAmounts();

  const loadData = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      // Get wallet balance
      const walletData = await tradingService.getWalletBalance();
      setWalletBalance(walletData.balance);

      // Get active colour round
      const roundsData = await tradingService.getActiveRounds('colour');
      
      if (roundsData && roundsData.length > 0) {
        const round = roundsData[0];
        
        setActiveRound(round);
        
        // Calculate time remaining
        const remaining = tradingService.calculateTimeRemaining(round.resultDeclarationTime);
        setTimeRemaining(remaining > 0 ? remaining : 0);

        // Get my trades in this round
        try {
          const tradesData = await tradingService.getMyTradesInRound(round.id);
          setMyTrades(tradesData.colorTrades || {});
        } catch (err) {
          console.error('Error loading trades:', err);
          setMyTrades({} as any);
        }
      } else {
        setActiveRound(null);
        setMyTrades({} as any);
        setTimeRemaining(0);
      }
    } catch (error: any) {
      console.error('❌ Error loading data:', error);
      toast.error('Failed to load trading data');
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, []);

  // Initial data load and Socket.IO setup
  useEffect(() => {
    loadData(true);
    
    // Connect to socket
    const token = localStorage.getItem('auth_token');
    socketService.connect(token || undefined);
    
    // Join colour trading room
    socketService.joinTradingRoom('colour');

    // Listen for round events
    const unsubscribeCreated = socketService.onRoundCreated((round) => {
      if (round.roundType === 'colour') {
        console.log('🆕 New colour round created via socket');
        setActiveRound(round);
        setMyTrades({} as any);
        const remaining = tradingService.calculateTimeRemaining(round.resultDeclarationTime);
        setTimeRemaining(remaining > 0 ? remaining : 0);
      }
    });

    const unsubscribeUpdated = socketService.onRoundUpdated((round) => {
      if (round.roundType === 'colour' && round.id === activeRound?.id) {
        console.log('🔄 Round updated via socket');
        setActiveRound(round);
      }
    });

    const unsubscribeClosed = socketService.onRoundClosed((round) => {
      if (round.roundType === 'colour' && round.id === activeRound?.id) {
        console.log('🔒 Round closed via socket');
        setActiveRound(round);
        setTimeRemaining(0);
      }
    });

    const unsubscribeFinalized = socketService.onRoundFinalized((data) => {
      if (data.round.roundType === 'colour') {
        console.log('🏆 Round finalized via socket, reloading data...');
        toast.success(`Round ended! Result: ${data.round.result}`);
        // Load new round
        setTimeout(() => loadData(), 2000);
      }
    });

    const unsubscribeCountdown = socketService.onCountdownTick((data) => {
      if (activeRound && data.roundId === activeRound.id) {
        setTimeRemaining(data.secondsRemaining > 0 ? data.secondsRemaining : 0);
      }
    });

    // Cleanup on unmount
    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeClosed();
      unsubscribeFinalized();
      unsubscribeCountdown();
      socketService.leaveTradingRoom('colour');
    };
  }, [loadData, activeRound?.id]);

  // Timer only for backup/display (real timer comes from socket countdown:tick)
  useEffect(() => {
    if (activeRound) {
      const timer = setInterval(() => {
        const remaining = tradingService.calculateTimeRemaining(activeRound.resultDeclarationTime);
        if (remaining <= 0 && timeRemaining > 0) {
          // Round should have ended, reload
          loadData();
        }
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [activeRound, timeRemaining, loadData]);

  const handlePlaceTrade = async () => {
    if (!selectedColor) {
      toast.error('Please select a color');
      return;
    }

    if (!activeRound) {
      toast.error('No active round');
      return;
    }

    if (betAmount <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }

    if (betAmount > walletBalance) {
      toast.error('Insufficient wallet balance');
      return;
    }

    if (timeRemaining <= 10) {
      toast.error('Trading closing soon. Please wait for next round.');
      return;
    }

    try {
      setPlacing(true);
      
      const tradeResult = await tradingService.placeTrade(
        activeRound.id,
        'colour',
        selectedColor,
        betAmount
      );

      if (tradeResult?.transaction?.newBalance !== undefined) {
        setWalletBalance(tradeResult.transaction.newBalance);
      }

      // Reload data to show updated trades and balance
      await loadData();
      
      setSelectedColor(null);
      setBetAmount(100);
    } catch (error: any) {
      console.error('Error placing trade:', error);
      // Error already shown by API interceptor
    } finally {
      setPlacing(false);
    }
  };

  const getMyBetOnColor = (color: TradingColor): number => {
    const trades = myTrades[color] || [];
    return trades.reduce((sum, trade) => sum + trade.amount, 0);
  };

  const getTotalBetAmount = (): number => {
    return Object.values(myTrades).flat().reduce((sum, trade) => sum + trade.amount, 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!activeRound) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold mb-2">No Active Color Round</h2>
          <p className="text-muted-foreground mb-6">
            Please wait for the next round to start
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Color Trading</h1>
        <p className="text-muted-foreground">Round #{activeRound.roundNumber}</p>
      </div>

      {/* Timer and Balance Card */}
      <Card className="mb-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Timer */}
            <div className="text-center">
              <div className="text-sm opacity-90 mb-2">Time Remaining</div>
              <div className={`text-5xl font-bold font-mono ${timeRemaining <= 10 ? 'text-red-300 animate-pulse' : ''}`}>
                {tradingService.formatTime(timeRemaining)}
              </div>
              <div className="text-xs mt-2 opacity-75">
                {timeRemaining <= 10 ? 'Trading Closing!' : 'Place your bets'}
              </div>
            </div>

            {/* Wallet Balance */}
            <div className="text-center border-l border-r border-white/20">
              <div className="text-sm opacity-90 mb-2">Wallet Balance</div>
              <div className="text-3xl font-bold">
                {formatCurrency(walletBalance)}
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="mt-2 bg-white text-blue-600 hover:bg-gray-100"
                onClick={() => navigate('/add-money')}
              >
                Add Money
              </Button>
            </div>

            {/* My Bets */}
            <div className="text-center">
              <div className="text-sm opacity-90 mb-2">Total Bet This Round</div>
              <div className="text-3xl font-bold">
                {formatCurrency(getTotalBetAmount())}
              </div>
              <div className="text-xs mt-2 opacity-75">
                {Object.values(myTrades).flat().length} bets placed
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Color Selection Grid */}
      <Card className="mb-6 p-6">
        <h2 className="text-xl font-bold mb-4">Select Color</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {colors.map((color) => {
            const config = tradingService.getColorConfig(color);
            const myBet = getMyBetOnColor(color);
            const isSelected = selectedColor === color;
            
            return (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                disabled={timeRemaining <= 10}
                className={`
                  relative p-4 rounded-lg border-2 transition-all
                  ${config.bgClass} ${config.textClass} ${config.borderClass}
                  ${isSelected ? 'ring-4 ring-yellow-400 scale-105' : 'opacity-90'}
                  ${timeRemaining <= 10 ? 'opacity-50 cursor-not-allowed' : config.hoverClass + ' cursor-pointer'}
                `}
              >
                <div className="text-center">
                  <div className="font-bold text-lg">{config.displayName}</div>
                  {myBet > 0 && (
                    <div className="text-xs mt-1 bg-black/20 rounded px-2 py-1">
                      ₹{myBet}
                    </div>
                  )}
                </div>
                {isSelected && (
                  <div className="absolute top-1 right-1">
                    <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Bet Amount Selection */}
      <Card className="mb-6 p-6">
        <h2 className="text-xl font-bold mb-4">Bet Amount</h2>
        
        {/* Quick Select */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-4">
          {betAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => setBetAmount(amount)}
              className={`
                p-3 rounded-lg border-2 font-semibold transition-all
                ${betAmount === amount 
                  ? 'bg-blue-500 text-white border-blue-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }
              `}
            >
              ₹{amount}
            </button>
          ))}
        </div>

        {/* Custom Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Amount
          </label>
          <input
            type="number"
            min="1"
            max={walletBalance}
            value={betAmount}
            onChange={(e) => setBetAmount(Number(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter amount"
          />
        </div>
      </Card>

      {/* Place Trade Button */}
      <Card className="p-6">
        <Button
          onClick={handlePlaceTrade}
          loading={placing}
          disabled={!selectedColor || betAmount <= 0 || timeRemaining <= 10 || placing}
          fullWidth
          size="lg"
          className="text-xl py-6"
        >
          {placing ? 'Placing Trade...' : `Place Trade - ${formatCurrency(betAmount)}`}
        </Button>
        
        {selectedColor && (
          <div className="mt-4 text-center text-sm text-gray-600">
            Betting {formatCurrency(betAmount)} on{' '}
            <span className="font-bold">{tradingService.getColorConfig(selectedColor).displayName}</span>
          </div>
        )}
      </Card>

      {/* View History */}
      <div className="mt-6 text-center">
        <Button
          variant="outline"
          onClick={() => navigate('/trading-history')}
        >
          View Trading History
        </Button>
      </div>
    </div>
  );
}
