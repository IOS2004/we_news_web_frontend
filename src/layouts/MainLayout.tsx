import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext';
import { formatCurrency } from '@/utils/helpers';
import { 
  Home, 
  Newspaper, 
  Wallet, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  User,
  ArrowDownToLine,
  PlusCircle,
  DollarSign,
  ShoppingBag,
  Gift,
  BarChart3,
  Palette,
  Hash
} from 'lucide-react';
import { useState } from 'react';

export default function MainLayout() {
  const { user, logout } = useAuth();
  const { wallet } = useWallet();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', to: '/dashboard', icon: Home },
    { name: 'News', to: '/news', icon: Newspaper },
    { name: 'Color Trading', to: '/trading', icon: Palette },
    { name: 'Number Trading', to: '/number-trading', icon: Hash },
    { name: 'My Trades', to: '/trading/history', icon: BarChart3 },
    { name: 'Wallet', to: '/wallet', icon: Wallet },
    { name: 'Add Money', to: '/add-money', icon: PlusCircle },
    { name: 'Buy Plans', to: '/plans', icon: ShoppingBag },
    { name: 'Earnings', to: '/earnings', icon: DollarSign },
    { name: 'Redeem', to: '/redeem', icon: Gift },
    { name: 'Rewards', to: '/rewards', icon: Gift },
    { name: 'Network', to: '/network', icon: Users },
    { name: 'Withdrawals', to: '/withdrawals', icon: ArrowDownToLine },
    { name: 'Profile', to: '/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-background-card border-b border-gray-200 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <h1 className="text-xl font-display font-bold text-primary">WeNews</h1>
          
          <div className="text-sm font-medium text-text-primary">
            {wallet && formatCurrency(wallet.balance)}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-background-card border-r border-gray-200 z-40
          transform transition-transform duration-200 ease-in-out
          lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="hidden lg:flex items-center justify-center h-16 border-b border-gray-200">
            <h1 className="text-2xl font-display font-bold text-primary">WeNews</h1>
          </div>

          {/* User info - Clickable to navigate to profile */}
          <div className="p-4 border-b border-gray-200 mt-16 lg:mt-0">
            <button
              onClick={() => {
                navigate('/profile');
                setIsSidebarOpen(false);
              }}
              className="w-full text-left hover:bg-gray-50 rounded-lg p-2 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center font-semibold text-sm shadow-md">
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-text-secondary truncate">{user?.email}</p>
                </div>
              </div>
            </button>
            
            {wallet && (
              <div className="mt-3 p-2 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                <p className="text-xs text-text-secondary">Wallet Balance</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(wallet.balance)}</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.to}
                    onClick={() => setIsSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-text-primary hover:bg-gray-100'
                      }`
                    }
                  >
                    <item.icon size={20} />
                    <span className="font-medium">{item.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Bottom actions */}
          <div className="p-4 border-t border-gray-200 space-y-1">
            <NavLink
              to="/settings"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-text-primary hover:bg-gray-100 transition-colors"
            >
              <Settings size={20} />
              <span className="font-medium">Settings</span>
            </NavLink>
            
            <button
              onClick={logout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-danger hover:bg-red-50 transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
