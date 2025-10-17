import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import Card from '@/components/common/Card';
import { formatCurrency } from '@/utils/helpers';
import toast from 'react-hot-toast';
import { useCart } from '@/hooks/useCart';
import { CartSummaryBar } from '@/components/trading/CartSummaryBar';
import { CartDrawer } from '@/components/trading/CartDrawer';
import { ShoppingCart } from 'lucide-react';

// Types
interface Plan {
  id: string;
  amount: number;
  label: string;
}

interface Color {
  id: string;
  name: string;
  color: string;
  textColor: string;
}

interface Bet {
  id: string;
  colorId: string;
  amount: number;
  timestamp: number;
}

interface GameRound {
  id: string;
  startTime: number;
  endTime: number;
  bettingEndTime: number;
  winningColor?: string;
  status: 'betting' | 'drawing' | 'finished';
}

// Constants
const ROUND_DURATION = 3 * 60 * 1000; // 3 minutes
const BETTING_DURATION = 2.5 * 60 * 1000; // 2.5 minutes (betting closes 30 sec before round ends)

const plans: Plan[] = [
  { id: '1', amount: 10, label: '₹10' },
  { id: '2', amount: 20, label: '₹20' },
  { id: '3', amount: 50, label: '₹50' },
  { id: '4', amount: 100, label: '₹100' },
];

const colors: Color[] = [
  { id: 'red', name: 'Red', color: '#DC2626', textColor: 'white' },
  { id: 'blue', name: 'Blue', color: '#2563EB', textColor: 'white' },
  { id: 'green', name: 'Green', color: '#16A34A', textColor: 'white' },
  { id: 'yellow', name: 'Yellow', color: '#EAB308', textColor: 'black' },
  { id: 'orange', name: 'Orange', color: '#EA580C', textColor: 'white' },
  { id: 'purple', name: 'Purple', color: '#9333EA', textColor: 'white' },
  { id: 'black', name: 'Black', color: '#374151', textColor: 'white' },
  { id: 'white', name: 'White', color: '#F3F4F6', textColor: 'black' },
  { id: 'brown', name: 'Brown', color: '#92400E', textColor: 'white' },
  { id: 'pink', name: 'Pink', color: '#EC4899', textColor: 'white' },
  { id: 'cyan', name: 'Cyan', color: '#0891B2', textColor: 'white' },
  { id: 'grey', name: 'Grey', color: '#6B7280', textColor: 'white' },
];

export default function Trading() {
  const { wallet, refreshWallet } = useWallet();
  const { cart, addItem, removeItem, clearCart, validateCartBalance } = useCart();
  const [selectedPlan, setSelectedPlan] = useState<Plan>(plans[0]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [currentRound, setCurrentRound] = useState<GameRound | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [bets, setBets] = useState<Bet[]>([]);
  const [gameHistory, setGameHistory] = useState<GameRound[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize a new round (wrapped in useCallback to prevent infinite loops)
  const initializeRound = useCallback(() => {
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
    setSelectedColors([]);
  }, []);

  // Initialize game round on mount
  useEffect(() => {
    document.title = 'Color Trading - WeNews';
    initializeRound();
    
    // Load wallet data separately when needed
    refreshWallet().catch(err => {
      console.error('Failed to load wallet:', err);
    });
  }, [initializeRound, refreshWallet]);

  // Draw winner and calculate results (wrapped in useCallback)
  const drawWinner = useCallback(() => {
    if (!currentRound) return;

    // Select random winning color
    const winningColor = colors[Math.floor(Math.random() * colors.length)];
    
    const finishedRound: GameRound = {
      ...currentRound,
      status: 'finished',
      winningColor: winningColor.id,
    };
    
    setCurrentRound(finishedRound);
    
    // Calculate winnings
    const winningBets = bets.filter(bet => bet.colorId === winningColor.id);
    const totalWinnings = winningBets.reduce((sum, bet) => sum + (bet.amount * 2), 0);
    
    if (totalWinnings > 0) {
      toast.success(`🎉 You won ${formatCurrency(totalWinnings)}! Winning color: ${winningColor.name}`, {
        duration: 5000,
      });
      refreshWallet();
    } else if (bets.length > 0) {
      toast.error(`Better luck next time! Winning color was ${winningColor.name}`, {
        duration: 4000,
      });
    }

    // Add to history
    setGameHistory(prev => [finishedRound, ...prev.slice(0, 9)]);

    // Start new round after 5 seconds
    setTimeout(() => {
      initializeRound();
    }, 5000);
  }, [currentRound, bets, refreshWallet, initializeRound]);

  // Timer countdown
  useEffect(() => {
    if (!currentRound) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = currentRound.endTime - now;

      if (remaining <= 0) {
        // Round finished - draw winner
        if (currentRound.status !== 'finished') {
          drawWinner();
        }
      } else if (now >= currentRound.bettingEndTime && currentRound.status === 'betting') {
        // Betting closed - waiting for result
        setCurrentRound(prev => prev ? { ...prev, status: 'drawing' } : null);
        setTimeLeft(remaining);
      } else {
        setTimeLeft(remaining);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [currentRound?.id, currentRound?.endTime, currentRound?.bettingEndTime, currentRound?.status, drawWinner]);

  // Toggle color selection
  const toggleColor = (colorId: string) => {
    if (currentRound?.status !== 'betting') {
      toast.error('Betting is closed!');
      return;
    }

    setSelectedColors(prev => {
      if (prev.includes(colorId)) {
        return prev.filter(id => id !== colorId);
      } else {
        return [...prev, colorId];
      }
    });
  };

  // Add to cart
  const addToCart = () => {
    if (!currentRound || currentRound.status !== 'betting') {
      toast.error('Betting is closed!');
      return;
    }

    if (selectedColors.length === 0) {
      toast.error('Please select at least one color');
      return;
    }

    const totalBetAmount = selectedColors.length * selectedPlan.amount;
    
    // Add each color as a separate order or as a single combined order
    const result = addItem({
      roundId: currentRound.id,
      gameType: 'color',
      options: [...selectedColors], // Copy the array
      amount: totalBetAmount,
    });

    if (result.success) {
      toast.success(result.message);
      setSelectedColors([]);
    } else {
      toast.error(result.message);
    }
  };

  // Submit all cart orders
  const submitCartOrders = async () => {
    if (!currentRound) {
      toast.error('No active round!');
      return;
    }

    // Validate balance
    const balanceCheck = validateCartBalance(wallet?.balance || 0);
    if (!balanceCheck.isValid) {
      toast.error(balanceCheck.message);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // In this simulation, we'll just move cart items to bets
      // In real app, this would call the batch API endpoint
      
      const cartBets: Bet[] = cart.items.map(item => ({
        id: `bet-${Date.now()}-${Math.random()}`,
        colorId: item.options[0], // For now, use first color
        amount: item.amount,
        timestamp: Date.now(),
      }));

      setBets(prev => [...prev, ...cartBets]);
      
      toast.success(`Successfully placed ${cart.items.length} orders for ${formatCurrency(cart.totalAmount)}!`, {
        duration: 4000,
      });
      
      clearCart();
      setIsCartOpen(false);
      
      // Refresh wallet to show updated balance
      setTimeout(() => refreshWallet(), 500);
    } catch (error) {
      console.error('Failed to submit orders:', error);
      toast.error('Failed to place orders. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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

  // Calculate total bet amount for selected colors
  const getTotalBetAmount = () => {
    return selectedColors.length * selectedPlan.amount;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto pb-6">
      <div className="mb-6">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-foreground">Color Trading Game</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Select colors and place your bets. Win 2x your bet amount!
        </p>
      </div>

      {/* Wallet Balance */}
      <Card className="mb-6 bg-gradient-to-r from-green-500 to-green-600 text-white p-6">
        <div className="text-sm opacity-90 mb-1">Your Balance</div>
        <div className="text-3xl font-bold">{formatCurrency(wallet?.balance || 0)}</div>
      </Card>

      {/* Game Status */}
      <Card className="mb-6 p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
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

      {/* Cart Status Banner */}
      {cart.totalItems > 0 && (
        <Card className="mb-6 p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white border-2 border-yellow-400">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingCart size={24} />
              <div>
                <div className="text-lg font-black">🛒 {cart.totalItems} ORDERS IN CART</div>
                <div className="text-sm opacity-90">Click the cart button to review and place orders</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black">₹{cart.totalAmount}</div>
              <div className="text-sm opacity-90">Total Amount</div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Game Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Color Grid */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Select Colors</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {colors.map(color => {
                const isSelected = selectedColors.includes(color.id);
                const isWinning = currentRound?.winningColor === color.id && currentRound.status === 'finished';
                
                return (
                  <button
                    key={color.id}
                    onClick={() => toggleColor(color.id)}
                    disabled={currentRound?.status !== 'betting'}
                    className={`
                      relative aspect-square rounded-lg font-semibold text-sm
                      transition-all duration-200 transform
                      ${currentRound?.status === 'betting' ? 'hover:scale-105 cursor-pointer' : 'cursor-not-allowed opacity-60'}
                      ${isSelected ? 'ring-4 ring-yellow-400 scale-105' : ''}
                      ${isWinning ? 'ring-4 ring-green-400 animate-pulse' : ''}
                      disabled:cursor-not-allowed
                    `}
                    style={{ 
                      backgroundColor: color.color,
                      color: color.textColor,
                    }}
                  >
                    {color.name}
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 bg-yellow-400 text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                    )}
                    {isWinning && (
                      <div className="absolute -top-2 -right-2 bg-green-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        🏆
                      </div>
                    )}
                  </button>
                );
              })}
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
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white ring-2 ring-green-400' 
                      : 'bg-muted hover:bg-muted/80'
                    }
                  `}
                >
                  {plan.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Add to Cart Button */}
          {selectedColors.length > 0 && (
            <Card className="p-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
              {cart.totalItems > 0 && (
                <div className="mb-3 p-2 bg-white/20 rounded-lg text-center text-sm">
                  📦 {cart.totalItems} {cart.totalItems === 1 ? 'order' : 'orders'} in cart (₹{cart.totalAmount})
                </div>
              )}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm opacity-90">Total Bet Amount</div>
                  <div className="text-2xl font-bold">{formatCurrency(getTotalBetAmount())}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm opacity-90">Selected Colors</div>
                  <div className="text-2xl font-bold">{selectedColors.length}</div>
                </div>
              </div>
              <button 
                onClick={addToCart}
                disabled={currentRound?.status !== 'betting'}
                className="w-full bg-white text-orange-600 hover:bg-orange-50 hover:text-orange-700 font-bold text-lg py-4 px-6 rounded-xl flex items-center justify-center gap-3 shadow-lg border-2 border-orange-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                <ShoppingCart size={22} />
                {currentRound?.status === 'betting' ? 'Add to Cart' : 'Betting Closed'}
              </button>
            </Card>
          )}

          {/* Current Bets */}
          {bets.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Your Bets This Round</h2>
              <div className="space-y-2">
                {bets.map(bet => {
                  const color = colors.find(c => c.id === bet.colorId);
                  const isWinning = currentRound?.winningColor === bet.colorId && currentRound.status === 'finished';
                  
                  return (
                    <div 
                      key={bet.id}
                      className={`
                        flex items-center justify-between p-3 rounded-lg
                        ${isWinning ? 'bg-green-100 border-2 border-green-500' : 'bg-muted'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded"
                          style={{ backgroundColor: color?.color }}
                        />
                        <span className="font-semibold">{color?.name}</span>
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
                      {formatCurrency(bets.filter(b => b.colorId === currentRound.winningColor).reduce((sum, b) => sum + (b.amount * 2), 0))}
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
                {gameHistory.map((round, index) => {
                  const winningColor = colors.find(c => c.id === round.winningColor);
                  
                  return (
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
                      {winningColor && (
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: winningColor.color }}
                          />
                          <span className="font-semibold text-sm">{winningColor.name}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Game Rules */}
          <Card className="p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">How to Play</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">1.</span>
                <span>Select one or more colors you think will win</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">2.</span>
                <span>Choose your bet amount (₹10, ₹20, ₹50, or ₹100)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">3.</span>
                <span>Place your bet before the 2.5 minute mark</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">4.</span>
                <span>Wait for the result - win 2x your bet!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">⏱️</span>
                <span>Each round lasts 3 minutes</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Cart Summary Bar - Fixed at bottom */}
      <CartSummaryBar
        itemCount={cart.totalItems}
        totalAmount={cart.totalAmount}
        isExpanded={isCartOpen}
        onToggle={() => setIsCartOpen(!isCartOpen)}
      />

      {/* Cart Drawer - Slides up from bottom */}
      <CartDrawer
        cart={cart}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onRemoveItem={removeItem}
        onClearCart={clearCart}
        onSubmitOrders={submitCartOrders}
        walletBalance={wallet?.balance || 0}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
