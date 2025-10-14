import { useEffect, useState } from 'react';
import { dashboardService } from '@/services/dashboardService';
import { useWallet } from '@/contexts/WalletContext';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatCurrency } from '@/utils/helpers';
import type { DashboardStats } from '@/types';
import { TrendingUp, Wallet, Users, Newspaper } from 'lucide-react';

export default function Dashboard() {
  const { wallet, refreshWallet } = useWallet();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load wallet data first
      await refreshWallet();
      
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
          activeInvestments: 0,
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
        <p className="text-text-secondary mt-1">Welcome back! Here's your overview.</p>
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
          <button className="p-4 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors text-center">
            <p className="font-medium text-primary">Read News</p>
          </button>
          <button className="p-4 bg-accent/10 rounded-lg hover:bg-accent/20 transition-colors text-center">
            <p className="font-medium text-accent">Trade Now</p>
          </button>
          <button className="p-4 bg-success/10 rounded-lg hover:bg-success/20 transition-colors text-center">
            <p className="font-medium text-success">Buy Plan</p>
          </button>
          <button className="p-4 bg-warning/10 rounded-lg hover:bg-warning/20 transition-colors text-center">
            <p className="font-medium text-warning">Withdraw</p>
          </button>
        </div>
      </Card>
    </div>
  );
}
