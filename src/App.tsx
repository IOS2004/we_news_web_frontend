import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { WalletProvider } from './contexts/WalletContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'

// Auth Pages
import SignIn from './pages/auth/SignIn'
import SignUp from './pages/auth/SignUp'

// Main Pages
import Dashboard from './pages/Dashboard'
import News from './pages/News'
import NewsDetail from './pages/NewsDetail'
import Trading from './pages/Trading'
import NumberTrading from './pages/NumberTrading'
import Wallet from './pages/Wallet'
import AddMoney from './pages/AddMoney'
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'
import Network from './pages/Network'
import Plans from './pages/Plans'
import Settings from './pages/Settings'
import Withdrawals from './pages/Withdrawals'
import MyTrades from './pages/MyTrades'
import Earnings from './pages/Earnings'
import Redeem from './pages/Redeem'
import Rewards from './pages/Rewards'
import Bookmarks from './pages/Bookmarks'
import Categories from './pages/Categories'
import Trending from './pages/Trending'

function App() {
  return (
    <AuthProvider>
      <WalletProvider>
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/auth/signin" element={<SignIn />} />
            <Route path="/auth/signup" element={<SignUp />} />
          </Route>

          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/news" element={<News />} />
            <Route path="/news/:id" element={<NewsDetail />} />
            <Route path="/news/bookmarks" element={<Bookmarks />} />
            <Route path="/news/categories" element={<Categories />} />
            <Route path="/news/trending" element={<Trending />} />
            <Route path="/trading" element={<Trading />} />
            <Route path="/trading/number" element={<NumberTrading />} />
            <Route path="/trading/history" element={<MyTrades />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/add-money" element={<AddMoney />} />
            <Route path="/earnings" element={<Earnings />} />
            <Route path="/redeem" element={<Redeem />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/network" element={<Network />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/withdrawals" element={<Withdrawals />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        
        <Toaster position="top-right" />
      </WalletProvider>
    </AuthProvider>
  )
}

export default App
