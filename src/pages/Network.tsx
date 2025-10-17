import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { formatCurrency } from '@/utils/helpers';
import toast from 'react-hot-toast';
import { investmentService, UserInvestment } from '@/services/investmentApi';

interface Level {
  level: number;
  unlocked: boolean;
  unlockDate: string | null;
  requirement: number;
  current: number;
  commission: number;
  members: Member[];
}

interface Member {
  id: string;
  name: string;
  joinDate: string;
  status: 'Active' | 'Inactive';
  earnings: number;
}

interface NetworkData {
  planName: string;
  planColor: string;
  totalNetworkSize: number;
  directReferrals: number;
  activeThisMonth: number;
  totalEarnings: number;
  monthlyEarnings: number;
  levels: Level[];
}

export default function Network() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [investments, setInvestments] = useState<UserInvestment[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [networkData, setNetworkData] = useState<NetworkData | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'overview' | 'tree' | 'members'>('overview');
  const [referralLink, setReferralLink] = useState('');
  const [loading, setLoading] = useState(true);

  // Load user's investments
  useEffect(() => {
    const loadInvestments = async () => {
      try {
        setLoading(true);
        const data = await investmentService.getMyInvestments();
        const formattedData = data.map(investmentService.formatInvestmentForUI);
        setInvestments(formattedData);

        // Get planId from URL or use first active plan
        const planIdFromUrl = searchParams.get('planId');
        if (planIdFromUrl && formattedData.some(inv => inv.id === planIdFromUrl)) {
          setSelectedPlanId(planIdFromUrl);
        } else if (formattedData.length > 0) {
          setSelectedPlanId(formattedData[0].id);
        }
      } catch (error) {
        console.error('Failed to load investments:', error);
        toast.error('Failed to load your plans');
      } finally {
        setLoading(false);
      }
    };

    loadInvestments();
  }, []);

  // Update URL when plan selection changes
  useEffect(() => {
    if (selectedPlanId) {
      setSearchParams({ planId: selectedPlanId });
      loadNetworkData(selectedPlanId);
    }
  }, [selectedPlanId]);

  // Generate referral link
  useEffect(() => {
    document.title = 'Network - WeNews';
    const baseUrl = window.location.origin;
    const code = user?.referralCode || user?.username || 'USER123';
    setReferralLink(`${baseUrl}/auth/signup?ref=${code}`);
  }, [user]);

  const loadNetworkData = async (planId: string) => {
    try {
      // TODO: Replace with actual API call to get plan-specific network data
      // const response = await fetch(`/api/investment/${planId}/network`);
      // const data = await response.json();
      
      // For now, use investment data to populate network stats
      const investment = investments.find(inv => inv.id === planId);
      if (!investment) return;

      // Mock network structure - replace with actual API data
      const mockData: NetworkData = {
        planName: investment.planName,
        planColor: investment.color || '#3B82F6',
        totalNetworkSize: investment.totalReferrals || 0,
        directReferrals: investment.directReferrals || 0,
        activeThisMonth: investment.activeReferrals || 0,
        totalEarnings: investment.referralEarnings || 0,
        monthlyEarnings: 0, // TODO: Get from API
        levels: [] // TODO: Get from API
      };

      setNetworkData(mockData);
    } catch (error) {
      console.error('Failed to load network data:', error);
      toast.error('Failed to load network data');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied to clipboard!');
  };

  const shareReferralLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join WeNews',
        text: 'Join WeNews and start earning today!',
        url: referralLink,
      }).catch(() => {
        copyReferralLink();
      });
    } else {
      copyReferralLink();
    }
  };

  const selectedLevelData = networkData?.levels.find(l => l.level === selectedLevel);
  const selectedInvestment = investments.find(inv => inv.id === selectedPlanId);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading network data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (investments.length === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-6">My Network</h1>
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-2">No Active Plans</h3>
          <p className="text-muted-foreground mb-6">
            Subscribe to a plan to start building your network and earning referral commissions.
          </p>
          <Button onClick={() => navigate('/plans')} className="bg-blue-600 hover:bg-blue-700">
            View Available Plans
          </Button>
        </Card>
      </div>
    );
  }

  if (!networkData || !selectedInvestment) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Failed to load network data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-foreground">My Network</h1>
        
        {/* Plan Selector */}
        {investments.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Select Plan:</span>
            <select
              value={selectedPlanId || ''}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-background text-sm font-medium"
            >
              {investments.map((investment) => (
                <option key={investment.id} value={investment.id}>
                  {investment.planName} - {investment.status}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Network Overview Header */}
      <div 
        className="mb-6 p-6 rounded-xl text-white"
        style={{ 
          background: `linear-gradient(135deg, ${networkData.planColor}dd, ${networkData.planColor}aa)` 
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{networkData.planName} Network</h2>
          <div className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
            {selectedInvestment.status}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold">{networkData.totalNetworkSize}</div>
            <div className="text-white/80 text-sm mt-1">Total Network</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{networkData.directReferrals}</div>
            <div className="text-white/80 text-sm mt-1">Direct Referrals</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{networkData.activeThisMonth}</div>
            <div className="text-white/80 text-sm mt-1">Active Members</div>
          </div>
        </div>
      </div>

      {/* Referral Link Card */}
      <Card className="mb-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
        <h3 className="text-lg font-semibold mb-3">Your Referral Link</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 px-4 py-2 border border-border rounded-lg bg-white text-sm"
          />
          <Button onClick={copyReferralLink} variant="outline">
            📋 Copy
          </Button>
          <Button onClick={shareReferralLink} className="bg-green-600 hover:bg-green-700">
            🔗 Share
          </Button>
        </div>
      </Card>

      {/* Earnings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Network Earnings</h3>
          <div className="space-y-4">
            <div>
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(networkData.totalEarnings)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Total Earnings</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(networkData.monthlyEarnings)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">This Month</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50">
          <h3 className="text-lg font-semibold mb-4">Referral Rewards</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Level 1 Commission:</span>
              <span className="font-bold">₹300</span>
            </div>
            <div className="flex justify-between">
              <span>Level 2 Commission:</span>
              <span className="font-bold">₹150</span>
            </div>
            <div className="flex justify-between">
              <span>Level 3 Commission:</span>
              <span className="font-bold">₹75</span>
            </div>
            <div className="pt-2 border-t border-orange-200">
              <div className="text-xs text-muted-foreground">
                Earn commission from up to 5 levels deep!
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* API Integration Notice */}
      {(!networkData.levels || networkData.levels.length === 0) && (
        <Card className="mb-6 p-6 bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <div className="text-2xl">ℹ️</div>
            <div>
              <h3 className="font-semibold mb-1">Network Levels Coming Soon</h3>
              <p className="text-sm text-muted-foreground">
                Detailed level-wise network breakdown and member listings will be available once the backend API integration is complete.
                Currently showing aggregate network statistics for this plan.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* View Mode Toggle */}
      {networkData.levels && networkData.levels.length > 0 && (
        <>
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setViewMode('overview')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'tree'
                  ? 'bg-blue-600 text-white'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              Tree View
            </button>
            <button
              onClick={() => setViewMode('members')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'members'
                  ? 'bg-blue-600 text-white'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              Members
            </button>
          </div>

          {/* Content based on view mode */}
          {viewMode === 'overview' && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Level Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {networkData.levels.map((level) => (
              <div
                key={level.level}
                onClick={() => {
                  if (level.unlocked) {
                    setSelectedLevel(level.level);
                    setViewMode('members');
                  }
                }}
              >
                <Card
                  className={`p-4 cursor-pointer transition-all ${
                    level.unlocked
                      ? 'border-2 border-green-500 hover:shadow-lg'
                      : 'border-2 border-gray-300 opacity-60'
                  } ${selectedLevel === level.level ? 'ring-2 ring-blue-500' : ''}`}
                >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-bold">Level {level.level}</h4>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    level.unlocked ? 'bg-green-500' : 'bg-gray-400'
                  }`}>
                    <span className="text-white text-xs">
                      {level.unlocked ? '✓' : '🔒'}
                    </span>
                  </div>
                </div>

                {level.unlocked ? (
                  <div className="text-xs text-muted-foreground mb-3">
                    Unlocked: {formatDate(level.unlockDate!)}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground mb-3">
                    Requires: {level.requirement} members
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{level.current}</div>
                    <div className="text-xs text-muted-foreground">Members</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">₹{level.commission}</div>
                    <div className="text-xs text-muted-foreground">Commission</div>
                  </div>
                </div>

                {level.unlocked && level.current > 0 && (
                  <div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{
                          width: `${Math.min((level.current / level.requirement) * 100, 100)}%`
                        }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 text-center">
                      {level.current}/{level.requirement} completed
                    </div>
                  </div>
                )}
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'tree' && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-6">Network Tree Structure</h3>
          <div className="flex flex-col items-center space-y-8">
            {/* Root Node (You) */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                You
              </div>
              <div className="text-sm font-medium mt-2">{user?.firstName} {user?.lastName}</div>
            </div>

            {/* Level Branches */}
            {networkData.levels
              .filter(l => l.unlocked && l.current > 0)
              .map((level) => (
                <div key={level.level} className="flex flex-col items-center">
                  <div className="text-sm font-semibold text-muted-foreground mb-3">
                    Level {level.level} ({level.current} members)
                  </div>
                  <div className="flex flex-wrap justify-center gap-4">
                    {Array.from({ length: Math.min(level.current, 10) }, (_, i) => (
                      <div
                        key={i}
                        className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm shadow-md"
                      >
                        {i + 1}
                      </div>
                    ))}
                    {level.current > 10 && (
                      <div className="w-12 h-12 rounded-full bg-gray-400 text-white flex items-center justify-center font-bold text-xs">
                        +{level.current - 10}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}

      {viewMode === 'members' && selectedLevelData && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">
              Level {selectedLevel} Members ({selectedLevelData.current})
            </h3>
            <div className="flex gap-2">
              {networkData.levels.map((level) => (
                level.unlocked && level.current > 0 && (
                  <button
                    key={level.level}
                    onClick={() => setSelectedLevel(level.level)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedLevel === level.level
                        ? 'bg-blue-600 text-white'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    L{level.level}
                  </button>
                )
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedLevelData.members.map((member) => (
              <Card key={member.id} className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{member.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Joined: {formatDate(member.joinDate)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    member.status === 'Active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {member.status}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">₹{member.earnings}</div>
                    <div className="text-xs text-muted-foreground">Earned</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {selectedLevelData.members.length === 0 && (
            <Card className="p-8 text-center">
              <div className="text-4xl mb-3">👥</div>
              <p className="text-muted-foreground">No members in this level yet</p>
            </Card>
          )}
        </div>
      )}
        </>
      )}
    </div>
  );
}
