  import { useState, useEffect } from 'react';
  import { useSearchParams, useNavigate } from 'react-router-dom';
  import { useAuth } from '@/contexts/AuthContext';
  import Card from '@/components/common/Card';
  import Button from '@/components/common/Button';
  import { formatCurrency } from '@/utils/helpers';
  import toast from 'react-hot-toast';
  import { investmentService, UserInvestment } from '@/services/investmentApi';

  interface Member {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    joinedAt: string;
    isActive: boolean;
    referralCode: string;
    totalReferrals: number;
    commissionEarned: number;
  }

  interface Level {
    level: number;
    totalMembers: number;
    activeMembers: number;
    members: Member[];
    earnings: number;
  }

  interface NetworkData {
    investment: {
      id: string;
      planName: string;
      totalReferrals: number;
      currentLevel: number;
      investmentAmount: number;
      startDate: any;
      expiryDate: any;
      status: string;
    };
    levels: Level[];
    summary: {
      totalMembers: number;
      activeMembers: number;
      totalLevels: number;
      totalEarnings: number;
      referralEarnings: number;
    };
  }

  export default function Network() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [investments, setInvestments] = useState<UserInvestment[]>([]);
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [networkData, setNetworkData] = useState<NetworkData | null>(null);
    const [selectedLevel, setSelectedLevel] = useState<number>(1);
    const [viewMode, setViewMode] = useState<'overview' | 'tree' | 'members'>('tree');
    const [referralLink, setReferralLink] = useState('');
    const [loading, setLoading] = useState(true);
    const [showFullChainTree, setShowFullChainTree] = useState(false);
    const [chainTreeData, setChainTreeData] = useState<any>(null);
    const [loadingChainTree, setLoadingChainTree] = useState(false);
    const [selectedMember, setSelectedMember] = useState<any>(null);
    const [showMemberModal, setShowMemberModal] = useState(false);

    // Load user's investments
    useEffect(() => {
      const loadInvestments = async () => {
        try {
          setLoading(true);
          const data = await investmentService.getMyInvestments();
          const formattedData = data.map(investmentService.formatInvestmentForUI);
          console.log('📊 Network - Investments loaded:', formattedData);
          console.log('📊 Network - First investment myReferralCode:', formattedData[0]?.myReferralCode);
          setInvestments(formattedData);

          // Get planId from URL or use first active plan
          const planIdFromUrl = searchParams.get('planId');
          if (planIdFromUrl && formattedData.some(inv => inv.planId === planIdFromUrl)) {
            setSelectedPlanId(planIdFromUrl);
          } else if (formattedData.length > 0) {
            setSelectedPlanId(formattedData[0].planId);
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
        // Also load chain tree data immediately to check if user has upline/downline
        loadFullChainTree();
      }
    }, [selectedPlanId]);

    // Generate referral link (plan-specific)
    useEffect(() => {
      document.title = 'Network - WeNews';
      const baseUrl = window.location.origin;
      // Find selected investment to get purchaseReferralId
      const currentInvestment = investments.find(inv => inv.planId === selectedPlanId);
      const purchaseId = currentInvestment?.purchaseReferralId || '';
      if (purchaseId) {
        setReferralLink(`${baseUrl}/plans?ref=${purchaseId}`);
      } else {
        setReferralLink(`${baseUrl}/plans`);
      }
    }, [selectedPlanId, investments]);

    const loadNetworkData = async (planId: string) => {
      try {
        setLoading(true);
        const data = await investmentService.getInvestmentNetwork(planId);
        console.log('📊 Network data loaded:', data);
        console.log('📊 Levels:', data?.levels);
        console.log('📊 Summary:', data?.summary);
        setNetworkData(data);
      } catch (error) {
        console.error('Failed to load network data:', error);
        toast.error('Failed to load network data');
      } finally {
        setLoading(false);
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

    const loadFullChainTree = async () => {
      if (!selectedPlanId) return;
      
      try {
        setLoadingChainTree(true);
        const response = await investmentService.getChainTree(selectedPlanId);
        
        // Log detailed upline and downline structure to browser console
        console.log('=== REFERRAL CHAIN STRUCTURE ===');
        console.log('Plan:', response.planName);
        console.log('Max Levels:', response.maxLevels);
        console.log('\n📊 UPLINE (People above you):');
        if (response.upline && Object.keys(response.upline).length > 0) {
          console.table(response.upline);
          Object.keys(response.upline).sort((a, b) => {
            const levelA = parseInt(a.replace('C-', ''));
            const levelB = parseInt(b.replace('C-', ''));
            return levelB - levelA;
          }).forEach(level => {
            const members = response.upline[level];
            console.log(`\n${level}:`, members);
          });
        } else {
          console.log('No upline (You are at the top of the chain)');
        }
        
        console.log('\n📊 DOWNLINE (People you referred):');
        if (response.downline && Object.keys(response.downline).length > 0) {
          console.table(response.downline);
          Object.keys(response.downline).sort((a, b) => {
            const levelA = parseInt(a.replace('C', ''));
            const levelB = parseInt(b.replace('C', ''));
            return levelA - levelB;
          }).forEach(level => {
            const members = response.downline[level];
            console.log(`\n${level}: [${members.length} members]`, members);
          });
        } else {
          console.log('No downline (No referrals yet)');
        }
        
        console.log('\n📈 Summary:');
        console.log('Total Upline Members:', response.totalUplineMembers || 0);
        console.log('Total Downline Members:', response.totalDownlineMembers || 0);
        console.log('Total Chain Members:', (response.totalUplineMembers || 0) + (response.totalDownlineMembers || 0));
        console.log('===========================\n');
        
        setChainTreeData(response);
        setShowFullChainTree(true);
      } catch (error) {
        console.error('Failed to load chain tree:', error);
        toast.error('Failed to load full chain tree');
      } finally {
        setLoadingChainTree(false);
      }
    };

    const selectedLevelData = networkData?.levels?.find(l => l.level === selectedLevel);
    const selectedInvestment = investments.find(inv => inv.planId === selectedPlanId);
    
    // Debug log
    console.log('📊 Network - ALL investments:', investments);
    console.log('📊 Network - selectedPlanId:', selectedPlanId);
    console.log('📊 Network - selectedInvestment:', selectedInvestment);
    console.log('📊 Network - myReferralCode:', selectedInvestment?.myReferralCode);
    console.log('📊 Network - purchaseReferralId:', selectedInvestment?.purchaseReferralId);

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

    // Don't show error if still loading
    if (!loading && (!networkData || !selectedInvestment)) {
      return (
        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-muted-foreground">Failed to load network data</p>
          </div>
        </div>
      );
    }

    // Still loading networkData after investments are loaded
    if (!networkData) {
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
                  <option key={investment.id} value={investment.planId}>
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
            background: `linear-gradient(135deg, ${selectedInvestment?.color || '#3B82F6'}dd, ${selectedInvestment?.color || '#3B82F6'}aa)` 
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">{networkData?.investment?.planName || selectedInvestment?.planName || 'My'} Network</h2>
            <div className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
              {networkData?.investment?.status || 'Active'}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{networkData?.summary?.totalMembers || 0}</div>
              <div className="text-white/80 text-sm mt-1">Total Network</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{networkData?.levels?.length > 0 ? networkData.levels[0].totalMembers : 0}</div>
              <div className="text-white/80 text-sm mt-1">Direct Referrals (Level 1)</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{networkData?.summary?.activeMembers || 0}</div>
              <div className="text-white/80 text-sm mt-1">Active Members</div>
            </div>
          </div>
        </div>

        {/* Referral Link Card (Plan-Specific) */}
        {selectedInvestment?.purchaseReferralId && (
          <Card className="mb-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
            <h3 className="text-lg font-semibold mb-3">🎯 Your Referral for {selectedInvestment.planName}</h3>
            
            {/* Short Referral Code - Prominent Display */}
            {selectedInvestment.myReferralCode && (
              <div className="mb-4 p-4 bg-white rounded-lg border-2 border-green-300">
                <div className="text-sm text-gray-600 mb-1">Your Referral Code:</div>
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-bold text-green-600 tracking-wider">
                    {selectedInvestment.myReferralCode}
                  </div>
                  <Button
                    onClick={() => {
                      if (selectedInvestment.myReferralCode) {
                        navigator.clipboard.writeText(selectedInvestment.myReferralCode);
                        toast.success('Referral code copied!');
                      }
                    }}
                    size="sm"
                    variant="outline"
                  >
                    📋 Copy Code
                  </Button>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  ✨ Share this code with friends! They can enter it during purchase.
                </div>
              </div>
            )}
            
            {/* Referral Link */}
            <div className="text-sm text-gray-600 mb-2">Or share your referral link:</div>
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
        )}

        {/* Earnings Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Network Earnings</h3>
            <div className="space-y-4">
              <div>
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(networkData?.summary?.referralEarnings || 0)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Referral Earnings</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(networkData?.summary?.totalEarnings || 0)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Total Earnings (Plan)</div>
              </div>
              <div className="text-sm text-muted-foreground">
                Active Levels: {networkData?.summary?.totalLevels || 0}
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

        {/* No Referrals Notice */}
        {(!networkData?.levels || networkData.levels.length === 0) && (
          <Card className="mb-6 p-6 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <div className="text-2xl">👥</div>
              <div>
                <h3 className="font-semibold mb-1">Build Your Network</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  You haven't referred anyone yet. Share your referral link below to start building your network and earning commissions!
                </p>
                <p className="text-xs text-muted-foreground">
                  💡 Tip: Each person you refer becomes a Level 1 member in your network.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* View Mode Toggle */}
        {((networkData.levels && networkData.levels.length > 0) || (chainTreeData && (chainTreeData.upline || chainTreeData.downline))) && (
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
            <h3 className="text-xl font-semibold mb-4">Level Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {networkData.levels.map((level) => (
                <div
                  key={level.level}
                  onClick={() => {
                    setSelectedLevel(level.level);
                    setViewMode('members');
                  }}
                >
                  <Card
                    className={`p-4 cursor-pointer transition-all border-2 border-green-500 hover:shadow-lg ${
                      selectedLevel === level.level ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-bold">Level {level.level}</h4>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center bg-green-500">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground mb-3">
                    {level.activeMembers} active / {level.totalMembers} total
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{level.totalMembers}</div>
                      <div className="text-xs text-muted-foreground">Members</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{formatCurrency(level.earnings)}</div>
                      <div className="text-xs text-muted-foreground">Earnings</div>
                    </div>
                  </div>

                  {level.totalMembers > 0 && (
                    <div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{
                            width: `${(level.activeMembers / level.totalMembers) * 100}%`
                          }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 text-center">
                        {Math.round((level.activeMembers / level.totalMembers) * 100)}% active
                      </div>
                    </div>
                  )}
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'tree' && chainTreeData && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{chainTreeData.maxLevels}</div>
                  <div className="text-xs text-gray-600">Max Levels ({chainTreeData.planName})</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{chainTreeData.totalUplineMembers || 0}</div>
                  <div className="text-xs text-gray-600">Upline Members</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{chainTreeData.totalDownlineMembers || 0}</div>
                  <div className="text-xs text-gray-600">Downline Members</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {(chainTreeData.totalUplineMembers || 0) + (chainTreeData.totalDownlineMembers || 0)}
                  </div>
                  <div className="text-xs text-gray-600">Total Chain</div>
                </div>
              </div>
            </div>

            {/* Visual Tree Structure */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-6">Network Tree Structure</h3>
              <div className="flex flex-col items-center space-y-8">
                
                {/* Upline Members (People above you) */}
                {chainTreeData?.upline && Object.keys(chainTreeData.upline).length > 0 && (
                  <>
                    {Object.keys(chainTreeData.upline).sort((a, b) => {
                      const levelA = parseInt(a.replace('C-', ''));
                      const levelB = parseInt(b.replace('C-', ''));
                      return levelB - levelA; // Sort from top (C-2, C-1)
                    }).map((chainLevel) => {
                      const members = chainTreeData.upline[chainLevel];
                      return (
                        <div key={chainLevel} className="flex flex-col items-center">
                          <div className="text-sm font-semibold text-purple-600 mb-3">
                            Upline {chainLevel} ({members.length} member{members.length !== 1 ? 's' : ''})
                          </div>
                          <div className="flex flex-wrap justify-center gap-4">
                            {members.map((member: any, i: number) => (
                              <div
                                key={member.userId || i}
                                className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => {
                                  setSelectedMember(member);
                                  setShowMemberModal(true);
                                }}
                              >
                                <div className="w-14 h-14 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-xs shadow-md">
                                  {((member.firstName?.[0] || '') + (member.lastName?.[0] || '')).toUpperCase() || member.username.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="text-xs mt-1 text-center max-w-[120px]">
                                  <div className="font-semibold text-gray-900">
                                    {member.firstName || ''} {member.lastName || ''}
                                  </div>
                                  <div className="text-purple-600">
                                    @{member.username}
                                  </div>
                                  <div className="text-gray-500 truncate">
                                    {member.email}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                {/* Root Node (You) */}
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                    You
                  </div>
                  <div className="text-sm font-medium mt-2">{user?.firstName} {user?.lastName}</div>
                </div>

                {/* Downline Levels */}
                {chainTreeData?.downline && Object.keys(chainTreeData.downline).length > 0 && (
                  <>
                    {Object.keys(chainTreeData.downline).sort((a, b) => {
                      const levelA = parseInt(a.replace('C', ''));
                      const levelB = parseInt(b.replace('C', ''));
                      return levelA - levelB; // Sort C1, C2, C3...
                    }).map((chainLevel) => {
                      const members = chainTreeData.downline[chainLevel];
                      if (!members || members.length === 0) return null;
                      
                      return (
                        <div key={chainLevel} className="flex flex-col items-center">
                          <div className="text-sm font-semibold text-green-600 mb-3">
                            Level {chainLevel.replace('C', '')} ({members.length} member{members.length !== 1 ? 's' : ''})
                          </div>
                          <div className="flex flex-wrap justify-center gap-4">
                            {members.slice(0, 10).map((member: any, i: number) => (
                              <div
                                key={member.userId || i}
                                className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => {
                                  setSelectedMember(member);
                                  setShowMemberModal(true);
                                }}
                              >
                                <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xs shadow-md">
                                  {((member.firstName?.[0] || '') + (member.lastName?.[0] || '')).toUpperCase() || member.username.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="text-xs mt-1 text-center max-w-[100px]">
                                  <div className="font-semibold text-gray-900 truncate">
                                    {member.firstName || ''} {member.lastName || ''}
                                  </div>
                                  <div className="text-green-600">
                                    @{member.username}
                                  </div>
                                  <div className="text-gray-500 truncate">
                                    {member.email}
                                  </div>
                                </div>
                              </div>
                            ))}
                            {members.length > 10 && (
                              <div className="w-12 h-12 rounded-full bg-gray-400 text-white flex items-center justify-center font-bold text-xs">
                                +{members.length - 10}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </Card>

            {/* Upline Section - Detailed Cards */}
            {chainTreeData.upline && Object.keys(chainTreeData.upline).length > 0 && (
              <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
                <h3 className="text-lg font-bold text-blue-700 mb-3">⬆️ Your Upline Chain</h3>
                
                {Object.keys(chainTreeData.upline).sort((a, b) => {
                  const aNum = parseInt(a.replace('C-', ''));
                  const bNum = parseInt(b.replace('C-', ''));
                  return bNum - aNum;
                }).map((chainLevel) => {
                  const members = chainTreeData.upline[chainLevel];
                  if (!members || members.length === 0) return null;

                  return (
                    <div key={chainLevel} className="mb-3 bg-white rounded-lg p-3">
                      <h4 className="font-semibold text-blue-600 mb-2">
                        {chainLevel} ({members.length} member{members.length > 1 ? 's' : ''})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {members.map((member: any, index: number) => (
                          <div 
                            key={index} 
                            className="bg-blue-50 rounded p-2 text-sm border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
                            onClick={() => {
                              setSelectedMember(member);
                              setShowMemberModal(true);
                            }}
                          >
                            <div className="font-semibold text-gray-900">
                              {member.firstName} {member.lastName}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              @{member.username}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Current User Indicator */}
            <div className="text-center py-3">
              <div className="inline-block bg-yellow-100 border-2 border-yellow-400 rounded-lg px-6 py-2">
                <div className="text-sm font-semibold text-yellow-800">👤 YOU (Level 0)</div>
                <div className="text-xs text-yellow-700">@{user?.username}</div>
              </div>
            </div>

            {/* Downline Section - Detailed Cards */}
            {chainTreeData.downline && Object.keys(chainTreeData.downline).length > 0 && (
              <div className="border-2 border-green-300 rounded-lg p-4 bg-green-50">
                <h3 className="text-lg font-bold text-green-700 mb-3">⬇️ Your Downline Chain</h3>
                
                {Object.keys(chainTreeData.downline).sort((a, b) => {
                  const aNum = parseInt(a.replace('C', ''));
                  const bNum = parseInt(b.replace('C', ''));
                  return aNum - bNum;
                }).map((chainLevel) => {
                  const members = chainTreeData.downline[chainLevel];
                  if (!members || members.length === 0) return null;

                  return (
                    <div key={chainLevel} className="mb-3 bg-white rounded-lg p-3">
                      <h4 className="font-semibold text-green-600 mb-2">
                        {chainLevel} - Chain Level {chainLevel.replace('C', '')} ({members.length} member{members.length > 1 ? 's' : ''})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {members.map((member: any, index: number) => (
                          <div 
                            key={index} 
                            className="bg-green-50 rounded p-2 text-sm border border-green-200 cursor-pointer hover:bg-green-100 transition-colors"
                            onClick={() => {
                              setSelectedMember(member);
                              setShowMemberModal(true);
                            }}
                          >
                            <div className="font-semibold text-gray-900">
                              {member.firstName} {member.lastName}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              @{member.username}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Empty state */}
            {(!chainTreeData.upline || Object.keys(chainTreeData.upline).length === 0) &&
            (!chainTreeData.downline || Object.keys(chainTreeData.downline).length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🌱</div>
                <p>No chain members yet. Start referring to build your network!</p>
              </div>
            )}
          </div>
        )}

        {viewMode === 'members' && selectedLevelData && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">
                Level {selectedLevel} Members ({selectedLevelData.totalMembers})
              </h3>
              <div className="flex gap-2">
                {networkData.levels.map((level) => (
                  level.totalMembers > 0 && (
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
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm">
                      {member.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{member.firstName} {member.lastName}</div>
                      <div className="text-xs text-muted-foreground">
                        @{member.username}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs mb-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Joined:</span>
                      <span className="font-medium">{formatDate(member.joinedAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Referrals:</span>
                      <span className="font-medium">{member.totalReferrals}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      member.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {member.isActive ? 'Active' : 'Inactive'}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{formatCurrency(member.commissionEarned)}</div>
                      <div className="text-xs text-muted-foreground">Commission</div>
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

        {/* Member Profile Modal */}
        {showMemberModal && selectedMember && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowMemberModal(false)}
          >
            <div 
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowMemberModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
              
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-3xl mx-auto shadow-lg mb-4">
                  {((selectedMember.firstName?.[0] || '') + (selectedMember.lastName?.[0] || '')).toUpperCase() || selectedMember.username.substring(0, 2).toUpperCase()}
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedMember.firstName || 'N/A'} {selectedMember.lastName || 'N/A'}
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-blue-600 text-xl">👤</div>
                  <div>
                    <div className="text-xs text-gray-500">Username</div>
                    <div className="font-medium text-gray-900">@{selectedMember.username}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-green-600 text-xl">📧</div>
                  <div>
                    <div className="text-xs text-gray-500">Email</div>
                    <div className="font-medium text-gray-900 break-all">{selectedMember.email || 'N/A'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-purple-600 text-xl">📱</div>
                  <div>
                    <div className="text-xs text-gray-500">Phone Number</div>
                    <div className="font-medium text-gray-900">{selectedMember.phoneNumber || 'N/A'}</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowMemberModal(false)}
                className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
