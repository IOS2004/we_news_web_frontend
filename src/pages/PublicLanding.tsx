import { useNavigate } from 'react-router-dom';
import { Wallet, TrendingUp, Shield, Zap, ArrowRight, Users, Gift } from 'lucide-react';

export default function PublicLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">WeNews</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Read news, earn rewards, trade, and grow your wealth with our innovative platform
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/guest-topup')}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <Wallet className="w-6 h-6" />
                Quick Top-up (No Login)
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => navigate('/auth/signin')}
                className="px-8 py-4 bg-white text-gray-900 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all border-2 border-gray-200"
              >
                Sign In
              </button>
              
              <button
                onClick={() => navigate('/auth/signup')}
                className="px-8 py-4 bg-white text-blue-600 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all border-2 border-blue-600"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose WeNews?</h2>
          <p className="text-xl text-gray-600">Everything you need to earn and grow</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl flex items-center justify-center mb-6">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Read & Earn</h3>
            <p className="text-gray-600">
              Read news articles and earn money for every article you read. Get rewarded for staying informed!
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-400 rounded-xl flex items-center justify-center mb-6">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Trading Games</h3>
            <p className="text-gray-600">
              Participate in color and number trading games. Test your luck and multiply your earnings!
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-green-400 rounded-xl flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Referral Network</h3>
            <p className="text-gray-600">
              Build your network and earn from referrals. Grow your income through multi-level marketing.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-orange-400 rounded-xl flex items-center justify-center mb-6">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Investment Plans</h3>
            <p className="text-gray-600">
              Choose from various investment plans and get daily returns on your investment.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-400 rounded-xl flex items-center justify-center mb-6">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Instant Withdrawals</h3>
            <p className="text-gray-600">
              Withdraw your earnings instantly to your bank account or UPI. Fast and secure transactions.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-xl flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Secure & Safe</h3>
            <p className="text-gray-600">
              Bank-level encryption and secure payment gateways. Your money and data are always protected.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Top-up CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Need to Top-up Quickly?</h2>
          <p className="text-xl text-white/90 mb-8">
            Add money to your wallet without creating an account. It's fast, secure, and easy!
          </p>
          <button
            onClick={() => navigate('/guest-topup')}
            className="px-12 py-5 bg-white text-blue-600 font-bold text-xl rounded-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all inline-flex items-center gap-3"
          >
            <Wallet className="w-7 h-7" />
            Start Guest Top-up
            <ArrowRight className="w-6 h-6" />
          </button>
          <p className="text-white/80 mt-4 text-sm">
            No registration required • Instant processing • Secure payment
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
            <div className="text-gray-600">Active Users</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-purple-600 mb-2">₹50L+</div>
            <div className="text-gray-600">Earnings Paid</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-green-600 mb-2">1M+</div>
            <div className="text-gray-600">Articles Read</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-orange-600 mb-2">24/7</div>
            <div className="text-gray-600">Support</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">WeNews</h3>
            <p className="text-gray-400 mb-4">News That Pays</p>
            <div className="flex justify-center gap-6 text-sm text-gray-400">
              <button className="hover:text-white transition-colors">About</button>
              <button className="hover:text-white transition-colors">Terms</button>
              <button className="hover:text-white transition-colors">Privacy</button>
              <button className="hover:text-white transition-colors">Contact</button>
            </div>
            <p className="text-gray-500 text-sm mt-6">
              © 2025 WeNews. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
