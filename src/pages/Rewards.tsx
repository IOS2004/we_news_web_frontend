import { useState, useEffect } from 'react';
import {
  Award,
  Gift,
  Trophy,
  Star,
  TrendingUp,
  Zap,
  Crown,
  Lock,
  Check,
  Coins,
  Calendar,
  Users,
  Activity
} from 'lucide-react';
import { rewardsApi, Reward, Achievement, UserPoints, RewardsStats } from '../services/rewardsApi';

type TabType = 'rewards' | 'achievements' | 'leaderboard';

const Rewards = () => {
  const [activeTab, setActiveTab] = useState<TabType>('rewards');
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [points, setPoints] = useState<UserPoints | null>(null);
  const [stats, setStats] = useState<RewardsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [dailyBonus, setDailyBonus] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadPoints(),
        loadStats(),
        activeTab === 'rewards' && loadRewards(),
        activeTab === 'achievements' && loadAchievements(),
        loadDailyBonus(),
      ].filter(Boolean));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPoints = async () => {
    try {
      const data = await rewardsApi.getPoints();
      setPoints(data);
    } catch (error) {
      console.error('Error loading points:', error);
    }
  };

  const loadStats = async () => {
    try {
      const data = await rewardsApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadRewards = async () => {
    try {
      const filters = selectedFilter !== 'all' ? { type: selectedFilter } : {};
      const data = await rewardsApi.getRewards(filters);
      setRewards(data);
    } catch (error) {
      console.error('Error loading rewards:', error);
    }
  };

  const loadAchievements = async () => {
    try {
      const filters = selectedFilter !== 'all' ? { category: selectedFilter } : {};
      const data = await rewardsApi.getAchievements(filters);
      setAchievements(data);
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const loadDailyBonus = async () => {
    try {
      const data = await rewardsApi.getDailyBonus();
      setDailyBonus(data);
    } catch (error) {
      console.error('Error loading daily bonus:', error);
    }
  };

  const handleRedeemReward = async (rewardId: string) => {
    try {
      await rewardsApi.redeemReward(rewardId);
      loadPoints();
      loadRewards();
    } catch (error) {
      console.error('Error redeeming reward:', error);
    }
  };

  const handleClaimDailyBonus = async () => {
    try {
      await rewardsApi.claimDailyBonus();
      loadPoints();
      loadDailyBonus();
    } catch (error) {
      console.error('Error claiming daily bonus:', error);
    }
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'subscription':
        return Star;
      case 'voucher':
        return Gift;
      case 'badge':
        return Award;
      case 'cash':
        return Coins;
      case 'bonus':
        return Zap;
      default:
        return Gift;
    }
  };

  const getAchievementIcon = (category: string) => {
    switch (category) {
      case 'trading':
        return TrendingUp;
      case 'referral':
        return Users;
      case 'earnings':
        return Coins;
      case 'engagement':
        return Activity;
      case 'milestone':
        return Trophy;
      default:
        return Award;
    }
  };

  // Reward Card Component
  const RewardCard = ({ reward }: { reward: Reward }) => {
    const Icon = getRewardIcon(reward.type);
    const canAfford = points && points.availablePoints >= reward.pointsRequired;

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative h-40 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <Icon className="w-16 h-16 text-white" />
          {reward.stock !== undefined && reward.stock < 10 && (
            <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs">
              Only {reward.stock} left
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1">{reward.name}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{reward.description}</p>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-1 text-lg font-bold text-blue-600">
              <Coins className="w-5 h-5" />
              {reward.pointsRequired}
            </div>
            <button
              onClick={() => handleRedeemReward(reward._id)}
              disabled={!canAfford || (reward.stock !== undefined && reward.stock === 0)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              {!canAfford ? 'Not Enough Points' : reward.stock === 0 ? 'Out of Stock' : 'Redeem'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Achievement Card Component
  const AchievementCard = ({ achievement }: { achievement: Achievement }) => {
    const Icon = getAchievementIcon(achievement.category);
    const progress = achievement.progress || 0;
    const target = achievement.requirement.target;
    const progressPercentage = Math.min((progress / target) * 100, 100);

    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${
        achievement.isUnlocked ? 'border-green-500' : ''
      }`}>
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            achievement.isUnlocked
              ? 'bg-gradient-to-br from-green-400 to-green-600'
              : 'bg-gray-200'
          }`}>
            {achievement.isUnlocked ? (
              <Icon className="w-8 h-8 text-white" />
            ) : (
              <Lock className="w-8 h-8 text-gray-400" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900">{achievement.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
              </div>
              {achievement.isUnlocked && (
                <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Unlocked
                </div>
              )}
            </div>

            {!achievement.isUnlocked && (
              <div className="mt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{progress} / {target}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}

            <div className="mt-3 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-blue-600 font-medium">
                <Coins className="w-4 h-4" />
                +{achievement.points} points
              </div>
              {achievement.isUnlocked && achievement.unlockedAt && (
                <div className="text-gray-500 text-xs">
                  Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rewards & Achievements</h1>
          <p className="text-gray-600 mt-1">Earn points and unlock achievements</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-6 py-3 rounded-lg text-white">
            <div className="text-sm opacity-90">Available Points</div>
            <div className="text-2xl font-bold flex items-center gap-2">
              <Coins className="w-6 h-6" />
              {points?.availablePoints || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Daily Bonus */}
      {dailyBonus && dailyBonus.available && (
        <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Daily Bonus Available!</h3>
                <p className="text-white text-opacity-90">
                  Claim your daily bonus: +{dailyBonus.points} points
                </p>
                {dailyBonus.streak > 0 && (
                  <p className="text-sm mt-1">🔥 {dailyBonus.streak} day streak!</p>
                )}
              </div>
            </div>
            <button
              onClick={handleClaimDailyBonus}
              className="px-6 py-3 bg-white text-orange-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Claim Now
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Earned</div>
                <div className="text-xl font-bold text-gray-900">{stats.totalPointsEarned}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Achievements</div>
                <div className="text-xl font-bold text-gray-900">
                  {stats.achievementsUnlocked}/{stats.totalAchievements}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Gift className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Rewards Redeemed</div>
                <div className="text-xl font-bold text-gray-900">{stats.rewardsRedeemed}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Rank</div>
                <div className="text-xl font-bold text-gray-900">{stats.rank || 'Novice'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('rewards')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'rewards'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Gift className="w-5 h-5" />
              Rewards
            </div>
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'achievements'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5" />
              Achievements
            </div>
          </button>
        </div>

        <div className="p-6">
          {/* Rewards Tab */}
          {activeTab === 'rewards' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex gap-2 flex-wrap">
                {['all', 'subscription', 'voucher', 'badge', 'cash', 'bonus'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      setSelectedFilter(filter);
                      loadRewards();
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedFilter === filter
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>

              {/* Rewards Grid */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading rewards...</p>
                </div>
              ) : rewards.length === 0 ? (
                <div className="text-center py-12">
                  <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No rewards available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {rewards.map((reward) => (
                    <RewardCard key={reward._id} reward={reward} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex gap-2 flex-wrap">
                {['all', 'trading', 'referral', 'earnings', 'engagement', 'milestone'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      setSelectedFilter(filter);
                      loadAchievements();
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedFilter === filter
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>

              {/* Achievements List */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading achievements...</p>
                </div>
              ) : achievements.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No achievements found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {achievements.map((achievement) => (
                    <AchievementCard key={achievement._id} achievement={achievement} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rewards;
