import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@/contexts/WalletContext';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { formatCurrency } from '@/utils/helpers';
import toast from 'react-hot-toast';
import { 
  Wallet, 
  CreditCard, 
  Smartphone, 
  ArrowLeft,
  CheckCircle,
  Info,
  Shield
} from 'lucide-react';

// Quick amount presets
const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000, 10000];

// Payment methods
const PAYMENT_METHODS = [
  { id: 'upi', name: 'UPI', icon: Smartphone, description: 'Pay with any UPI app' },
  { id: 'card', name: 'Card', icon: CreditCard, description: 'Credit/Debit Card' },
  { id: 'netbanking', name: 'Net Banking', icon: Wallet, description: 'Internet Banking' },
];

export default function AddMoney() {
  const navigate = useNavigate();
  const { wallet, refreshWallet, addMoney } = useWallet();
  
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<{ amount?: string }>({});

  useEffect(() => {
    document.title = 'Add Money - WeNews';
    refreshWallet();
  }, []);

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
    setErrors({});
  };

  const validateAmount = (): boolean => {
    const newErrors: { amount?: string } = {};
    const numAmount = parseFloat(amount);

    if (!amount || amount.trim() === '') {
      newErrors.amount = 'Please enter an amount';
    } else if (isNaN(numAmount)) {
      newErrors.amount = 'Please enter a valid number';
    } else if (numAmount < 10) {
      newErrors.amount = 'Minimum amount is ₹10';
    } else if (numAmount > 100000) {
      newErrors.amount = 'Maximum amount is ₹1,00,000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAmount()) return;

    const numAmount = parseFloat(amount);

    try {
      setIsProcessing(true);

      // Call the add money API
      await addMoney(numAmount);

      // In a real implementation, you would:
      // 1. Get payment URL/session from backend
      // 2. Redirect to payment gateway (Cashfree, Razorpay, etc.)
      // 3. Handle payment callback
      
      // For now, simulate success
      toast.success(`Payment initiated for ${formatCurrency(numAmount)}`);
      
      // Simulate payment processing
      setTimeout(() => {
        toast.success('Payment successful! Your wallet has been updated.');
        refreshWallet();
        navigate('/wallet');
      }, 2000);

      // In production, you would redirect to payment gateway:
      // window.location.href = paymentData.paymentUrl;

    } catch (error: any) {
      console.error('Payment initiation failed:', error);
      toast.error(error.message || 'Failed to initiate payment');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate('/wallet')}
        className="flex items-center text-text-secondary hover:text-text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Wallet
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-display font-bold text-text-primary">Add Money</h1>
            <p className="text-text-secondary mt-1">Top up your wallet to continue earning</p>
          </div>

          {/* Current Balance Card */}
          <Card className="bg-gradient-to-br from-primary to-primary-dark text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Current Balance</p>
                <p className="text-3xl font-bold mt-1">{formatCurrency(wallet?.balance || 0)}</p>
              </div>
              <Wallet className="w-16 h-16 opacity-30" />
            </div>
          </Card>

          {/* Amount Selection */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Enter Amount</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Custom Amount Input */}
              <div>
                <Input
                  label="Amount (₹)"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setErrors({});
                  }}
                  error={errors.amount}
                  fullWidth
                  min={10}
                  max={100000}
                />
              </div>

              {/* Quick Amount Buttons */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-3">
                  Quick Select
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {QUICK_AMOUNTS.map((quickAmount) => (
                    <button
                      key={quickAmount}
                      type="button"
                      onClick={() => handleQuickAmount(quickAmount)}
                      className={`p-3 rounded-lg border-2 transition-all font-medium ${
                        amount === quickAmount.toString()
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-200 hover:border-primary hover:bg-primary/5'
                      }`}
                    >
                      ₹{quickAmount.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-3">
                  Payment Method
                </label>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setSelectedMethod(method.id)}
                        className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-4 ${
                          selectedMethod === method.id
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            selectedMethod === method.id
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-text-primary">{method.name}</div>
                          <div className="text-sm text-text-secondary">{method.description}</div>
                        </div>
                        {selectedMethod === method.id && (
                          <CheckCircle className="w-6 h-6 text-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                loading={isProcessing}
                disabled={!amount || isProcessing}
              >
                {isProcessing ? 'Processing...' : `Add ${amount ? formatCurrency(parseFloat(amount) || 0) : '₹0'}`}
              </Button>
            </form>
          </Card>

          {/* Security Notice */}
          <Card className="bg-blue-50 border border-blue-200">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">Secure Payment</h3>
                <p className="text-sm text-blue-700">
                  All transactions are encrypted and secure. We use industry-standard payment gateways
                  to ensure your money is safe.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar - Benefits & Info */}
        <div className="space-y-6">
          {/* Benefits Card */}
          <Card>
            <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              Benefits
            </h3>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                <span>Instant wallet top-up</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                <span>Multiple payment methods</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                <span>Secure encrypted transactions</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                <span>No hidden charges</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                <span>24/7 transaction support</span>
              </li>
            </ul>
          </Card>

          {/* Transaction Info */}
          <Card className="bg-gray-50">
            <h3 className="font-semibold text-text-primary mb-3">Transaction Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Min. Amount:</span>
                <span className="font-medium">₹10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Max. Amount:</span>
                <span className="font-medium">₹1,00,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Processing Time:</span>
                <span className="font-medium">Instant</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Transaction Fee:</span>
                <span className="font-medium text-success">Free</span>
              </div>
            </div>
          </Card>

          {/* Help Card */}
          <Card className="bg-primary/5 border border-primary/20">
            <h3 className="font-semibold text-primary mb-2">Need Help?</h3>
            <p className="text-sm text-text-secondary mb-3">
              If you face any issues with payment, please contact our support team.
            </p>
            <Button variant="outline" size="sm" fullWidth>
              Contact Support
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
