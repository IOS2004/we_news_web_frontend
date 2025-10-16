import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Wallet, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Banknote,
  ArrowLeft,
  HelpCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

// Predefined amounts for quick selection
const quickAmounts = [100, 500, 1000, 2000, 5000, 10000];

// Minimum deposit amount
const MIN_DEPOSIT_AMOUNT = 0;

// Payment methods
const paymentMethods = [
  {
    id: 'upi',
    name: 'UPI',
    icon: Smartphone,
    description: 'Pay using UPI ID or QR code',
    isAvailable: true,
  },
  {
    id: 'card',
    name: 'Credit/Debit Card',
    icon: CreditCard,
    description: 'Visa, Mastercard, RuPay',
    isAvailable: true,
  },
  {
    id: 'netbanking',
    name: 'Net Banking',
    icon: Building2,
    description: 'Pay using your bank account',
    isAvailable: true,
  },
  {
    id: 'wallet',
    name: 'Digital Wallet',
    icon: Wallet,
    description: 'Paytm, PhonePe, GooglePay',
    isAvailable: true,
  },
];

const AddMoney: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [amount, setAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('upi');
  const [isGuest, setIsGuest] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');

  // Check if this is a guest topup
  useEffect(() => {
    const locationState = location.state as { isGuest?: boolean };
    const guestData = sessionStorage.getItem('guestTopupData');
    
    if (locationState?.isGuest && guestData) {
      const parsedData = JSON.parse(guestData);
      setIsGuest(true);
      setGuestEmail(parsedData.email);
      toast.success(`Welcome, ${parsedData.email}! Complete your payment below.`);
    } else if (locationState?.isGuest && !guestData) {
      // If marked as guest but no data, redirect to guest form
      toast.error('Please complete the guest form first');
      navigate('/guest-topup');
    }
  }, [location, navigate]);

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
  };

  const formatAmount = (value: string) => {
    // Remove non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts[1];
    }
    
    return numericValue;
  };

  const handleAddMoney = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) < MIN_DEPOSIT_AMOUNT) {
      toast.error(`Minimum amount to add is ₹${MIN_DEPOSIT_AMOUNT}`);
      return;
    }

    if (parseFloat(amount) > 100000) {
      toast.error('Maximum amount to add is ₹1,00,000');
      return;
    }

    // Redirect to Guest Topup page with the selected amount
    navigate('/guest-topup', { 
      state: { 
        prefilledAmount: parseFloat(amount) 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">Add Money</h1>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <HelpCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Guest User Banner */}
        {isGuest && (
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-300 rounded-xl p-4 mb-6 flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-purple-900 mb-1">Guest Top-up Mode</h3>
              <p className="text-sm text-purple-700">
                You're adding money as a guest user ({guestEmail}). 
                After payment, you can create a full account to track your transactions.
              </p>
            </div>
          </div>
        )}

        {/* Amount Input Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Enter Amount</h2>
          
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-bold text-gray-400">
              ₹
            </span>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(formatAmount(e.target.value))}
              placeholder="0"
              maxLength={8}
              className="w-full pl-12 pr-4 py-4 text-3xl font-bold text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
            />
          </div>
          
          <p className="text-sm text-gray-500 mt-3 text-center">
            Minimum: ₹{MIN_DEPOSIT_AMOUNT} | Maximum: ₹1,00,000
          </p>
        </div>

        {/* Quick Amount Selection */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Add</h2>
          
          <div className="grid grid-cols-3 gap-3">
            {quickAmounts.map((value) => (
              <button
                key={value}
                onClick={() => handleQuickAmount(value)}
                className={`
                  py-3 px-4 rounded-xl font-semibold text-sm transition-all
                  ${amount === value.toString()
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                  }
                `}
              >
                ₹{value.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Payment Method</h2>
          
          <div className="space-y-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedPaymentMethod === method.id;
              
              return (
                <button
                  key={method.id}
                  onClick={() => method.isAvailable && handlePaymentMethodSelect(method.id)}
                  disabled={!method.isAvailable}
                  className={`
                    w-full p-4 rounded-xl border-2 transition-all text-left
                    ${isSelected
                      ? 'border-blue-600 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                    }
                    ${!method.isAvailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className={`
                      p-3 rounded-lg
                      ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}
                    `}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className={`font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                        {method.name}
                      </h3>
                      <p className={`text-sm ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                        {method.description}
                      </p>
                    </div>
                    
                    {isSelected && (
                      <CheckCircle2 className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold mb-1">Important Information</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Minimum topup amount is ₹{MIN_DEPOSIT_AMOUNT}</li>
              <li>GST will be added to the amount</li>
              <li>Money will be credited instantly after successful payment</li>
              <li>For any issues, contact support</li>
            </ul>
          </div>
        </div>

        {/* Add Money Button */}
        <button
          onClick={handleAddMoney}
          disabled={!amount || parseFloat(amount) < MIN_DEPOSIT_AMOUNT}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <div className="flex items-center justify-center gap-2">
            <Banknote className="w-6 h-6" />
            Add ₹{amount || '0'} to Wallet
          </div>
        </button>

        {/* Security Badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>Secured by Cashfree Payment Gateway</span>
        </div>
      </div>
    </div>
  );
};

export default AddMoney;
