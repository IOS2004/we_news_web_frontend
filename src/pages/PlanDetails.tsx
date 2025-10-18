import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  Share2, 
  Calendar,
  DollarSign,
  Network,
  Target,
  Award
} from 'lucide-react';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Button from '@/components/common/Button';
import investmentService, { type UserInvestment } from '@/services/investmentApi';
import toast from 'react-hot-toast';

export default function PlanDetails() {
  const { investmentId } = useParams<{ investmentId: string }>();
  const navigate = useNavigate();
  const [investment, setInvestment] = useState<UserInvestment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvestmentDetails();
  }, [investmentId]);

  const loadInvestmentDetails = async () => {
    if (!investmentId) {
      toast.error('Invalid investment ID');
      navigate('/dashboard');
      return;
    }

    try {
      setLoading(true);
      const data = await investmentService.getInvestmentById(investmentId);
      
      if (!data) {
        toast.error('Investment not found');
        navigate('/dashboard');
        return;
      }

      const formatted = investmentService.formatInvestmentForUI(data);
      setInvestment(formatted);
    } catch (error) {
      console.error('Error loading investment:', error);
      toast.error('Failed to load investment details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Join my ${investment?.planName} network!`,
          text: `I'm earning with WeNews ${investment?.planName}. Join me!`,
          url: window.location.origin + '/plans'
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.origin + '/plans');
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleViewNetwork = () => {
    navigate(`/network?planId=${investmentId}`);
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getFrequencyLabel = (freq: string) => {
    return freq.charAt(0).toUpperCase() + freq.slice(1);
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!investment) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-20">
      {/* Header */}
      <div 
        className="relative text-white py-8 px-4"
        style={{ 
          background: `linear-gradient(135deg, ${investment.color || '#3B82F6'} 0%, ${investment.color || '#3B82F6'}dd 100%)` 
        }}
      >
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{investment.planName}</h1>
              <p className="text-white/80">{getFrequencyLabel(investment.frequency)} Contribution Plan</p>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
              investment.status === 'active' 
                ? 'bg-green-500/20 text-green-100' 
                : 'bg-yellow-500/20 text-yellow-100'
            }`}>
              {investment.status.toUpperCase()}
            </div>
          </div>

          {/* Days Remaining Card */}
          <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8" />
                <div>
                  <p className="text-sm text-white/80">Plan Validity</p>
                  <p className="text-2xl font-bold">{investment.daysRemaining} days left</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/80">Ends On</p>
                <p className="font-semibold">{new Date(investment.expiryDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-6">
        {/* Total Earnings Card */}
        <Card className="bg-white shadow-xl mb-6">
          <div className="text-center py-6">
            <p className="text-gray-600 text-sm mb-2">Total Earnings from This Plan</p>
            <p className="text-5xl font-bold text-gray-900 mb-1">
              {formatCurrency(investment.totalEarnings || 0)}
            </p>
            <div className="flex items-center justify-center gap-2 text-green-600 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>Growing daily!</span>
            </div>
          </div>

          {/* Earnings Breakdown */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Today</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(investment.todayEarnings || 0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Investment</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(investment.investmentEarnings || 0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Referrals</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(investment.referralEarnings || 0)}
              </p>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleShare}
              className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Share2 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Refer & Earn</p>
                <p className="text-xs text-gray-600">Share your link</p>
              </div>
            </button>

            <button
              onClick={handleViewNetwork}
              className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">View Network</p>
                <p className="text-xs text-gray-600">See your team</p>
              </div>
            </button>
          </div>
        </Card>

        {/* Investment Statistics */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                <Target className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Contribution Streak</p>
                <p className="text-2xl font-bold text-gray-900">{investment.contributionStreak || 0}</p>
                <p className="text-xs text-gray-500">days in a row</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <Network className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Network Size</p>
                <p className="text-2xl font-bold text-gray-900">{investment.networkSize || 0}</p>
                <p className="text-xs text-gray-500">team members</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Contribution Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(investment.contributionAmount)}
                </p>
                <p className="text-xs text-gray-500">per {investment.frequency}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Award className="w-7 h-7 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Contributions</p>
                <p className="text-2xl font-bold text-gray-900">{investment.totalContributions || 0}</p>
                <p className="text-xs text-gray-500">payments made</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Plan Details */}
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Plan Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Initial Payment</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(investment.initialPayment)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Contribution Frequency</span>
              <span className="font-semibold text-gray-900">{getFrequencyLabel(investment.frequency)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Next Contribution Date</span>
              <span className="font-semibold text-gray-900">
                {new Date(investment.nextContributionDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Started On</span>
              <span className="font-semibold text-gray-900">
                {new Date(investment.startDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600">Plan Validity</span>
              <span className="font-semibold text-gray-900">{investment.planValidity} days</span>
            </div>
          </div>
        </Card>

        {/* Network Section */}
        {investment.networkSize !== undefined && investment.networkSize > 0 && (
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Your Network</h2>
              <Button onClick={handleViewNetwork}>View Full Network</Button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Direct Referrals</p>
                <p className="text-2xl font-bold text-blue-600">{investment.directReferrals || 0}</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Network</p>
                <p className="text-2xl font-bold text-purple-600">{investment.totalReferrals || 0}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Active Members</p>
                <p className="text-2xl font-bold text-green-600">{investment.activeReferrals || 0}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Performance Metrics */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Performance Metrics</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Contribution Completion</span>
                <span className="text-sm font-semibold text-gray-900">
                  {investment.totalContributions}/{investment.planValidity}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all"
                  style={{ 
                    width: `${Math.min(100, ((investment.totalContributions || 0) / investment.planValidity) * 100)}%`,
                    backgroundColor: investment.color || '#3B82F6'
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Plan Progress</span>
                <span className="text-sm font-semibold text-gray-900">
                  {Math.max(0, investment.planValidity - (investment.daysRemaining || 0))} / {investment.planValidity} days
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-green-500 transition-all"
                  style={{ 
                    width: `${Math.min(100, ((investment.planValidity - (investment.daysRemaining || 0)) / investment.planValidity) * 100)}%`
                  }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
