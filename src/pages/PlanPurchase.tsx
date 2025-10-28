import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWallet } from '@/contexts/WalletContext';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { formatCurrency } from '@/utils/helpers';
import toast from 'react-hot-toast';
import { apiClient } from '@/services/apiClient';
import { ArrowLeft, Check, Info, Users, TrendingUp, Calendar, DollarSign } from 'lucide-react';

interface InvestmentAmount {
  daily: number;
  weekly: number;
  monthly: number;
}

interface LevelReward {
  level: number;
  label: string;
  reward: number;
  joiningPayout: number;
  investmentPayout: number;
}

interface PlanDetails {
  id: string;
  name: string;
  joiningAmount: number;
  numberOfLevels: number;
  validity: number;
  rewardValueUpTo?: number;
  guaranteedReturn?: number;
  investmentAmounts?: InvestmentAmount;
  levelRewards?: LevelReward[];
  enableJoiningPayout?: boolean;
  enableInvestmentPayout?: boolean;
  features?: string[];
  isActive: boolean;
}

export default function PlanPurchase() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { wallet, refreshWallet } = useWallet();
  
  const [plan, setPlan] = useState<PlanDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFrequency, setSelectedFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [referrerPurchaseId, setReferrerPurchaseId] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState('');
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [verifiedReferrer, setVerifiedReferrer] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    // Check for referral parameter
    const urlParams = new URLSearchParams(window.location.search);
    const refParam = urlParams.get('ref');
    
    if (refParam) {
      setReferrerPurchaseId(refParam);
      console.log('Referral detected:', refParam);
    } else {
      // Check localStorage for pending referral
      const pending = localStorage.getItem('pendingReferral');
      if (pending) {
        try {
          const referralInfo = JSON.parse(pending);
          if (referralInfo.planId === planId) {
            setReferrerPurchaseId(referralInfo.purchaseReferralId);
            console.log('Using pending referral:', referralInfo.purchaseReferralId);
          }
        } catch (e) {
          console.error('Failed to parse pending referral:', e);
        }
      }
    }
    
    loadPlanDetails();
    refreshWallet();
  }, [planId]);

  const loadPlanDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/investment/plans');
      
      if (response.data.success && response.data.data) {
        const foundPlan = response.data.data.find((p: any) => p.id === planId);
        if (foundPlan) {
          setPlan(foundPlan);
        } else {
          toast.error('Plan not found');
          navigate('/plans');
        }
      }
    } catch (error: any) {
      console.error('Error loading plan:', error);
      toast.error('Failed to load plan details');
      navigate('/plans');
    } finally {
      setLoading(false);
    }
  };

  const verifyReferralCode = async () => {
    if (!referralCode.trim()) {
      toast.error('Please enter a referral code');
      return;
    }

    setIsVerifyingCode(true);
    try {
      const response = await apiClient.post('/referrals/verify-code', {
        code: referralCode.trim()
      });

      if (response.data.success) {
        const { data } = response.data;
        console.log('Verification response:', data);
        console.log('Plan info:', data.plan);
        // Store both referrer info and plan info
        setVerifiedReferrer({
          ...data.referrer,
          planName: data.plan.planName,
          planId: data.plan.planId
        });
        setReferrerPurchaseId(data.purchaseReferralId);
        toast.success(`✅ Referral code verified!`);
      } else {
        toast.error(response.data.message || 'Invalid referral code');
        setVerifiedReferrer(null);
        setReferrerPurchaseId(null);
      }
    } catch (error: any) {
      console.error('Referral verification error:', error);
      const errorMessage = error.response?.data?.message || 'Invalid referral code';
      toast.error(errorMessage);
      setVerifiedReferrer(null);
      setReferrerPurchaseId(null);
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handlePurchase = async () => {
    if (!plan) return;

    const planAmount = plan.joiningAmount;

    if ((wallet?.balance || 0) < planAmount) {
      toast.error(`Insufficient balance! You need ${formatCurrency(planAmount)} to purchase this plan.`);
      return;
    }

    const confirmPurchase = window.confirm(
      `Purchase ${plan.name} for ${formatCurrency(planAmount)}?\n\nAmount will be deducted from your wallet.`
    );

    if (!confirmPurchase) return;

    setIsPurchasing(true);
    toast.loading('Processing purchase...', { id: 'purchase' });

    try {
      const purchaseData: any = {
        planId: plan.id,
        frequency: selectedFrequency,
      };
      
      // Include referrerPurchaseId if available
      if (referrerPurchaseId) {
        purchaseData.referrerPurchaseId = referrerPurchaseId;
        console.log('Purchasing with referral:', referrerPurchaseId);
      }
      
      const response = await apiClient.post('/investment/purchase', purchaseData);

      if (response.data.success) {
        toast.success(
          `${plan.name} activated successfully! Amount deducted: ${formatCurrency(planAmount)}`,
          { id: 'purchase', duration: 5000 }
        );
        
        // Clear pending referral from localStorage after successful purchase
        localStorage.removeItem('pendingReferral');
        
        refreshWallet();
        navigate('/dashboard');
      } else {
        toast.error(response.data.message || 'Failed to purchase plan', { id: 'purchase' });
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to purchase plan. Please try again.';
      toast.error(errorMessage, { id: 'purchase' });
    } finally {
      setIsPurchasing(false);
    }
  };

  const getColorScheme = (planName: string) => {
    const colors: { [key: string]: { primary: string; secondary: string; gradient: string } } = {
      bass: { primary: 'blue', secondary: 'blue-50', gradient: 'from-blue-500 to-blue-600' },
      silver: { primary: 'gray', secondary: 'gray-50', gradient: 'from-gray-400 to-gray-600' },
      gold: { primary: 'yellow', secondary: 'yellow-50', gradient: 'from-yellow-500 to-yellow-600' },
      diamond: { primary: 'purple', secondary: 'purple-50', gradient: 'from-purple-500 to-purple-600' },
      platinum: { primary: 'green', secondary: 'green-50', gradient: 'from-green-500 to-green-600' },
      eight: { primary: 'red', secondary: 'red-50', gradient: 'from-red-500 to-red-600' },
    };
    return colors[planName.toLowerCase()] || colors.bass;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading plan details...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  const colorScheme = getColorScheme(plan.name);
  const investmentAmount = plan.investmentAmounts?.[selectedFrequency] || 0;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/plans')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Plan Details</h1>
          <p className="text-gray-600">Review plan details before purchasing</p>
        </div>
      </div>

      {/* Plan Overview Card */}
      <Card className="overflow-hidden">
        <div className={`bg-gradient-to-r ${colorScheme.gradient} p-8 text-white`}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">{plan.name}</h2>
              <p className="text-white/90 text-lg mb-4">
                {plan.numberOfLevels} Level Referral Program
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-sm opacity-90 mb-1">Joining Amount</div>
              <div className="text-4xl font-bold">{formatCurrency(plan.joiningAmount)}</div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-sm opacity-80">Validity</div>
              <div className="text-xl font-bold">{plan.validity} Days</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-sm opacity-80">Levels</div>
              <div className="text-xl font-bold">{plan.numberOfLevels}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-sm opacity-80">Guaranteed Return</div>
              <div className="text-xl font-bold">{formatCurrency(plan.guaranteedReturn || 0)}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-sm opacity-80">Max Reward</div>
              <div className="text-xl font-bold">{formatCurrency(plan.rewardValueUpTo || 0)}</div>
            </div>
          </div>
        </div>

        {/* Frequency Selection */}
        <div className="p-6 border-b">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Select Investment Frequency
          </h3>
          <div className="flex gap-3">
            {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
              <button
                key={freq}
                onClick={() => setSelectedFrequency(freq)}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  selectedFrequency === freq
                    ? `border-${colorScheme.primary}-600 bg-${colorScheme.secondary}`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-sm text-gray-600 capitalize">{freq}</div>
                <div className="text-xl font-bold text-gray-900">
                  {formatCurrency(plan.investmentAmounts?.[freq] || 0)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Investment Details */}
        <div className="p-6 border-b bg-blue-50">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-1" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Investment Structure</h4>
              <p className="text-sm text-gray-700">
                • Initial Payment: {formatCurrency(plan.joiningAmount)} (one-time)<br />
                • {selectedFrequency.charAt(0).toUpperCase() + selectedFrequency.slice(1)} Investment: {formatCurrency(investmentAmount)}<br />
                • Plan Duration: {plan.validity} days<br />
                • Referral Levels: {plan.numberOfLevels} levels
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        {plan.features && plan.features.length > 0 && (
          <div className="p-6 border-b">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Check className="w-5 h-5" />
              Plan Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Level Rewards Structure */}
      <Card>
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users className="w-6 h-6" />
            Level Rewards Structure
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Earn rewards when your referrals join and invest. Higher levels unlock as you build your network.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Level</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Label</th>
                  {plan.enableJoiningPayout && (
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Joining Payout</th>
                  )}
                  {plan.enableInvestmentPayout && (
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Investment Payout</th>
                  )}
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Reward</th>
                </tr>
              </thead>
              <tbody>
                {plan.levelRewards?.map((level, index) => (
                  <tr
                    key={level.level}
                    className={`border-b border-gray-100 ${
                      index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    }`}
                  >
                    <td className="py-3 px-4 font-medium">Level {level.level}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                        {level.label}
                      </span>
                    </td>
                    {plan.enableJoiningPayout && (
                      <td className="py-3 px-4 text-right font-medium text-green-600">
                        {formatCurrency(level.joiningPayout)}
                      </td>
                    )}
                    {plan.enableInvestmentPayout && (
                      <td className="py-3 px-4 text-right font-medium text-blue-600">
                        {formatCurrency(level.investmentPayout)}
                      </td>
                    )}
                    <td className="py-3 px-4 text-right font-bold text-gray-900">
                      {formatCurrency(level.reward)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-bold">
                  <td colSpan={plan.enableJoiningPayout && plan.enableInvestmentPayout ? 4 : 3} className="py-3 px-4 text-right">
                    Total Potential Earnings:
                  </td>
                  <td className="py-3 px-4 text-right text-green-600">
                    {formatCurrency(
                      plan.levelRewards?.reduce((sum, level) => sum + level.reward, 0) || 0
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </Card>

      {/* Payout Types Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plan.enableJoiningPayout && (
          <Card className="p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Joining Payout</h4>
                <p className="text-sm text-gray-600">
                  Earn rewards when your referrals purchase a plan. Higher levels earn more for each joining.
                </p>
              </div>
            </div>
          </Card>
        )}

        {plan.enableInvestmentPayout && (
          <Card className="p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Investment Payout</h4>
                <p className="text-sm text-gray-600">
                  Earn rewards when your referrals make periodic investments. Continuous earning potential.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Purchase Section */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Ready to Purchase?</h3>
            <p className="text-gray-600 mt-1">
              Your wallet balance: <span className="font-semibold">{formatCurrency(wallet?.balance || 0)}</span>
            </p>
            {(wallet?.balance || 0) < plan.joiningAmount && (
              <p className="text-red-600 text-sm mt-1">
                Insufficient balance. Please add {formatCurrency(plan.joiningAmount - (wallet?.balance || 0))} to your wallet.
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/plans')}
              disabled={isPurchasing}
            >
              Cancel
            </Button>
            <Button
              onClick={() => setShowPaymentModal(true)}
              disabled={isPurchasing || (wallet?.balance || 0) < plan.joiningAmount}
              className="min-w-[200px]"
            >
              {isPurchasing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                `Purchase for ${formatCurrency(plan.joiningAmount)}`
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Payment Confirmation Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold mb-4">Confirm Payment</h3>
            
            {/* Plan Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Plan:</span>
                <span className="font-semibold">{plan.name}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold">{formatCurrency(plan.joiningAmount)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">GST (18%):</span>
                <span className="font-semibold">{formatCurrency((plan.joiningAmount * 18) / 100)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-300">
                <span className="font-bold">Total:</span>
                <span className="font-bold text-lg">{formatCurrency(plan.joiningAmount + (plan.joiningAmount * 18) / 100)}</span>
              </div>
            </div>

            {/* Referral Code Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Have a referral code? (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => {
                    setReferralCode(e.target.value);
                    setVerifiedReferrer(null);
                  }}
                  placeholder="e.g., s0001g0001"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isVerifyingCode || !!verifiedReferrer}
                />
                {!verifiedReferrer && (
                  <Button
                    onClick={verifyReferralCode}
                    disabled={isVerifyingCode || !referralCode.trim()}
                    className="px-4"
                  >
                    {isVerifyingCode ? 'Verifying...' : 'Verify'}
                  </Button>
                )}
              </div>
              
              {/* Verified Referrer Info */}
              {verifiedReferrer && plan && (
                <div className={`mt-3 p-3 rounded-lg border ${
                  verifiedReferrer.planName?.toLowerCase() === plan.name.toLowerCase()
                    ? 'bg-green-50 border-green-200'
                    : 'bg-yellow-50 border-yellow-300'
                }`}>
                  <div className="flex items-start gap-2">
                    {verifiedReferrer.planName?.toLowerCase() === plan.name.toLowerCase() ? (
                      <Check className="w-5 h-5 text-green-700 mt-0.5 flex-shrink-0" />
                    ) : (
                      <span className="text-yellow-600 text-lg mt-0.5 flex-shrink-0">⚠️</span>
                    )}
                    <div className="flex-1">
                      <div className={`font-semibold ${
                        verifiedReferrer.planName?.toLowerCase() === plan.name.toLowerCase()
                          ? 'text-green-700'
                          : 'text-yellow-800'
                      }`}>
                        Referral by: {verifiedReferrer.fullName}
                      </div>
                      <div className={`text-sm ${
                        verifiedReferrer.planName?.toLowerCase() === plan.name.toLowerCase()
                          ? 'text-green-600'
                          : 'text-yellow-700'
                      }`}>
                        @{verifiedReferrer.username}
                      </div>
                      <div className={`text-sm mt-1 font-medium ${
                        verifiedReferrer.planName?.toLowerCase() === plan.name.toLowerCase()
                          ? 'text-green-700'
                          : 'text-yellow-800'
                      }`}>
                        Plan: {verifiedReferrer.planName || 'Unknown'}
                      </div>
                      
                      {/* Warning message if plans don't match */}
                      {verifiedReferrer.planName && verifiedReferrer.planName?.toLowerCase() !== plan.name.toLowerCase() && (
                        <div className="mt-2 text-sm text-yellow-800 bg-yellow-100 p-2 rounded">
                          ⚠️ Use this referral for {verifiedReferrer.planName} Plan to avail more benefits!
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setVerifiedReferrer(null);
                      setReferrerPurchaseId(null);
                      setReferralCode('');
                    }}
                    className={`text-xs mt-2 underline ${
                      verifiedReferrer.planName?.toLowerCase() === plan.name.toLowerCase()
                        ? 'text-green-600 hover:text-green-800'
                        : 'text-yellow-600 hover:text-yellow-800'
                    }`}
                  >
                    Remove referral
                  </button>
                </div>
              )}
            </div>

            {/* Wallet Balance */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex justify-between">
                <span className="text-gray-600">Your Wallet Balance:</span>
                <span className="font-semibold">{formatCurrency(wallet?.balance || 0)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPaymentModal(false);
                  setReferralCode('');
                  setVerifiedReferrer(null);
                }}
                disabled={isPurchasing}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowPaymentModal(false);
                  handlePurchase();
                }}
                disabled={isPurchasing || (wallet?.balance || 0) < plan.joiningAmount}
                className="flex-1"
              >
                {isPurchasing ? 'Processing...' : 'Confirm Payment'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
