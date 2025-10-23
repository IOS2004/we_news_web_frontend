import { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useRounds } from '@/contexts/RoundsContext';
import Card from '@/components/common/Card';
import { formatCurrency } from '@/utils/helpers';
import toast from 'react-hot-toast';
import { useCart } from '@/hooks/useCart';
import { CartSummaryBar } from '@/components/trading/CartSummaryBar';
import { CartDrawer } from '@/components/trading/CartDrawer';
import { RoundsList } from '@/components/trading/RoundsList';
import { ShoppingCart, RefreshCw } from 'lucide-react';
import { tradingService } from '@/services/tradingApi';

// Types
interface Plan {
  id: string;
  amount: number;
  label: string;
}

// Constants
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
  const { cart, addItem, removeItem, clearCart, validateCartBalance } = useCart();
  
  // Use rounds context instead of local state
  const {
    numberActiveRounds: activeRounds,
    numberUpcomingRounds: upcomingRounds,
    selectedNumberRoundId: selectedRoundId,
    setSelectedNumberRoundId: setSelectedRoundId,
    isLoadingNumberRounds: isLoadingRounds,
    fetchNumberRounds,
  } = useRounds();
  
  const [selectedPlan, setSelectedPlan] = useState<Plan>(plans[0]);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize on mount - fetch rounds only if not already loaded
  useEffect(() => {
    document.title = 'Number Trading - WeNews';
    fetchNumberRounds(); // Will use cache if data is fresh
    
    // Load wallet data separately when needed
    refreshWallet().catch(err => {
      console.error('Failed to load wallet:', err);
    });
  }, [refreshWallet, fetchNumberRounds]);

  // Toggle number selection
  const toggleNumber = (number: number) => {
    if (!selectedRoundId) {
      toast.error('Please select a round first!');
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

  // Add to cart
  const addToCart = () => {
    // Check if a round is selected
    if (!selectedRoundId) {
      toast.error('Please select a round first!');
      return;
    }

    if (selectedNumbers.length === 0) {
      toast.error('Please select at least one number');
      return;
    }

    const totalBetAmount = selectedNumbers.length * selectedPlan.amount;
    
    // Add to cart
    const result = addItem({
      roundId: selectedRoundId, // Use selected backend round ID
      gameType: 'number',
      options: selectedNumbers.map(String), // Convert numbers to strings
      amount: totalBetAmount,
    });

    if (result.success) {
      toast.success(result.message);
      setSelectedNumbers([]);
    } else {
      toast.error(result.message);
    }
  };

  // Submit all cart orders
  const submitCartOrders = async () => {
    if (!selectedRoundId) {
      toast.error('No round selected!');
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
      // Prepare all trades for batch submission
      const allTrades = cart.items
        .filter(item => item.gameType === 'number')
        .flatMap(item => 
          item.options.map(numStr => ({
            roundId: selectedRoundId!,
            tradeType: 'number' as const,
            selection: numStr as any,
            amount: item.amount / item.options.length
          }))
        );

      // Place all trades in a single batch API call
      const result = await tradingService.placeTradesBatch(allTrades);

      if (result && result.successCount > 0) {
        toast.success(`Successfully placed ${result.successCount} trade${result.successCount > 1 ? 's' : ''} for ${formatCurrency(cart.finalAmount)}!`, {
          duration: 4000,
        });
        
        clearCart();
        setIsCartOpen(false);
        
        // Refresh wallet and rounds to show updated balance and trade counts
        await Promise.all([
          refreshWallet(),
          fetchNumberRounds(true) // Force refresh after successful trade
        ]);
      } else {
        toast.error('Failed to place trades');
      }
    } catch (error) {
      console.error('Failed to submit orders:', error);
      toast.error('Failed to place orders. Please try again.');
    } finally {
      setIsSubmitting(false);
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
    <div className="p-6 max-w-7xl mx-auto pb-32">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-foreground">🔢 Number Trading</h1>
            <p className="text-muted-foreground mt-1">
              Choose numbers from 0-100 • Win 2x your amount!
            </p>
          </div>
          <button
            onClick={() => fetchNumberRounds(true)}
            disabled={isLoadingRounds}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-all shadow-md"
          >
            <RefreshCw size={18} className={isLoadingRounds ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Wallet Balance */}
      <Card className="mb-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm opacity-90">Wallet Balance</div>
            <div className="text-3xl font-bold">{formatCurrency(wallet?.balance || 0)}</div>
          </div>
          <div className="text-5xl opacity-80">💰</div>
        </div>
      </Card>

      {/* Important Info Banner - Only show when no round selected */}
      {!selectedRoundId && (
        <Card className="mb-6 p-4 bg-orange-50 border-2 border-orange-300">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚠️</div>
            <div className="flex-1">
              <h3 className="font-bold text-orange-900 mb-1">Select a Round to Start Trading</h3>
              <p className="text-sm text-orange-700">
                Choose an active round below. Service charge: <strong>10% (minimum ₹5 per trade)</strong>
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Trading Rounds Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Active Rounds */}
        <RoundsList
          rounds={activeRounds}
          selectedRoundId={selectedRoundId}
          onSelectRound={(roundId) => {
            setSelectedRoundId(roundId);
            toast.success('Round selected for trading');
          }}
          title="🔢 Active Rounds"
          emptyMessage="No active rounds available. Check upcoming rounds."
        />

        {/* Upcoming Rounds */}
        <RoundsList
          rounds={upcomingRounds}
          selectedRoundId={selectedRoundId}
          onSelectRound={(roundId) => {
            setSelectedRoundId(roundId);
            toast.success('Round selected for trading');
          }}
          title="⏳ Upcoming Rounds"
          emptyMessage="No upcoming rounds scheduled."
        />
      </div>

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
                      
                      return (
                        <button
                          key={number}
                          onClick={() => toggleNumber(number)}
                          disabled={!selectedRoundId}
                          className={`
                            relative aspect-square rounded-lg font-bold text-sm
                            transition-all duration-200 transform
                            ${selectedRoundId ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed opacity-60'}
                            ${isSelected ? 'bg-yellow-500 text-black ring-2 ring-yellow-400 scale-110' : 'bg-gradient-to-br from-gray-700 to-gray-800 text-white'}
                            disabled:cursor-not-allowed flex items-center justify-center
                          `}
                        >
                          {number}
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 bg-yellow-400 text-black rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
                              ✓
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

          {/* Add to Cart Button */}
          {selectedNumbers.length > 0 && (
            <Card className="p-6 bg-gradient-to-r from-orange-500 to-red-500 text-white">
              {cart.totalItems > 0 && (
                <div className="mb-3 p-2 bg-white/20 rounded-lg text-center text-sm">
                  📦 {cart.totalItems} {cart.totalItems === 1 ? 'order' : 'orders'} in cart (₹{cart.finalAmount})
                </div>
              )}
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
              <button 
                onClick={addToCart}
                disabled={!selectedRoundId || selectedNumbers.length === 0}
                className="w-full bg-white text-purple-600 hover:bg-purple-50 hover:text-purple-700 font-bold text-lg py-4 px-6 rounded-xl flex items-center justify-center gap-3 shadow-lg border-2 border-purple-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                <ShoppingCart size={22} />
                {selectedRoundId ? 'Add to Cart' : 'Select a Round First'}
              </button>
            </Card>
          )}
        </div>
      </div>

      {/* Cart Summary Bar - Fixed at bottom */}
      <CartSummaryBar
        itemCount={cart.totalItems}
        finalAmount={cart.finalAmount}
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
