import { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import Card from '@/components/common/Card';
import { formatCurrency } from '@/utils/helpers';
import toast from 'react-hot-toast';
import { apiClient } from '@/services/apiClient';

// Backend Plan Structure
interface BackendInvestmentPlan {
  id: string;
  name: string;
  joiningAmount: number;
  levels: number;
  validity: number;
  dailyReturn: number;
  weeklyReturn: number;
  monthlyReturn: number;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

// Frontend Growth Plan Structure
interface GrowthPlan {
  id: string;
  name: string;
  description: string;
  plans: {
    daily: { initialPayment: number; contributionAmount: number };
    weekly: { initialPayment: number; contributionAmount: number };
    monthly: { initialPayment: number; contributionAmount: number };
  };
  planValidity: number;
  earnings: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  features: string[];
  color: string;
  gradient: [string, string];
  popular: boolean;
}

// Utility function to map backend plans to frontend structure
const mapBackendPlansToGrowthPlans = (backendPlans: BackendInvestmentPlan[]): GrowthPlan[] => {
  const planColorMapping: { [key: string]: { color: string; gradient: [string, string] } } = {
    bass: { color: '#3B82F6', gradient: ['#3B82F6', '#2563EB'] },
    base: { color: '#3B82F6', gradient: ['#3B82F6', '#2563EB'] },
    silver: { color: '#9CA3AF', gradient: ['#9CA3AF', '#6B7280'] },
    gold: { color: '#F59E0B', gradient: ['#F59E0B', '#D97706'] },
    diamond: { color: '#8B5CF6', gradient: ['#8B5CF6', '#7C3AED'] },
    platinum: { color: '#10B981', gradient: ['#10B981', '#059669'] },
    elite: { color: '#DC2626', gradient: ['#DC2626', '#B91C1C'] },
    eight: { color: '#DC2626', gradient: ['#DC2626', '#B91C1C'] },
  };

  const getDescription = (name: string): string => {
    const descriptions: { [key: string]: string } = {
      bass: 'Start your growth journey',
      base: 'Perfect for beginners',
      silver: 'Enhanced growth opportunities',
      gold: 'Premium growth experience',
      diamond: 'Elite growth tier',
      platinum: 'Ultimate growth package',
      elite: 'The pinnacle of growth',
      eight: 'The pinnacle of growth',
    };
    return descriptions[name.toLowerCase()] || 'Accelerate your financial growth';
  };

  const getFeatures = (name: string): string[] => {
    const baseFeatures = [
      'Daily contribution tracking',
      'Growth rewards system',
      'Portfolio analytics',
      'Performance insights',
    ];

    const features: { [key: string]: string[] } = {
      bass: baseFeatures,
      base: baseFeatures,
      silver: ['Higher growth rewards', 'Priority support', 'Advanced analytics', 'Referral bonuses'],
      gold: ['Premium growth rates', 'Exclusive insights', 'Personal account manager', 'VIP support'],
      diamond: ['Maximum earning potential', 'Elite customer support', 'Early access', 'Premium features'],
      platinum: ['Highest growth rewards', 'Dedicated manager', 'Exclusive opportunities', 'Elite status'],
      elite: ['Maximum daily contributions', 'Elite benefits', 'Personalized strategy', 'Top-tier rewards'],
      eight: ['Maximum daily contributions', 'Elite benefits', 'Personalized strategy', 'Top-tier rewards'],
    };

    return features[name.toLowerCase()] || baseFeatures;
  };

  return backendPlans.map((backendPlan, index) => {
    const planKey = backendPlan.name.toLowerCase();
    const colorData = planColorMapping[planKey] || { color: '#3B82F6', gradient: ['#3B82F6', '#2563EB'] as [string, string] };

    const dailyContribution = backendPlan.dailyReturn;
    const weeklyContribution = backendPlan.weeklyReturn;
    const monthlyContribution = backendPlan.monthlyReturn;
    const baseInitialPayment = backendPlan.joiningAmount;

    return {
      id: backendPlan.id,
      name: `${backendPlan.name.charAt(0).toUpperCase() + backendPlan.name.slice(1)} Plan`,
      description: getDescription(backendPlan.name),
      plans: {
        daily: {
          initialPayment: baseInitialPayment,
          contributionAmount: dailyContribution,
        },
        weekly: {
          initialPayment: Math.round(baseInitialPayment * 0.85),
          contributionAmount: weeklyContribution,
        },
        monthly: {
          initialPayment: Math.round(baseInitialPayment * 0.7),
          contributionAmount: monthlyContribution,
        },
      },
      planValidity: backendPlan.validity,
      earnings: {
        daily: Math.round(dailyContribution * 1.5),
        weekly: Math.round(weeklyContribution * 1.5),
        monthly: Math.round(monthlyContribution * 1.5),
      },
      features: getFeatures(backendPlan.name),
      color: colorData.color,
      gradient: colorData.gradient,
      popular: index === 1, // Make second plan popular
    };
  });
};

export default function Plans() {
  const { wallet, refreshWallet } = useWallet();
  const [selectedFrequency, setSelectedFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [growthPlans, setGrowthPlans] = useState<GrowthPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Return Plans - WeNews';
    loadPlans();
    refreshWallet();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      // Fetch plans from backend using apiClient (same as React Native app)
      const response = await apiClient.get('/investment/plans');
      
      if (response.data.success && response.data.data) {
        const mappedPlans = mapBackendPlansToGrowthPlans(response.data.data);
        setGrowthPlans(mappedPlans);
      } else {
        toast.error('Failed to load plans');
      }
    } catch (error: any) {
      console.error('Error loading plans:', error);
      toast.error(error.response?.data?.message || 'Failed to load plans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchasePlan = async (plan: GrowthPlan) => {
    const currentPlan = plan.plans[selectedFrequency];
    const planAmount = currentPlan.initialPayment;

    if ((wallet?.balance || 0) < planAmount) {
      toast.error(`Insufficient balance! You need ${formatCurrency(planAmount)} to purchase this plan.`);
      return;
    }

    const confirmPurchase = window.confirm(
      `Purchase ${plan.name} (${selectedFrequency}) for ${formatCurrency(planAmount)}?\n\nAmount will be deducted from your wallet.`
    );

    if (!confirmPurchase) return;

    setIsPurchasing(plan.id);
    toast.loading('Processing purchase...', { id: 'purchase' });

    try {
      // Call backend API to purchase plan using apiClient (same as React Native app)
      const response = await apiClient.post('/investment/purchase', {
        planId: plan.id,
        frequency: selectedFrequency,
      });

      if (response.data.success) {
        toast.success(
          `${plan.name} activated successfully! Amount deducted: ${formatCurrency(planAmount)}`,
          { id: 'purchase', duration: 5000 }
        );
        refreshWallet();
      } else {
        toast.error(response.data.message || 'Failed to purchase plan', { id: 'purchase' });
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to purchase plan. Please try again.';
      toast.error(errorMessage, { id: 'purchase' });
    } finally {
      setIsPurchasing(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading plans...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Return Plans</h1>
        <p className="text-muted-foreground">
          Accelerate your financial growth with our flexible contribution plans designed for consistent returns.
        </p>
      </div>

      {/* Current Balance */}
      <Card className="mb-6 p-6 bg-gradient-to-r from-green-500 to-blue-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm opacity-90 mb-1">Your Wallet Balance</div>
            <div className="text-3xl font-bold">{formatCurrency(wallet?.balance || 0)}</div>
          </div>
          <div className="text-5xl opacity-50">💰</div>
        </div>
      </Card>

      {/* Frequency Toggle */}
      <div className="flex gap-2 mb-8 bg-muted p-2 rounded-lg w-fit">
        <button
          onClick={() => setSelectedFrequency('daily')}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            selectedFrequency === 'daily'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-foreground hover:bg-muted/80'
          }`}
        >
          Daily
        </button>
        <button
          onClick={() => setSelectedFrequency('weekly')}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            selectedFrequency === 'weekly'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-foreground hover:bg-muted/80'
          }`}
        >
          Weekly
        </button>
        <button
          onClick={() => setSelectedFrequency('monthly')}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            selectedFrequency === 'monthly'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-foreground hover:bg-muted/80'
          }`}
        >
          Monthly
        </button>
      </div>

      {/* Empty State */}
      {growthPlans.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-2">No Plans Available</h3>
          <p className="text-muted-foreground">
            Investment plans will appear here once they are available.
          </p>
        </Card>
      )}

      {/* Plans Grid */}
      {growthPlans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {growthPlans.map((plan) => {
          const currentPlan = plan.plans[selectedFrequency];
          
          return (
            <div key={plan.id} className="relative">
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-yellow-500 text-black px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                    ⭐ MOST POPULAR
                  </div>
                </div>
              )}

              <Card className={`overflow-hidden ${plan.popular ? 'border-2 border-yellow-500' : ''}`}>
                {/* Plan Header */}
                <div
                  className="p-6 text-white"
                  style={{
                    background: `linear-gradient(135deg, ${plan.gradient[0]}, ${plan.gradient[1]})`
                  }}
                >
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-white/90 text-sm mb-4">{plan.description}</p>
                  
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-xs opacity-90 mb-1">Initial Payment</div>
                    <div className="text-3xl font-bold">
                      {formatCurrency(currentPlan.initialPayment)}
                    </div>
                  </div>
                </div>

                {/* Plan Content */}
                <div className="p-6 space-y-6">
                  {/* Contribution Details */}
                  <div>
                    <h4 className="font-semibold mb-3">Contribution Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">📅</span>
                        <span>
                          {formatCurrency(currentPlan.contributionAmount)} per{' '}
                          {selectedFrequency === 'daily' ? 'day' : selectedFrequency.replace('ly', '')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">⏱️</span>
                        <span>{plan.planValidity} days validity</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">📈</span>
                        <span>Growth tracking included</span>
                      </div>
                    </div>
                  </div>

                  {/* Growth Potential */}
                  <div>
                    <h4 className="font-semibold mb-3">Growth Potential</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600 leading-tight">
                          ₹{plan.earnings.daily.toLocaleString('en-IN')}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Daily</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600 leading-tight">
                          ₹{plan.earnings.weekly.toLocaleString('en-IN')}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Weekly</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-600 leading-tight">
                          ₹{plan.earnings.monthly.toLocaleString('en-IN')}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Monthly</div>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <h4 className="font-semibold mb-3">Plan Features</h4>
                    <div className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Purchase Button */}
                  <button
                    onClick={() => handlePurchasePlan(plan)}
                    disabled={isPurchasing === plan.id}
                    className="w-full text-lg py-3 rounded-lg text-white font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                    style={{
                      background: `linear-gradient(135deg, ${plan.gradient[0]}, ${plan.gradient[1]})`
                    }}
                  >
                    {isPurchasing === plan.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span>Purchase for {formatCurrency(currentPlan.initialPayment)}</span>
                        <span>→</span>
                      </div>
                    )}
                  </button>
                </div>
              </Card>
            </div>
          );
        })}
        </div>
      )}

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">How It Works</h3>
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                1
              </span>
              <span>Choose your preferred plan and contribution frequency</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                2
              </span>
              <span>Make the initial payment from your wallet</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                3
              </span>
              <span>Contribute regularly as per your selected frequency</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                4
              </span>
              <span>Watch your earnings grow daily!</span>
            </li>
          </ol>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
          <h3 className="text-lg font-semibold mb-4">Why Choose Us?</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Flexible contribution frequencies to match your cash flow</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Transparent earnings tracking in real-time</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Withdraw your earnings anytime</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>No hidden charges or fees</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>24/7 customer support</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
