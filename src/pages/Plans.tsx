import { useEffect, useState } from 'react';
import { planService } from '@/services/planService';
import { useWallet } from '@/contexts/WalletContext';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '@/utils/helpers';
import type { InvestmentPlan, UserInvestment } from '@/types';
import toast from 'react-hot-toast';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  DollarSign, 
  Calendar,
  Award,
  X,
  Info
} from 'lucide-react';

export default function Plans() {
  const { wallet, refreshWallet } = useWallet();
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [userInvestments, setUserInvestments] = useState<UserInvestment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'available' | 'my-investments'>('available');

  useEffect(() => {
    document.title = 'Investment Plans - WeNews';
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      await refreshWallet();
      const [plansData, investmentsData] = await Promise.all([
        planService.getPlans(),
        planService.getUserInvestments().catch(() => []),
      ]);
      setPlans(plansData);
      setUserInvestments(investmentsData);
    } catch (error: any) {
      console.error('Failed to load plans:', error);
      toast.error('Failed to load investment plans');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (plan: InvestmentPlan) => {
    if (!wallet || wallet.balance < plan.amount) {
      toast.error('Insufficient balance');
      return;
    }

    setSelectedPlan(plan);
    setShowModal(true);
  };

  const confirmPurchase = async () => {
    if (!selectedPlan) return;

    try {
      setIsPurchasing(true);
      await planService.purchasePlan(selectedPlan.id);
      toast.success('Plan purchased successfully!');
      setShowModal(false);
      setSelectedPlan(null);
      await loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to purchase plan');
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-text-secondary">Loading investment plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-text-primary">Investment Plans</h1>
        <p className="text-text-secondary mt-1">
          Grow your wealth with our curated investment opportunities
        </p>
      </div>

      {/* Wallet Balance Card */}
      <Card className="bg-gradient-to-br from-primary to-primary-dark text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm">Available Balance</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(wallet?.balance || 0)}</p>
          </div>
          <DollarSign className="w-16 h-16 opacity-30" />
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('available')}
          className={`px-6 py-3 font-medium transition-colors relative ${
            activeTab === 'available'
              ? 'text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Available Plans
          {activeTab === 'available' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('my-investments')}
          className={`px-6 py-3 font-medium transition-colors relative ${
            activeTab === 'my-investments'
              ? 'text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          My Investments
          {userInvestments.length > 0 && (
            <span className="ml-2 bg-primary text-white text-xs px-2 py-0.5 rounded-full">
              {userInvestments.length}
            </span>
          )}
          {activeTab === 'my-investments' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {/* Available Plans */}
      {activeTab === 'available' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.filter(plan => plan.isActive).map((plan) => (
            <Card
              key={plan.id}
              className="flex flex-col hover:shadow-lg transition-shadow"
              hover
            >
              <div className="flex-1">
                {/* Plan Header */}
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-text-primary mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-text-secondary text-sm">{plan.description}</p>
                </div>

                {/* Amount */}
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 mb-4">
                  <p className="text-sm text-text-secondary mb-1">Investment Amount</p>
                  <p className="text-3xl font-bold text-primary">
                    {formatCurrency(plan.amount)}
                  </p>
                </div>

                {/* Returns Info */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-background rounded-lg">
                    <p className="text-xs text-text-secondary mb-1">Daily Return</p>
                    <p className="text-lg font-bold text-success">
                      {formatCurrency(plan.dailyReturn)}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-background rounded-lg">
                    <p className="text-xs text-text-secondary mb-1">Total Return</p>
                    <p className="text-lg font-bold text-success">
                      {formatCurrency(plan.totalReturn)}
                    </p>
                  </div>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-2 mb-4 text-text-secondary">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{plan.duration} days duration</span>
                </div>

                {/* Features */}
                <div className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-text-secondary">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Purchase Button */}
              <Button
                fullWidth
                onClick={() => handlePurchase(plan)}
                disabled={!wallet || wallet.balance < plan.amount}
              >
                {!wallet || wallet.balance < plan.amount
                  ? 'Insufficient Balance'
                  : 'Invest Now'}
              </Button>
            </Card>
          ))}

          {plans.filter(plan => plan.isActive).length === 0 && (
            <div className="col-span-full text-center py-12">
              <Info className="w-16 h-16 text-text-secondary mx-auto mb-4 opacity-50" />
              <p className="text-text-secondary text-lg">No investment plans available</p>
            </div>
          )}
        </div>
      )}

      {/* My Investments */}
      {activeTab === 'my-investments' && (
        <div className="space-y-4">
          {userInvestments.length > 0 ? (
            <>
              {/* Active Investments */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userInvestments
                  .filter((inv) => inv.status === 'active')
                  .map((investment) => (
                    <Card
                      key={investment.id}
                      className="border-l-4 border-success"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-bold text-lg text-text-primary">
                            {investment.plan.name}
                          </h4>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                            Active
                          </span>
                        </div>
                        <Award className="w-8 h-8 text-success" />
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-text-secondary">Invested Amount</p>
                          <p className="text-xl font-bold text-text-primary">
                            {formatCurrency(investment.amount)}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-text-secondary">Total Earned</p>
                            <p className="text-lg font-semibold text-success">
                              {formatCurrency(investment.totalEarned)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-text-secondary">Daily Earnings</p>
                            <p className="text-lg font-semibold text-success">
                              {formatCurrency(investment.dailyEarnings)}
                            </p>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between text-xs text-text-secondary">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>Start: {formatDate(investment.startDate)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>End: {formatDate(investment.endDate)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>

              {/* Completed Investments */}
              {userInvestments.filter((inv) => inv.status === 'completed').length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4 mt-6">
                    Completed Investments
                  </h3>
                  <div className="space-y-3">
                    {userInvestments
                      .filter((inv) => inv.status === 'completed')
                      .map((investment) => (
                        <Card key={investment.id} className="border-l-4 border-gray-300">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-text-primary">
                                {investment.plan.name}
                              </h4>
                              <p className="text-sm text-text-secondary">
                                Completed on {formatDate(investment.endDate)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-text-secondary">Total Earned</p>
                              <p className="text-xl font-bold text-success">
                                {formatCurrency(investment.totalEarned)}
                              </p>
                            </div>
                            <span className="ml-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              Completed
                            </span>
                          </div>
                        </Card>
                      ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <TrendingUp className="w-20 h-20 text-text-secondary mx-auto mb-4 opacity-30" />
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                No investments yet
              </h3>
              <p className="text-text-secondary mb-6">
                Start investing in our plans to grow your wealth
              </p>
              <Button onClick={() => setActiveTab('available')}>
                Browse Available Plans
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Purchase Confirmation Modal */}
      {showModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full relative">
            <button
              onClick={() => {
                setShowModal(false);
                setSelectedPlan(null);
              }}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-2xl font-bold text-text-primary mb-4">
              Confirm Purchase
            </h3>

            <div className="space-y-4 mb-6">
              <div className="bg-background rounded-lg p-4">
                <p className="text-sm text-text-secondary mb-1">Plan Name</p>
                <p className="text-lg font-semibold text-text-primary">
                  {selectedPlan.name}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background rounded-lg p-4">
                  <p className="text-sm text-text-secondary mb-1">Investment</p>
                  <p className="text-lg font-semibold text-text-primary">
                    {formatCurrency(selectedPlan.amount)}
                  </p>
                </div>
                <div className="bg-background rounded-lg p-4">
                  <p className="text-sm text-text-secondary mb-1">Duration</p>
                  <p className="text-lg font-semibold text-text-primary">
                    {selectedPlan.duration} days
                  </p>
                </div>
              </div>

              <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                <p className="text-sm text-text-secondary mb-1">Expected Total Return</p>
                <p className="text-2xl font-bold text-success">
                  {formatCurrency(selectedPlan.totalReturn)}
                </p>
              </div>

              <div className="bg-background rounded-lg p-4">
                <p className="text-sm text-text-secondary mb-2">Current Balance</p>
                <p className="text-xl font-semibold text-text-primary">
                  {formatCurrency(wallet?.balance || 0)}
                </p>
                <p className="text-sm text-text-secondary mt-2">Balance after purchase</p>
                <p className="text-xl font-semibold text-text-primary">
                  {formatCurrency((wallet?.balance || 0) - selectedPlan.amount)}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  setShowModal(false);
                  setSelectedPlan(null);
                }}
                disabled={isPurchasing}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                onClick={confirmPurchase}
                loading={isPurchasing}
                disabled={isPurchasing}
              >
                {isPurchasing ? 'Processing...' : 'Confirm Purchase'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
