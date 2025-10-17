import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '@/services/dashboardService';
import { useWallet } from '@/contexts/WalletContext';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import PlanCard from '@/components/PlanCard';
import { formatCurrency } from '@/utils/helpers';
import type { DashboardStats } from '@/types';
import { TrendingUp, Wallet, Users, Newspaper, Palette, Hash, UserPlus, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import investmentService, { type UserInvestment } from '@/services/investmentApi';

export default function Dashboard() {
  const navigate = useNavigate();
  const { wallet, refreshWallet } = useWallet();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [investments, setInvestments] = useState<UserInvestment[]>([]);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load wallet data first
      await refreshWallet();
      
      // Load user investments
      try {
        const userInvestments = await investmentService.getMyInvestments();
        const formattedInvestments = userInvestments.map(inv => 
          investmentService.formatInvestmentForUI(inv)
        );
        setInvestments(formattedInvestments);
      } catch (investError) {
        console.log('No active investments found:', investError);
        setInvestments([]);
      }
      
      // Try to load stats, but don't fail if it doesn't work
      try {
        const statsData = await dashboardService.getDashboardStats();
        setStats(statsData);
      } catch (statsError) {
        console.log('Stats not available, using defaults:', statsError);
        // Use default stats if API fails
        setStats({
          totalEarnings: 0,
          todayEarnings: 0,
          walletBalance: 0,
          totalReferrals: 0,
          activeInvestments: investments.length,
          newsRead: 0,
          tradingProfit: 0,
        });
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Set default stats on complete failure
      setStats({
        totalEarnings: 0,
        todayEarnings: 0,
        walletBalance: 0,
        totalReferrals: 0,
        activeInvestments: 0,
        newsRead: 0,
        tradingProfit: 0,
      });
      setInvestments([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary mt-1">Welcome back, {user?.firstName}!</p>
      </div>

      {/* Active Investment Plans Section */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Your Subscription Plans</h2>
            <p className="text-sm text-gray-600">
              {investments.length > 0 
                ? `${investments.length} active ${investments.length === 1 ? 'plan' : 'plans'}`
                : 'No active plans yet'
              }
            </p>
          </div>
          <button
            onClick={() => navigate('/plans')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Plan</span>
          </button>
        </div>

        {investments.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Subscriptions Yet</h3>
            <p className="text-gray-600 mb-4">Start your growth journey by choosing a plan</p>
            <button
              onClick={() => navigate('/plans')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Browse Plans
            </button>
          </div>
        ) : (
          /* Investment Cards Slider */
          <div className="relative">
            <div 
              ref={scrollContainerRef}
              className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {investments.map((investment, index) => (
                <div 
                  key={investment.id} 
                  className="min-w-[350px] md:min-w-[400px] snap-start"
                >
                  <PlanCard 
                    investment={investment} 
                    isActive={index === selectedPlanIndex}
                  />
                </div>
              ))}
            </div>

            {/* Pagination Dots */}
            {investments.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {investments.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedPlanIndex(index);
                      scrollContainerRef.current?.children[index]?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'center'
                      });
                    }}
                    className={`h-2 rounded-full transition-all ${
                      index === selectedPlanIndex 
                        ? 'w-8 bg-blue-600' 
                        : 'w-2 bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-primary to-primary-dark text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Wallet Balance</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(wallet?.balance || 0)}</p>
            </div>
            <Wallet className="w-12 h-12 opacity-30" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-success to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Total Earnings</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(stats?.totalEarnings || 0)}</p>
            </div>
            <TrendingUp className="w-12 h-12 opacity-30" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-accent to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Total Referrals</p>
              <p className="text-2xl font-bold mt-1">{stats?.totalReferrals || 0}</p>
            </div>
            <Users className="w-12 h-12 opacity-30" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-warning to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">News Read</p>
              <p className="text-2xl font-bold mt-1">{stats?.newsRead || 0}</p>
            </div>
            <Newspaper className="w-12 h-12 opacity-30" />
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/news')}
            className="p-4 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors text-center"
          >
            <p className="font-medium text-primary">Read News</p>
          </button>
          <button 
            onClick={() => navigate('/trading')}
            className="p-4 bg-accent/10 rounded-lg hover:bg-accent/20 transition-colors text-center"
          >
            <p className="font-medium text-accent">Trade Now</p>
          </button>
          <button 
            onClick={() => navigate('/plans')}
            className="p-4 bg-success/10 rounded-lg hover:bg-success/20 transition-colors text-center"
          >
            <p className="font-medium text-success">Buy Plan</p>
          </button>
          <button 
            onClick={() => navigate('/withdrawals')}
            className="p-4 bg-warning/10 rounded-lg hover:bg-warning/20 transition-colors text-center"
          >
            <p className="font-medium text-warning">Withdraw</p>
          </button>
        </div>
      </Card>

      {/* Trading & Network Sections */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Color Trading - 25% width (1 column) */}
        <div className="md:col-span-1">
          <Card className="h-full overflow-hidden relative bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200 shadow-lg transition-all duration-300">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-pink-500 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500 rounded-full blur-3xl animate-pulse delay-75"></div>
            </div>
            
            {/* Content */}
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg transition-transform duration-300">
                    <Palette className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">Color Trading</h3>
                    <p className="text-xs text-gray-500">Pick your lucky color</p>
                  </div>
                </div>
              </div>
              
              {/* Live Status Badge */}
              <div className="flex items-center gap-2 mb-3">
                <div className="relative flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-xs font-semibold text-green-700">LIVE NOW</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-2.5 border border-pink-200">
                  <div className="text-xl font-bold text-pink-600">2x</div>
                  <div className="text-xs text-gray-600">Win Rate</div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-2.5 border border-purple-200">
                  <div className="text-xl font-bold text-purple-600">₹10+</div>
                  <div className="text-xs text-gray-600">Min Bet</div>
                </div>
              </div>

              {/* Color Previews */}
              <div className="flex gap-2 mb-auto pb-4">
                <div className="w-8 h-8 rounded-lg bg-red-500 shadow-md transform hover:scale-110 transition-transform"></div>
                <div className="w-8 h-8 rounded-lg bg-green-500 shadow-md transform hover:scale-110 transition-transform"></div>
                <div className="w-8 h-8 rounded-lg bg-purple-600 shadow-md transform hover:scale-110 transition-transform"></div>
                <div className="text-xs self-center text-gray-500 ml-1">+9 more</div>
              </div>
              
              <button 
                onClick={() => navigate('/trading')}
                className="w-full py-3 bg-gradient-to-r from-pink-500 via-pink-600 to-purple-600 text-white rounded-xl font-bold hover:from-pink-600 hover:to-purple-700 hover:shadow-2xl active:scale-95 transition-all duration-300 shadow-lg transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <span>Play Now</span>
                <TrendingUp className="w-4 h-4" />
              </button>
            </div>
          </Card>
        </div>

        {/* Number Trading - 25% width (1 column) */}
        <div className="md:col-span-1">
          <Card className="h-full overflow-hidden relative bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 shadow-lg transition-all duration-300">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500 rounded-full blur-3xl animate-pulse delay-75"></div>
            </div>
            
            {/* Content */}
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg transition-transform duration-300">
                    <Hash className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">Number Trading</h3>
                    <p className="text-xs text-gray-500">Guess the number</p>
                  </div>
                </div>
              </div>
              
              {/* Live Status Badge */}
              <div className="flex items-center gap-2 mb-3">
                <div className="relative flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-xs font-semibold text-green-700">LIVE NOW</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-2.5 border border-blue-200">
                  <div className="text-xl font-bold text-blue-600">9x</div>
                  <div className="text-xs text-gray-600">Win Rate</div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-2.5 border border-cyan-200">
                  <div className="text-xl font-bold text-cyan-600">0-9</div>
                  <div className="text-xs text-gray-600">Numbers</div>
                </div>
              </div>

              {/* Number Previews */}
              <div className="flex gap-2 mb-auto pb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-md flex items-center justify-center text-white font-bold text-sm transform hover:scale-110 transition-transform">0</div>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-md flex items-center justify-center text-white font-bold text-sm transform hover:scale-110 transition-transform">5</div>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 shadow-md flex items-center justify-center text-white font-bold text-sm transform hover:scale-110 transition-transform">9</div>
                <div className="text-xs self-center text-gray-500 ml-1">Pick any!</div>
              </div>
              
              <button 
                onClick={() => navigate('/trading/number')}
                className="w-full py-3 bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-cyan-700 hover:shadow-2xl active:scale-95 transition-all duration-300 shadow-lg transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <span>Play Now</span>
                <TrendingUp className="w-4 h-4" />
              </button>
            </div>
          </Card>
        </div>

        {/* Network - 50% width (2 columns) */}
        <div className="md:col-span-2">
          <Card className="h-full overflow-hidden relative bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 shadow-lg transition-all duration-300">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-1/4 w-40 h-40 bg-green-500 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-emerald-500 rounded-full blur-3xl animate-pulse delay-75"></div>
            </div>
            
            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg transition-transform duration-300">
                    <UserPlus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">Referral Network</h3>
                    <p className="text-xs text-gray-500">
                      {investments.length > 0 
                        ? `Across ${investments.length} ${investments.length === 1 ? 'plan' : 'plans'}`
                        : 'Grow your team & earn more'
                      }
                    </p>
                  </div>
                </div>
                <div className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full text-white text-sm font-bold shadow-md">
                  Active
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-green-200 transform hover:scale-105 transition-transform">
                  <Users className="w-6 h-6 text-green-600 mb-2" />
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {investments.reduce((sum, inv) => sum + (inv.totalReferrals || 0), 0) || user?.totalReferrals || 0}
                  </div>
                  <div className="text-xs text-gray-600">Total Network</div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-emerald-200 transform hover:scale-105 transition-transform">
                  <Wallet className="w-6 h-6 text-emerald-600 mb-2" />
                  <div className="text-3xl font-bold text-emerald-600 mb-1">
                    {formatCurrency(investments.reduce((sum, inv) => sum + (inv.referralEarnings || 0), 0) || user?.referralEarnings || 0)}
                  </div>
                  <div className="text-xs text-gray-600">Referral Earnings</div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-green-200 transform hover:scale-105 transition-transform">
                  <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {investments.reduce((sum, inv) => sum + (inv.activeReferrals || 0), 0) || 0}
                  </div>
                  <div className="text-xs text-gray-600">Active Members</div>
                </div>
              </div>

              {/* Referral Code Section */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 mb-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/80 mb-1">Your Referral Code</p>
                    <p className="font-mono font-bold text-xl">{user?.referralCode || 'N/A'}</p>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(user?.referralCode || '');
                      toast.success('Referral code copied!');
                    }}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 active:scale-95 rounded-lg transition-all duration-200 backdrop-blur-sm text-sm font-semibold"
                  >
                    Copy
                  </button>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  // Navigate to network page with first active plan or no planId if no investments
                  const planId = investments.length > 0 ? investments[0].id : '';
                  navigate(planId ? `/network?planId=${planId}` : '/network');
                }}
                className="w-full py-3 bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 hover:shadow-2xl active:scale-95 transition-all duration-300 shadow-lg transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <span>View Full Network</span>
                <Users className="w-4 h-4" />
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
