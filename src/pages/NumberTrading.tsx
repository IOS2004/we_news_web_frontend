import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@/contexts/WalletContext';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { formatCurrency } from '@/utils/helpers';
import toast from 'react-hot-toast';

// Types
interface Plan {
  id: string;
  amount: number;
  label: string;
}

interface Bet {
  id: string;
  number: number;
  amount: number;
  timestamp: number;
}

interface GameRound {
  id: string;
  startTime: number;
  endTime: number;
  bettingEndTime: number;
  winningNumber?: number;
  status: 'betting' | 'drawing' | 'finished';
}

// Constants
const ROUND_DURATION = 3 * 60 * 1000; // 3 minutes
const BETTING_DURATION = 2.5 * 60 * 1000; // 2.5 minutes

const plans: Plan[] = [
  { id: '1', amount: 10, label: '₹10' },
  { id: '2', amount: 20, label: '₹20' },
  { id: '3', amount: 50, label: '₹50' },
  { id: '4', amount: 100, label: '₹100' },
];

// Generate numbers 0-100
const numbers = Array.from({ length: 101 }, (_, i) => i);

export default function NumberTrading() {
  const { wallet, refreshWallet } = useWallet();
  const [selectedPlan, setSelectedPlan] = useState<Plan>(plans[0]);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [currentRound, setCurrentRound] = useState<GameRound | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [bets, setBets] = useState<Bet[]>([]);
  const [gameHistory, setGameHistory] = useState<GameRound[]>([]);

  // Initialize game round
  useEffect(() => {
    document.title = 'Number Trading - WeNews';
    refreshWallet();
    initializeRound();
  }, []);

  const initializeRound = () => {
    const now = Date.now();
    const newRound: GameRound = {
      id: `round-${now}`,
      startTime: now,
      endTime: now + ROUND_DURATION,
      bettingEndTime: now + BETTING_DURATION,
      status: 'betting',
    };
    setCurrentRound(newRound);
    setTimeLeft(ROUND_DURATION);
    setBets([]);
    setSelectedNumbers([]);
  };

  // Timer countdown
  useEffect(() => {
    if (!currentRound) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = currentRound.endTime - now;

      if (remaining <= 0) {
        if (currentRound.status !== 'finished') {
          drawWinner();
        }
      } else if (now >= currentRound.bettingEndTime && currentRound.status === 'betting') {
        setCurrentRound({ ...currentRound, status: 'drawing' });
        setTimeLeft(remaining);
      } else {
        setTimeLeft(remaining);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [currentRound]);

  // Draw winner and calculate results
  const drawWinner = () => {
    if (!currentRound) return;

    // Generate random winning number (0-100)
    const winningNumber = Math.floor(Math.random() * 101);
    
    const finishedRound: GameRound = {
      ...currentRound,
      status: 'finished',
      winningNumber,
    };
    
    setCurrentRound(finishedRound);
    
    // Calculate winnings
    const winningBets = bets.filter(bet => bet.number === winningNumber);
    const totalWinnings = winningBets.reduce((sum, bet) => sum + (bet.amount * 2), 0);
    
    if (totalWinnings > 0) {
      toast.success(`🎉 You won ${formatCurrency(totalWinnings)}! Winning number: ${winningNumber}`, {
        duration: 5000,
      });
      refreshWallet();
    } else if (bets.length > 0) {
      toast.error(`Better luck next time! Winning number was ${winningNumber}`, {
        duration: 4000,
      });
    }

    // Add to history
    setGameHistory(prev => [finishedRound, ...prev.slice(0, 9)]);

    // Start new round after 5 seconds
    setTimeout(() => {
      initializeRound();
    }, 5000);
  };

  // Toggle number selection
  const toggleNumber = (number: number) => {
    if (currentRound?.status !== 'betting') {
      toast.error('Betting is closed!');
      return;
    }

    setSelectedNumbers(prev => {
      if (prev.includes(number)) {
        return prev.filter(n => n !== number);
      } else {
        return [...prev, number];
      }
    });
  };

  // Place bet
  const placeBet = async () => {
    if (!currentRound || currentRound.status !== 'betting') {
      toast.error('Betting is closed!');
      return;
    }

    if (selectedNumbers.length === 0) {
      toast.error('Please select at least one number');
      return;
    }

    const totalBetAmount = selectedNumbers.length * selectedPlan.amount;
    
    if ((wallet?.balance || 0) < totalBetAmount) {
      toast.error('Insufficient balance!');
      return;
    }

    // Create bets
    const newBets: Bet[] = selectedNumbers.map(number => ({
      id: `bet-${Date.now()}-${number}`,
      number,
      amount: selectedPlan.amount,
      timestamp: Date.now(),
    }));

    setBets(prev => [...prev, ...newBets]);
    setSelectedNumbers([]);
    
    toast.success(`Bet placed: ${formatCurrency(totalBetAmount)} on ${selectedNumbers.length} number(s)`, {
      duration: 3000,
    });
    
    setTimeout(() => refreshWallet(), 500);
  };

  // Format time remaining
  const formatTime = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get status message
  const getStatusMessage = () => {
    if (!currentRound) return 'Loading...';
    
    if (currentRound.status === 'betting') {
      return `Betting Open - ${formatTime(timeLeft)} remaining`;
    } else if (currentRound.status === 'drawing') {
      return `Drawing Winner - ${formatTime(timeLeft)} remaining`;
    } else {
      return 'Round Finished - Next round starting...';
    }
  };

  // Calculate total bet amount for selected numbers
  const getTotalBetAmount = () => {
    return selectedNumbers.length * selectedPlan.amount;
  };

  // Group numbers by tens for better display
  const groupedNumbers = Array.from({ length: 11 }, (_, i) => {
    const start = i * 10;
    const end = i === 10 ? 101 : start + 10;
    return numbers.slice(start, end);
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-foreground">Trading Games</h1>
          <Link 
            to="/trading"
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
          >
            ← Switch to Color Trading
          </Link>
        </div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Number Trading Game</h2>
        <p className="text-muted-foreground">
          Select numbers from 0-100 and place your bets. Win 2x your bet amount!
        </p>
      </div>

      {/* Wallet Balance */}
      <Card className="mb-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
        <div className="text-sm opacity-90 mb-1">Your Balance</div>
        <div className="text-3xl font-bold">{formatCurrency(wallet?.balance || 0)}</div>
      </Card>

      {/* Game Status */}
      <Card className="mb-6 p-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm opacity-90">Round Status</div>
            <div className="text-xl font-bold">{getStatusMessage()}</div>
          </div>
          {currentRound && (
            <div className="text-right">
              <div className="text-sm opacity-90">Round ID</div>
              <div className="text-xs font-mono">#{currentRound.id.slice(-8)}</div>
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Game Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Number Grid */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Select Numbers (0-100)</h2>
            <div className="space-y-3">
              {groupedNumbers.map((group, groupIndex) => (
                <div key={groupIndex} className="space-y-2">
                  <div className="text-xs text-muted-foreground font-semibold">
                    {groupIndex * 10} - {groupIndex === 10 ? 100 : (groupIndex * 10 + 9)}
                  </div>
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                    {group.map(number => {
                      const isSelected = selectedNumbers.includes(number);
                      const isWinning = currentRound?.winningNumber === number && currentRound.status === 'finished';
                      const hasBet = bets.some(bet => bet.number === number);
                      
                      return (
                        <button
                          key={number}
                          onClick={() => toggleNumber(number)}
                          disabled={currentRound?.status !== 'betting'}
                          className={`
                            relative aspect-square rounded-lg font-bold text-sm
                            transition-all duration-200 transform
                            ${currentRound?.status === 'betting' ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed opacity-60'}
                            ${isSelected ? 'bg-yellow-500 text-black ring-2 ring-yellow-400 scale-110' : 'bg-gradient-to-br from-gray-700 to-gray-800 text-white'}
                            ${isWinning ? 'bg-green-500 ring-4 ring-green-400 animate-pulse' : ''}
                            ${hasBet && !isSelected ? 'ring-2 ring-blue-400' : ''}
                            disabled:cursor-not-allowed flex items-center justify-center
                          `}
                        >
                          {number}
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 bg-yellow-400 text-black rounded-full w-4 h-4 flex items-center justify-center text-xs">
                              ✓
                            </div>
                          )}
                          {isWinning && (
                            <div className="absolute -top-1 -right-1 bg-green-400 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                              🏆
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Bet Amount Selector */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Select Bet Amount</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {plans.map(plan => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`
                    p-4 rounded-lg font-semibold text-lg
                    transition-all duration-200 transform hover:scale-105
                    ${selectedPlan.id === plan.id 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white ring-2 ring-blue-400' 
                      : 'bg-muted hover:bg-muted/80'
                    }
                  `}
                >
                  {plan.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Place Bet Button */}
          {selectedNumbers.length > 0 && (
            <Card className="p-6 bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm opacity-90">Total Bet Amount</div>
                  <div className="text-2xl font-bold">{formatCurrency(getTotalBetAmount())}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm opacity-90">Selected Numbers</div>
                  <div className="text-2xl font-bold">{selectedNumbers.length}</div>
                </div>
              </div>
              <div className="mb-4 flex flex-wrap gap-2">
                {selectedNumbers.sort((a, b) => a - b).map(num => (
                  <span key={num} className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                    {num}
                  </span>
                ))}
              </div>
              <Button 
                onClick={placeBet}
                disabled={currentRound?.status !== 'betting'}
                className="w-full bg-white text-orange-600 hover:bg-gray-100 font-bold text-lg py-3"
              >
                {currentRound?.status === 'betting' ? 'Place Bet' : 'Betting Closed'}
              </Button>
            </Card>
          )}

          {/* Current Bets */}
          {bets.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Your Bets This Round</h2>
              <div className="space-y-2">
                {bets.map(bet => {
                  const isWinning = currentRound?.winningNumber === bet.number && currentRound.status === 'finished';
                  
                  return (
                    <div 
                      key={bet.id}
                      className={`
                        flex items-center justify-between p-3 rounded-lg
                        ${isWinning ? 'bg-green-100 border-2 border-green-500' : 'bg-muted'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 text-white flex items-center justify-center font-bold">
                          {bet.number}
                        </div>
                        {isWinning && <span className="text-green-600 font-bold">🏆 Winner!</span>}
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(bet.amount)}</div>
                        {isWinning && (
                          <div className="text-sm text-green-600 font-semibold">
                            Win: {formatCurrency(bet.amount * 2)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Bet:</span>
                  <span className="font-bold">{formatCurrency(bets.reduce((sum, b) => sum + b.amount, 0))}</span>
                </div>
                {currentRound?.status === 'finished' && (
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Total Winnings:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(bets.filter(b => b.number === currentRound.winningNumber).reduce((sum, b) => sum + (b.amount * 2), 0))}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar - Game History */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Game History</h2>
            {gameHistory.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                No history yet. Start playing!
              </p>
            ) : (
              <div className="space-y-3">
                {gameHistory.map((round, index) => (
                  <div 
                    key={round.id}
                    className="p-3 rounded-lg bg-muted border border-border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">
                        Round #{gameHistory.length - index}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(round.startTime).toLocaleTimeString()}
                      </span>
                    </div>
                    {round.winningNumber !== undefined && (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-700 text-white flex items-center justify-center font-bold text-sm">
                          {round.winningNumber}
                        </div>
                        <span className="font-semibold text-sm">Winner</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Game Rules */}
          <Card className="p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">How to Play</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">1.</span>
                <span>Select one or more numbers from 0 to 100</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">2.</span>
                <span>Choose your bet amount (₹10, ₹20, ₹50, or ₹100)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">3.</span>
                <span>Place your bet before the 2.5 minute mark</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">4.</span>
                <span>Wait for the result - win 2x your bet!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">⏱️</span>
                <span>Each round lasts 3 minutes</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
