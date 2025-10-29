import { useEffect, useState } from 'react';
import { Trophy, Clock, Users, Gift, CheckCircle, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import Card from './common/Card';
import LoadingSpinner from './common/LoadingSpinner';
import investmentService from '@/services/investmentApi';
import toast from 'react-hot-toast';

interface LevelRewardsProps {
  investmentId: string;
  onRewardsClaimed?: () => void;
}

interface LevelData {
  level: number;
  label: string;
  reward: number;
  requiredDays: number;
  requiredChain: number;
  status: 'claimed' | 'claimable' | 'locked';
  daysProgress: number;
  referralsProgress: number;
  combinedProgress: number;
  daysRemaining: number;
  referralsRemaining: number;
}

interface LevelStatus {
  investmentId: string;
  userId?: string;
  planName: string;
  planKey?: string;
  currentLevel: number;
  activeLevel: number;
  highestClaimedLevel: number;
  levelSchemaVersion?: number;
  totalLevels: number;
  elapsedDays: number;
  totalReferrals: number;
  startDate?: string | null;
  currentLevelInfo: LevelData;
  nextLevelInfo: LevelData | null;
  claimableLevelsCount: number;
  claimableLevels: LevelData[];
  allLevels: LevelData[];
}

export default function LevelRewards({ investmentId, onRewardsClaimed }: LevelRewardsProps) {
  const [levelStatus, setLevelStatus] = useState<LevelStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [showAllLevels, setShowAllLevels] = useState(false);

  useEffect(() => {
    loadLevelsStatus();
  }, [investmentId]);

  const loadLevelsStatus = async () => {
    try {
      setLoading(true);
      const status = await investmentService.getLevelsStatus(investmentId);
      setLevelStatus(status);
    } catch (error) {
      console.error('Error loading level status:', error);
      toast.error('Failed to load level rewards');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimRewards = async () => {
    if (!levelStatus || levelStatus.claimableLevelsCount === 0) return;

    try {
      setClaiming(true);
      const levelsToClaim = levelStatus.claimableLevels.map(l => l.level);
      
      const result = await investmentService.claimLevelRewards({
        investmentId,
        levels: levelsToClaim
      });

      toast.success(
        `🎉 Claimed ${result.levelsClaimed.length} level${result.levelsClaimed.length > 1 ? 's' : ''}! ` +
        `Earned ₹${result.totalReward.toLocaleString('en-IN')}`
      );

      // Reload status
      await loadLevelsStatus();
      
      // Notify parent component
      if (onRewardsClaimed) {
        onRewardsClaimed();
      }
    } catch (error: any) {
      console.error('Error claiming rewards:', error);
      toast.error(error.message || 'Failed to claim rewards');
    } finally {
      setClaiming(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'claimed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'claimable':
        return <Gift className="w-5 h-5 text-yellow-600" />;
      case 'locked':
        return <Lock className="w-5 h-5 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'claimed':
        return 'bg-green-50 border-green-200';
      case 'claimable':
        return 'bg-yellow-50 border-yellow-200';
      case 'locked':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="py-12">
          <LoadingSpinner />
        </div>
      </Card>
    );
  }

  if (!levelStatus) {
    return null;
  }

  const {
    currentLevelInfo,
    nextLevelInfo,
    claimableLevelsCount,
    claimableLevels,
    allLevels,
    highestClaimedLevel,
    totalLevels,
  } = levelStatus;

  const hasCompletedAllLevels = highestClaimedLevel >= totalLevels;
  const canClaimLevels = claimableLevelsCount > 0;
  const totalClaimableReward = claimableLevels.reduce((sum, level) => sum + level.reward, 0);
  const rewardForDisplay = canClaimLevels ? totalClaimableReward : currentLevelInfo.reward;

  const lockReasons: string[] = [];
  if (!hasCompletedAllLevels && !canClaimLevels) {
    if (currentLevelInfo.daysRemaining > 0) {
      lockReasons.push(`${currentLevelInfo.daysRemaining} more day${currentLevelInfo.daysRemaining === 1 ? '' : 's'}`);
    }
    if (currentLevelInfo.referralsRemaining > 0) {
      lockReasons.push(`${currentLevelInfo.referralsRemaining} more referral${currentLevelInfo.referralsRemaining === 1 ? '' : 's'}`);
    }
  }

  const lockMessage = lockReasons.length > 0
    ? `Unlocks after ${lockReasons.join(' and ')}.`
    : 'Complete pending requirements to unlock this reward.';

  const claimCardClasses = canClaimLevels
    ? 'mt-6 p-6 rounded-xl border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50'
    : 'mt-6 p-6 rounded-xl border-2 border-gray-200 bg-white';

  const claimIconClasses = canClaimLevels
    ? 'w-12 h-12 rounded-full flex items-center justify-center bg-yellow-400 text-white animate-pulse'
    : 'w-12 h-12 rounded-full flex items-center justify-center bg-gray-200 text-gray-500';

  const claimButtonClasses = canClaimLevels
    ? 'bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white shadow-lg hover:shadow-xl'
    : 'bg-gray-200 text-gray-500 cursor-not-allowed';

  const claimTitle = canClaimLevels
    ? `${claimableLevelsCount} Level${claimableLevelsCount > 1 ? 's' : ''} Ready to Claim`
    : `Level ${currentLevelInfo.level} Reward Locked`;

  const claimSubtitle = canClaimLevels
    ? 'All requirements met. Claim to receive your reward instantly.'
    : lockMessage;

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Level Rewards</h2>
              <p className="text-white/80 text-sm">Unlock rewards as you grow</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">L{currentLevelInfo.level}</div>
            <div className="text-white/80 text-sm">
              {hasCompletedAllLevels ? 'Completed Level' : 'Current Level'}
            </div>
          </div>
        </div>
      </div>

      {/* Current Progress Card */}
      <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">
              Current: Level {currentLevelInfo.level} ({currentLevelInfo.label})
            </span>
            {nextLevelInfo && !hasCompletedAllLevels && (
              <span className="text-sm font-semibold text-gray-700">
                Next: Level {nextLevelInfo.level} ({nextLevelInfo.label})
              </span>
            )}
          </div>

          {/* Progress Bar */}
          {!hasCompletedAllLevels ? (
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  style={{ width: `${currentLevelInfo.combinedProgress}%` }}
                >
                  <span className="text-xs font-bold text-white">
                    {currentLevelInfo.combinedProgress}%
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full h-4 flex items-center justify-center">
              <span className="text-xs font-bold text-white">MAX LEVEL REACHED! 🎉</span>
            </div>
          )}
        </div>

        {/* Requirements Progress */}
        {!hasCompletedAllLevels && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            {/* Time Unlock Progress */}
            <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-semibold text-gray-700">Claimable After</span>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>{levelStatus.elapsedDays} days elapsed</span>
                  <span>{currentLevelInfo.requiredDays} days required</span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-2">
                  <div
                    className="h-2 bg-blue-600 rounded-full transition-all"
                    style={{ width: `${currentLevelInfo.daysProgress}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-600">
                {currentLevelInfo.daysRemaining > 0
                  ? `Claim unlocks after ${currentLevelInfo.daysRemaining} more day${currentLevelInfo.daysRemaining === 1 ? '' : 's'}`
                  : 'Wait period met — claim stays available.'}
              </p>
            </div>

            {/* Referrals Progress */}
            <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-semibold text-gray-700">Referrals</span>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>{levelStatus.totalReferrals} refs</span>
                  <span>{currentLevelInfo.requiredChain} refs</span>
                </div>
                <div className="w-full bg-purple-100 rounded-full h-2">
                  <div
                    className="h-2 bg-purple-600 rounded-full transition-all"
                    style={{ width: `${currentLevelInfo.referralsProgress}%` }}
                  />
                </div>
              </div>
              {currentLevelInfo.referralsRemaining > 0 && (
                <p className="text-xs text-gray-600">
                  {currentLevelInfo.referralsRemaining} referrals needed
                </p>
              )}
            </div>
          </div>
        )}

        {/* Claim Reward CTA */}
        {!hasCompletedAllLevels && (
          <div className={claimCardClasses}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className={claimIconClasses}>
                  {canClaimLevels ? <Gift className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{claimTitle}</h3>
                  <p className="text-xs text-gray-600 max-w-sm">{claimSubtitle}</p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs text-gray-600">Reward Value</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(rewardForDisplay)}</p>
                <p className="text-xs text-gray-500">
                  Requires {currentLevelInfo.requiredDays} days • {currentLevelInfo.requiredChain} referrals
                </p>
              </div>
            </div>

            {canClaimLevels && (
              <div className="mt-4 space-y-2">
                {claimableLevels.slice(0, 3).map((level) => (
                  <div
                    key={level.level}
                    className="bg-white/90 rounded-lg p-3 border-2 border-yellow-300 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <span className="font-bold text-yellow-700">L{level.level}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{level.label}</p>
                        <p className="text-xs text-gray-600">
                          ✓ {level.requiredDays} days • ✓ {level.requiredChain} refs
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-yellow-600">{formatCurrency(level.reward)}</p>
                    </div>
                  </div>
                ))}
                {claimableLevels.length > 3 && (
                  <p className="text-sm text-gray-700 text-center">
                    +{claimableLevels.length - 3} more level{claimableLevels.length - 3 > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}

            <div className="mt-4">
              <button
                type="button"
                onClick={canClaimLevels ? handleClaimRewards : undefined}
                disabled={!canClaimLevels || claiming}
                className={`w-full rounded-xl font-semibold py-3 transition-all flex items-center justify-center gap-2 ${claimButtonClasses} ${claiming ? 'opacity-70 cursor-wait' : ''}`}
              >
                {claiming ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Claiming...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {canClaimLevels ? <Gift className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                    Claim Now
                  </span>
                )}
              </button>
            </div>

            {!canClaimLevels && (
              <p className="mt-3 text-xs text-gray-500 text-center sm:text-left">
                {lockMessage}
              </p>
            )}
          </div>
        )}
      </div>

      {/* All Levels Accordion */}
      <div className="p-6 border-t border-gray-200">
        <button
          onClick={() => setShowAllLevels(!showAllLevels)}
          className="w-full flex items-center justify-between text-left mb-4 hover:bg-gray-50 p-3 rounded-lg transition-colors"
        >
          <h3 className="text-lg font-bold text-gray-900">
            All {levelStatus.totalLevels} Levels
          </h3>
          {showAllLevels ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {showAllLevels && (
          <div className="space-y-2">
            {allLevels.map((level) => (
              <div
                key={level.level}
                className={`rounded-lg p-4 border-2 ${getStatusColor(level.status)} transition-all`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(level.status)}
                    <div>
                      <p className="font-semibold text-gray-900">
                        Level {level.level} - {level.label}
                      </p>
                      <p className="text-xs text-gray-600">
                        {level.requiredDays} days • {level.requiredChain} referrals
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      level.status === 'claimed' ? 'text-green-600' :
                      level.status === 'claimable' ? 'text-yellow-600' :
                      'text-gray-400'
                    }`}>
                      {formatCurrency(level.reward)}
                    </p>
                    <p className={`text-xs ${
                      level.status === 'claimed' ? 'text-green-600' :
                      level.status === 'claimable' ? 'text-yellow-600' :
                      'text-gray-500'
                    }`}>
                      {level.status === 'claimed' ? 'Claimed' :
                       level.status === 'claimable' ? 'Ready!' :
                       'Locked'}
                    </p>
                  </div>
                </div>

                {level.status === 'locked' && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Progress: {level.combinedProgress}%</span>
                      <span>
                        {level.daysRemaining > 0 && `${level.daysRemaining}d `}
                        {level.referralsRemaining > 0 && `${level.referralsRemaining}r remaining`}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="h-1.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all"
                        style={{ width: `${level.combinedProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="bg-gray-50 p-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-purple-600">
              {allLevels.filter(l => l.status === 'claimed').length}
            </p>
            <p className="text-xs text-gray-600">Claimed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-600">
              {claimableLevelsCount}
            </p>
            <p className="text-xs text-gray-600">Available</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-400">
              {allLevels.filter(l => l.status === 'locked').length}
            </p>
            <p className="text-xs text-gray-600">Locked</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
