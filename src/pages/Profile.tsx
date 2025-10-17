import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext';
import Card from '@/components/common/Card';
import { formatCurrency } from '@/utils/helpers';
import toast from 'react-hot-toast';
import { useState } from 'react';

interface MenuItemProps {
  title: string;
  icon: string;
  onClick: () => void;
  isLogout?: boolean;
}

const MenuItem = ({ title, icon, onClick, isLogout = false }: MenuItemProps) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center justify-between w-full p-4 rounded-lg
        transition-all duration-200 hover:bg-muted/50
        ${isLogout ? 'text-red-600 hover:bg-red-50' : ''}
      `}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <span className={`font-medium ${isLogout ? 'text-red-600' : ''}`}>{title}</span>
      </div>
      <svg
        className="w-5 h-5 text-muted-foreground"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path d="M9 5l7 7-7 7"></path>
      </svg>
    </button>
  );
};

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { wallet } = useWallet();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // DEBUG: Log user data
  console.log('🔍 Profile Page - User from useAuth():', user);
  console.log('🔍 Profile Page - User firstName:', user?.firstName);
  console.log('🔍 Profile Page - User lastName:', user?.lastName);

  const getUserInitials = () => {
    if (!user) return 'U';
    const firstInitial = user.firstName?.[0] || '';
    const lastInitial = user.lastName?.[0] || '';
    return (firstInitial + lastInitial).toUpperCase() || user.username?.[0]?.toUpperCase() || 'U';
  };

  const getUserDisplayName = () => {
    if (!user) return 'User';
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username || user.email || 'User';
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    toast.loading('Logging out...', { id: 'logout' });
    
    try {
      logout();
      toast.success('Logged out successfully', { id: 'logout' });
      navigate('/auth/signin');
    } catch (error) {
      toast.error('Failed to logout', { id: 'logout' });
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-6">Profile</h1>

      {/* Profile Header Card */}
      <Card className="mb-6 p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
            <span className="text-3xl font-bold">{getUserInitials()}</span>
          </div>
          
          {/* User Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1">{getUserDisplayName()}</h2>
            <p className="text-white/80 text-sm mb-2">{user?.email}</p>
            <button
              onClick={() => navigate('/edit-profile')}
              className="inline-flex items-center gap-1 text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
            >
              <span>View Profile</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Balance */}
          <div className="text-right">
            <p className="text-white/80 text-sm mb-1">Wallet Balance</p>
            <p className="text-2xl font-bold">{formatCurrency(wallet?.balance || 0)}</p>
          </div>
        </div>
      </Card>

      {/* Earnings & Plans Section */}
      <Card className="mb-4 p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Earnings & Plans</h3>
        <div className="space-y-2">
          <MenuItem title="My Wallet" icon="💰" onClick={() => navigate('/wallet')} />
          <MenuItem title="My Earnings" icon="📈" onClick={() => toast('Coming soon!', { icon: 'ℹ️' })} />
          <MenuItem title="My Plans" icon="💳" onClick={() => navigate('/plans')} />
          <MenuItem title="My Withdrawals" icon="💸" onClick={() => navigate('/withdrawals')} />
        </div>
      </Card>

      {/* Achievements Section */}
      <Card className="mb-4 p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Achievements</h3>
        <div className="space-y-2">
          <MenuItem title="My Labels" icon="🏷️" onClick={() => toast('Coming soon!', { icon: 'ℹ️' })} />
          <MenuItem title="Rewards & Badges" icon="🎖️" onClick={() => toast('Coming soon!', { icon: 'ℹ️' })} />
        </div>
      </Card>

      {/* Community Section */}
      <Card className="mb-4 p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Community</h3>
        <div className="space-y-2">
          <MenuItem title="My Network" icon="👥" onClick={() => navigate('/network')} />
          <MenuItem title="Community Feed" icon="🌐" onClick={() => toast('Coming soon!', { icon: 'ℹ️' })} />
          <MenuItem title="Community Benefits" icon="🎁" onClick={() => toast('Coming soon!', { icon: 'ℹ️' })} />
        </div>
      </Card>

      {/* Other Section */}
      <Card className="mb-4 p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Other</h3>
        <div className="space-y-2">
          <MenuItem title="Refer & Earn" icon="🔗" onClick={() => navigate('/network')} />
          <MenuItem title="Help & Support" icon="❓" onClick={() => toast('Contact: support@wenews.com', { icon: 'ℹ️', duration: 5000 })} />
          <MenuItem title="Settings" icon="⚙️" onClick={() => navigate('/settings')} />
          <MenuItem 
            title="Logout" 
            icon="🚪" 
            onClick={handleLogout} 
            isLogout 
          />
        </div>
      </Card>
    </div>
  );
}
