import React, { useState, useEffect } from 'react';
import { 
  TrendingUp,
  PlayCircle,
  Download,
  Gift,
  Users,
  Wallet,
  Calendar,
  BarChart3,
  RefreshCw,
  ArrowUpRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import earningsApi, { TodayEarning } from '../services/earningsApi';

type Period = 'today' | 'week' | 'month';

const Earnings: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('today');
  const [loading, setLoading] = useState(true);
  const [todayEarnings, setTodayEarnings] = useState<TodayEarning | null>(null);

  const quickActions = [
    {
      id: 1,
      title: 'Watch Ads',
      earning: '+₹5-15',
      icon: PlayCircle,
      iconColor: '#10B981',
      backgroundColor: '#D1FAE5',
      action: 'watch_ads',
    },
    {
      id: 2,
      title: 'Install Apps',
      earning: '+₹10-50',
      icon: Download,
      iconColor: '#3B82F6',
      backgroundColor: '#DBEAFE',
      action: 'install_apps',
    },
    {
      id: 3,
      title: 'Daily Check-in',
      earning: '+₹20',
      icon: Calendar,
      iconColor: '#F59E0B',
      backgroundColor: '#FEF3C7',
      action: 'daily_checkin',
    },
    {
      id: 4,
      title: 'Refer Friends',
      earning: '+₹100',
      icon: Users,
      iconColor: '#8B5CF6',
      backgroundColor: '#EDE9FE',
      action: 'refer_friends',
    },
  ];

  useEffect(() => {
    fetchEarnings();
  }, [selectedPeriod]);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const data = await earningsApi.getTodayEarnings();
      setTodayEarnings(data);
    } catch (error: any) {
      console.error('Failed to fetch earnings:', error);
      toast.error('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    try {
      switch (action) {
        case 'watch_ads':
          toast.success('Feature coming soon!');
          break;
        case 'install_apps':
          toast.success('Feature coming soon!');
          break;
        case 'daily_checkin':
          toast.success('Feature coming soon!');
          break;
        case 'refer_friends':
          window.location.href = '/network';
          break;
      }
    } catch (error: any) {
      toast.error('Failed to complete action');
    }
  };

  const formatAmount = (amount: number) => {
    return amount.toFixed(2);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const getIconForSource = (source: string) => {
    switch (source) {
      case 'referral': return Users;
      case 'investment': return TrendingUp;
      case 'daily_login': return Calendar;
      case 'trading': return BarChart3;
      case 'task': return Gift;
      case 'bonus': return Gift;
      default: return Wallet;
    }
  };

  const totalEarnings = todayEarnings?.total || 0;
  const change = '+12.5%'; // This should come from backend

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-1">Earnings & Rewards</h1>
              <p className="text-white/80">Track your accumulated rewards</p>
            </div>
            <button
              onClick={fetchEarnings}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Main Earnings Display */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-white/80 text-sm mb-2">Total Earnings</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">₹</span>
                  <span className="text-6xl font-extrabold">{formatAmount(totalEarnings)}</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Wallet className="w-6 h-6" />
              </div>
            </div>

            <div className="inline-flex items-center gap-2 bg-green-500/20 px-3 py-2 rounded-lg">
              <ArrowUpRight className="w-4 h-4 text-green-300" />
              <span className="text-sm font-semibold text-green-100">{change} from last period</span>
            </div>

            {/* Period Selector */}
            <div className="flex gap-2 mt-6">
              {(['today', 'week', 'month'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all ${
                    selectedPeriod === period
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">Earn More</h2>
            <p className="text-sm text-gray-600">Boost your earnings with these activities</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action.action)}
                  className="p-4 rounded-xl transition-all hover:scale-105 hover:shadow-lg"
                  style={{ backgroundColor: action.backgroundColor }}
                >
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 mx-auto"
                    style={{ backgroundColor: action.iconColor + '20' }}
                  >
                    <Icon className="w-6 h-6" style={{ color: action.iconColor }} />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{action.title}</h3>
                  <p className="text-lg font-bold" style={{ color: action.iconColor }}>
                    {action.earning}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Earnings Breakdown */}
        {todayEarnings && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Earnings Breakdown</h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(todayEarnings.breakdown).map(([source, amount]) => (
                <div key={source} className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1 capitalize">
                    {source.replace('_', ' ')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{formatAmount(amount)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
              View All
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : todayEarnings && todayEarnings.transactions.length > 0 ? (
            <div className="space-y-3">
              {todayEarnings.transactions.slice(0, 10).map((transaction) => {
                const Icon = getIconForSource(transaction.source);
                return (
                  <div 
                    key={transaction.id}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 capitalize">
                        {transaction.source.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-gray-600">{transaction.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        +₹{formatAmount(transaction.amount)}
                      </p>
                      <p className="text-xs text-gray-500">{formatTime(transaction.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No recent transactions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Earnings;
