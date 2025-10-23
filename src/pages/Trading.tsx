import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/contexts/WalletContext';
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

interface Color {
  id: string;
  name: string;
  color: string;
  textColor: string;
}

// Constants
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
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Backend rounds state
  const [upcomingRounds, setUpcomingRounds] = useState<any[]>([]);
  const [activeRounds, setActiveRounds] = useState<any[]>([]);
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);
  const [isLoadingRounds, setIsLoadingRounds] = useState(false);

  // Fetch rounds from backend
  const fetchRounds = useCallback(async () => {
    setIsLoadingRounds(true);
    try {
      const [upcoming, active] = await Promise.all([
        tradingService.getUpcomingRounds('colour', 10),
        tradingService.getActiveRounds('colour')
      ]);
      
      setUpcomingRounds(upcoming);
      setActiveRounds(active);
      
      // Auto-select first active round if none selected
      if (!selectedRoundId && active.length > 0) {
        setSelectedRoundId(active[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch rounds:', error);
      toast.error('Failed to load trading rounds');
    } finally {
      setIsLoadingRounds(false);
    }
  }, [selectedRoundId]);

  // Initialize on mount
  useEffect(() => {
    document.title = 'Color Trading - WeNews';
    fetchRounds();
    
    // Load wallet data separately when needed
    refreshWallet().catch(err => {
      console.error('Failed to load wallet:', err);
    });
  }, [refreshWallet, fetchRounds]);

  // Toggle color selection
  const toggleColor = (colorId: string) => {
    if (!selectedRoundId) {
      toast.error('Please select a round first!');
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
    // Check if a round is selected
    if (!selectedRoundId) {
      toast.error('Please select a round first!');
      return;
    }

    if (selectedColors.length === 0) {
      toast.error('Please select at least one color');
      return;
    }

    const totalBetAmount = selectedColors.length * selectedPlan.amount;
    
    // Add each color as a separate order or as a single combined order
    const result = addItem({
      roundId: selectedRoundId, // Use selected backend round ID
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
      // Place each trade via the backend API
      const tradePromises = cart.items.flatMap(item => 
        item.options.map(color => 
          tradingService.placeTrade(
            selectedRoundId,
            'colour',
            color as any,
            selectedPlan.amount
          )
        )
      );

      const results = await Promise.all(tradePromises);
      const successCount = results.filter(r => r !== null).length;

      if (successCount > 0) {
        toast.success(`Successfully placed ${successCount} trade${successCount > 1 ? 's' : ''} for ${formatCurrency(cart.finalAmount)}!`, {
          duration: 4000,
        });
        
        clearCart();
        setIsCartOpen(false);
        
        // Refresh wallet and rounds to show updated balance and trade counts
        await Promise.all([
          refreshWallet(),
          fetchRounds()
        ]);
      } else {
        toast.error('Failed to place any trades');
      }
    } catch (error) {
      console.error('Failed to submit orders:', error);
      toast.error('Failed to place orders. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total bet amount for selected colors
  const getTotalBetAmount = () => {
    return selectedColors.length * selectedPlan.amount;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto pb-6">
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Color Trading Game</h1>
          <button
            onClick={fetchRounds}
            disabled={isLoadingRounds}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <RefreshCw size={18} className={isLoadingRounds ? 'animate-spin' : ''} />
            Refresh Rounds
          </button>
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

      {/* Selected Round Info - Only show when a round is selected */}
      {selectedRoundId && (() => {
        const selectedRound = [...activeRounds, ...upcomingRounds].find(r => r.id === selectedRoundId);
        if (!selectedRound) return null;
        
        return (
          <Card className="mb-6 p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-90">Selected Round</div>
                <div className="text-xl font-bold">Round #{selectedRound.roundNumber}</div>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-90">Round ID</div>
                <div className="text-xs font-mono">#{selectedRound.roundId?.slice(-8) || selectedRound.id.slice(-8)}</div>
              </div>
            </div>
          </Card>
        );
      })()}

      {/* Important Info Banner */}
      {!selectedRoundId && (
        <Card className="mb-6 p-4 bg-orange-50 border-2 border-orange-200">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚠️</div>
            <div className="flex-1">
              <h3 className="font-bold text-orange-900 mb-1">Please Select a Round</h3>
              <p className="text-sm text-orange-700">
                Select an active round from the list below to start trading. Service charge: <strong>10% (minimum ₹5)</strong>
              </p>
            </div>
          </div>
        </Card>
      )}

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
              <div className="text-2xl font-black">₹{cart.finalAmount}</div>
              <div className="text-sm opacity-90">Total (incl. service charge: ₹{cart.serviceCharge})</div>
            </div>
          </div>
        </Card>
      )}

      {/* Trading Rounds Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Active Rounds */}
        <RoundsList
          rounds={activeRounds}
          selectedRoundId={selectedRoundId}
          onSelectRound={(roundId) => {
            setSelectedRoundId(roundId);
            toast.success('Round selected for trading');
          }}
          title="🟢 Active Rounds"
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
          {/* Color Grid */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Select Colors</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {colors.map(color => {
                const isSelected = selectedColors.includes(color.id);
                
                return (
                  <button
                    key={color.id}
                    onClick={() => toggleColor(color.id)}
                    disabled={!selectedRoundId}
                    className={`
                      relative aspect-square rounded-lg font-semibold text-sm
                      transition-all duration-200 transform
                      ${selectedRoundId ? 'hover:scale-105 cursor-pointer' : 'cursor-not-allowed opacity-60'}
                      ${isSelected ? 'ring-4 ring-yellow-400 scale-105' : ''}
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
                  📦 {cart.totalItems} {cart.totalItems === 1 ? 'order' : 'orders'} in cart (₹{cart.finalAmount})
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
                disabled={!selectedRoundId || selectedColors.length === 0}
                className="w-full bg-white text-orange-600 hover:bg-orange-50 hover:text-orange-700 font-bold text-lg py-4 px-6 rounded-xl flex items-center justify-center gap-3 shadow-lg border-2 border-orange-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
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
