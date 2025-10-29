import { useNavigate } from 'react-router-dom';
import { TrendingUp, Users, Calendar, DollarSign, Network } from 'lucide-react';
import Card from './common/Card';
import type { UserInvestment } from '@/services/investmentApi';

interface PlanCardProps {
  investment: UserInvestment;
  isActive?: boolean;
}

export default function PlanCard({ investment, isActive = false }: PlanCardProps) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/plan-details/${investment.id}`);
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '₹0';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div 
      className={`cursor-pointer transition-all hover:shadow-2xl ${
        isActive ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={handleCardClick}
    >
      <Card>
      {/* Header with Plan Name and Status */}
      <div 
        className="p-6 rounded-t-2xl text-white"
        style={{ 
          background: `linear-gradient(135deg, ${investment.color || '#3B82F6'} 0%, ${investment.color || '#3B82F6'}dd 100%)` 
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold capitalize">{investment.planName}</h3>
            <p className="text-white/80 text-sm mt-1">
              Subscription Plan
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
            investment.status === 'active' 
              ? 'bg-green-500/20 text-green-100' 
              : 'bg-yellow-500/20 text-yellow-100'
          }`}>
            {investment.status.toUpperCase()}
          </div>
        </div>

        {/* Days Remaining */}
        <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">
            {investment.daysRemaining || 0} days remaining
          </span>
        </div>
      </div>

      {/* Body with Earnings and Stats */}
      <div className="p-6 space-y-4">
        {/* Total Earnings */}
        <div className="text-center pb-4 border-b border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
          <p className="text-4xl font-bold text-gray-900">
            {formatCurrency(investment.totalEarnings || 0)}
          </p>
        </div>

        {/* Earnings Breakdown */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100 mx-auto mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-xs text-gray-600 mb-1">Today</p>
            <p className="text-sm font-bold text-gray-900">
              {formatCurrency(investment.todayEarnings || 0)}
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 mx-auto mb-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-xs text-gray-600 mb-1">Investment</p>
            <p className="text-sm font-bold text-gray-900">
              {formatCurrency(investment.investmentEarnings || 0)}
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100 mx-auto mb-2">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-xs text-gray-600 mb-1">Referral</p>
            <p className="text-sm font-bold text-gray-900">
              {formatCurrency(investment.referralEarnings || 0)}
            </p>
          </div>
        </div>

        {/* Investment Details */}
        <div className="pt-4 border-t border-gray-200 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Investment Amount</span>
            <span className="text-sm font-semibold text-gray-900">
              {formatCurrency(investment.investmentAmount || investment.contributionAmount)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Level</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">
                Level {investment.currentLevel || 0}
              </span>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                L{investment.currentLevel || 0}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <Network className="w-4 h-4" />
              Referrals
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {investment.totalReferrals || 0}
            </span>
          </div>
        </div>

        {/* View Details Button */}
        <button
          onClick={handleCardClick}
          className="w-full mt-4 py-3 rounded-lg font-semibold text-white transition-all hover:shadow-lg"
          style={{ backgroundColor: investment.color || '#3B82F6' }}
        >
          View Details →
        </button>
      </div>
      </Card>
    </div>
  );
}
