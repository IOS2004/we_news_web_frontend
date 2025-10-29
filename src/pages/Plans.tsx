import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@/contexts/WalletContext';
import Card from '@/components/common/Card';
import { formatCurrency } from '@/utils/helpers';
import toast from 'react-hot-toast';
import { apiClient } from '@/services/apiClient';

// Backend Plan Structure (New Model)
interface BackendInvestmentPlan {
  id: string;
  name: string;
  joiningAmount: number;
  numberOfLevels?: number;
  levels?: number;
  validity: number;
  rewardValueUpTo?: number;
  guaranteedReturn?: number;
  investmentAmounts?: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  levelRewards?: Array<{
    level: number;
    label: string;
    reward: number;
    joiningPayout: number;
    investmentPayout: number;
  }>;
  enableJoiningPayout?: boolean;
  enableInvestmentPayout?: boolean;
  features?: string[];
  isActive: boolean;
  subscribers?: number;
  revenue?: number;
  createdAt?: any;
  updatedAt?: any;
  // Legacy fields for backward compatibility
  dailyReturn?: number;
  weeklyReturn?: number;
  monthlyReturn?: number;
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
const mapBackendPlansToGrowthPlans = (backendPlans: any[]): GrowthPlan[] => {
  console.log('Mapping plans, input:', backendPlans);
  
  if (!Array.isArray(backendPlans)) {
    console.error('Backend plans is not an array:', backendPlans);
    return [];
  }
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
      bass: 'Start your investment journey',
      base: 'Perfect for beginners',
      silver: 'Enhanced return opportunities',
      gold: 'Premium investment experience',
      diamond: 'Elite investment tier',
      platinum: 'Ultimate investment package',
      elite: 'The pinnacle of returns',
      eight: 'The pinnacle of returns',
    };
    return descriptions[name.toLowerCase()] || 'Accelerate your financial growth';
  };

  const getFeatures = (name: string): string[] => {
    const baseFeatures = [
      'Daily returns tracking',
      'Referral rewards system',
      'Portfolio analytics',
      'Performance insights',
    ];

    const features: { [key: string]: string[] } = {
      bass: baseFeatures,
      base: baseFeatures,
      silver: ['Higher returns', 'Priority support', 'Advanced analytics', 'Referral bonuses'],
      gold: ['Premium return rates', 'Exclusive insights', 'Personal account manager', 'VIP support'],
      diamond: ['Maximum earning potential', 'Elite customer support', 'Early access', 'Premium features'],
      platinum: ['Highest returns', 'Dedicated manager', 'Exclusive opportunities', 'Elite status'],
      elite: ['Maximum returns', 'Elite benefits', 'Personalized strategy', 'Top-tier rewards'],
      eight: ['Maximum returns', 'Elite benefits', 'Personalized strategy', 'Top-tier rewards'],
    };

    return features[name.toLowerCase()] || baseFeatures;
  };

  return backendPlans.map((backendPlan, index) => {
    console.log(`Mapping plan ${index}:`, backendPlan);
    
    const planKey = backendPlan.name?.toLowerCase() || 'base';
    const colorData = planColorMapping[planKey] || { color: '#3B82F6', gradient: ['#3B82F6', '#2563EB'] as [string, string] };

    // Get investment amounts from new structure or fall back to legacy
    const dailyAmount = backendPlan.investmentAmounts?.daily || backendPlan.dailyReturn || 0;
    const weeklyAmount = backendPlan.investmentAmounts?.weekly || backendPlan.weeklyReturn || 0;
    const monthlyAmount = backendPlan.investmentAmounts?.monthly || backendPlan.monthlyReturn || 0;
    
    const baseInitialPayment = backendPlan.joiningAmount || 0;
    
    // Use investmentAmounts as contribution amounts (what user needs to invest periodically)
    const dailyContributionAmount = dailyAmount;
    const weeklyContributionAmount = weeklyAmount;
    const monthlyContributionAmount = monthlyAmount;

    const mappedPlan = {
      id: backendPlan.id || `plan-${index}`,
      name: `${backendPlan.name?.charAt(0).toUpperCase() || ''}${backendPlan.name?.slice(1) || 'Plan'}`,
      description: getDescription(backendPlan.name || ''),
      plans: {
        daily: {
          initialPayment: baseInitialPayment,
          contributionAmount: dailyContributionAmount,
        },
        weekly: {
          initialPayment: baseInitialPayment,
          contributionAmount: weeklyContributionAmount,
        },
        monthly: {
          initialPayment: baseInitialPayment,
          contributionAmount: monthlyContributionAmount,
        },
      },
      planValidity: backendPlan.validity || 750,
      earnings: {
        daily: dailyAmount,
        weekly: weeklyAmount,
        monthly: monthlyAmount,
      },
      features: backendPlan.features || getFeatures(backendPlan.name || ''),
      color: colorData.color,
      gradient: colorData.gradient,
      popular: index === 1, // Make second plan popular
    };
    
    console.log(`Mapped plan ${index}:`, mappedPlan);
    return mappedPlan;
  });
};

export default function Plans() {
  const navigate = useNavigate();
  const { wallet, refreshWallet } = useWallet();
  const [selectedFrequency, setSelectedFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [growthPlans, setGrowthPlans] = useState<GrowthPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [referralInfo, setReferralInfo] = useState<{
    purchaseReferralId: string;
    planId: string;
    referrerUserId: string;
    referrerName?: string;
  } | null>(null);

  useEffect(() => {
    document.title = 'Return Plans - WeNews';
    
    // Check for referral parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const refParam = urlParams.get('ref');
    
    if (refParam) {
      // Parse purchaseReferralId format: userid-planid-increment
      const parts = refParam.split('-');
      if (parts.length === 3) {
        const [referrerUserId, planId, increment] = parts;
        setReferralInfo({
          purchaseReferralId: refParam,
          planId: planId,
          referrerUserId: referrerUserId,
        });
        
        // Store in localStorage for persistence through login/signup
        localStorage.setItem('pendingReferral', JSON.stringify({
          purchaseReferralId: refParam,
          planId: planId,
          referrerUserId: referrerUserId,
        }));
        
        toast.success('Referral link detected! The plan will be highlighted.', { duration: 4000 });
      } else {
        console.error('Invalid referral ID format:', refParam);
        toast.error('Invalid referral link format');
      }
    } else {
      // Check if there's a pending referral from localStorage
      const pending = localStorage.getItem('pendingReferral');
      if (pending) {
        try {
          setReferralInfo(JSON.parse(pending));
        } catch (e) {
          console.error('Failed to parse pending referral:', e);
          localStorage.removeItem('pendingReferral');
        }
      }
    }
    
    loadPlans();
    refreshWallet();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      // Fetch plans from backend using apiClient (same as React Native app)
      const response = await apiClient.get('/investment/plans');
      
      console.log('Plans API Response:', response.data);
      
      if (response.data.success && response.data.data) {
        console.log('Backend Plans:', response.data.data);
        
        // Check if data is an array or has a plans property
        const plansData = Array.isArray(response.data.data) 
          ? response.data.data 
          : response.data.data.plans || [];
          
        console.log('Plans Data to Map:', plansData);
        
        const mappedPlans = mapBackendPlansToGrowthPlans(plansData);
        console.log('Mapped Plans:', mappedPlans);
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

  const handleViewPlan = (plan: GrowthPlan) => {
    // Navigate to plan details page with referral info if available
    const isReferredPlan = referralInfo?.planId === plan.id;
    if (isReferredPlan && referralInfo) {
      navigate(`/plan-purchase/${plan.id}?ref=${referralInfo.purchaseReferralId}`);
    } else {
      navigate(`/plan-purchase/${plan.id}`);
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

      {/* Referral Info Banner */}
      {referralInfo && (
        <Card className="mb-6 p-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-4 border-green-400">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🎯</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">You're viewing a referred plan!</h3>
              <p className="text-white/90 mb-3">
                Your friend invited you to join a specific plan. Other plans are temporarily hidden to help you focus on the recommended plan.
              </p>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 inline-block">
                <span className="text-sm font-semibold">Referral ID: </span>
                <code className="text-sm">{referralInfo.purchaseReferralId}</code>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('pendingReferral');
                window.location.href = '/plans';
              }}
              className="text-white hover:bg-white/20 px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
            >
              View All Plans
            </button>
          </div>
        </Card>
      )}

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 auto-rows-fr">
          {growthPlans.map((plan) => {
          const currentPlan = plan.plans[selectedFrequency];
          const isReferredPlan = referralInfo?.planId === plan.id;
          const hasReferral = !!referralInfo;
          const isOtherPlan = hasReferral && !isReferredPlan;
          
          return (
            <div key={plan.id} className="relative h-full">
              {plan.popular && !isReferredPlan && !hasReferral && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-yellow-500 text-black px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                    ⭐ MOST POPULAR
                  </div>
                </div>
              )}
              
              {isReferredPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-green-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                    🎯 REFERRED PLAN
                  </div>
                </div>
              )}

              <div className="relative h-full">
                {isOtherPlan && (
                  <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-[2px] z-20 rounded-lg flex items-center justify-center">
                    <div className="bg-white px-6 py-3 rounded-lg shadow-lg text-center">
                      <div className="text-2xl mb-2">🔒</div>
                      <p className="text-sm font-semibold text-gray-700">Not available with referral link</p>
                    </div>
                  </div>
                )}
                
                <Card className={`h-full overflow-hidden transition-all ${
                  isReferredPlan 
                    ? 'border-4 border-green-500 shadow-2xl' 
                    : isOtherPlan 
                      ? 'opacity-50 grayscale' 
                      : plan.popular 
                        ? 'border-2 border-yellow-500' 
                        : ''
                }`}>
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
                  {/* Plan Details */}
                  <div>
                    <h4 className="font-semibold mb-3">Plan Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">💰</span>
                        <span>
                          Initial Payment: {formatCurrency(currentPlan.initialPayment)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">📅</span>
                        <span>
                          Investment: {formatCurrency(currentPlan.contributionAmount)} per{' '}
                          {selectedFrequency === 'daily' ? 'day' : selectedFrequency.replace('ly', '')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">⏱️</span>
                        <span>{plan.planValidity} days validity</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">📈</span>
                        <span>Referral rewards included</span>
                      </div>
                    </div>
                  </div>

                  {/* Investment Amounts */}
                  <div>
                    <h4 className="font-semibold mb-3">Investment Amounts</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600 leading-tight">
                          ₹{(plan.earnings?.daily || 0).toLocaleString('en-IN')}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Daily</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600 leading-tight">
                          ₹{(plan.earnings?.weekly || 0).toLocaleString('en-IN')}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Weekly</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-600 leading-tight">
                          ₹{(plan.earnings?.monthly || 0).toLocaleString('en-IN')}
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
                  {isOtherPlan ? (
                    <div className="w-full text-lg py-3 rounded-lg bg-gray-300 text-gray-500 font-semibold text-center cursor-not-allowed">
                      <div className="flex items-center justify-center gap-2">
                        <span>Not Available</span>
                        <span>🔒</span>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleViewPlan(plan)}
                      className="w-full text-lg py-3 rounded-lg text-white font-semibold transition-all hover:opacity-90 hover:scale-[1.02]"
                      style={{
                        background: `linear-gradient(135deg, ${plan.gradient[0]}, ${plan.gradient[1]})`
                      }}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span>View Plan Details</span>
                        <span>→</span>
                      </div>
                    </button>
                  )}
                </div>
              </Card>
            </div>
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
              <span>Browse and compare investment plans</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                2
              </span>
              <span>Click "View Plan Details" to see complete information</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                3
              </span>
              <span>Review level rewards and investment structure</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                4
              </span>
              <span>Purchase and start earning referral rewards!</span>
            </li>
          </ol>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
          <h3 className="text-lg font-semibold mb-4">Why Choose Us?</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>One-time investment with consistent returns</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Transparent returns tracking in real-time</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Multiple return frequencies (daily, weekly, monthly)</span>
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
