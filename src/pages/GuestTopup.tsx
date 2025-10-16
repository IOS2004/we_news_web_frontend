import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { ArrowLeft, Mail, Calendar, Lock, Shield, CheckCircle, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { walletService } from '@/services/walletApi';
import paymentApi from '@/services/paymentApi';

interface GuestUserData {
  email: string;
  dateOfBirth: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  amount: number;
}

// Predefined amounts for quick selection
const quickAmounts = [100, 500, 1000, 2000, 5000, 10000];

// Minimum deposit amount
const MIN_DEPOSIT_AMOUNT = 0;

export default function GuestTopup() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState<GuestUserData>({
    email: '',
    dateOfBirth: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    amount: 0,
  });
  const [errors, setErrors] = useState<Partial<GuestUserData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prefill amount if passed from AddMoney page
  useEffect(() => {
    const locationState = location.state as { prefilledAmount?: number };
    if (locationState?.prefilledAmount) {
      const amount = locationState.prefilledAmount;
      setFormData(prev => ({ ...prev, amount }));
      toast.success(`Amount ₹${amount} selected. Complete the form to proceed.`);
    }
  }, [location]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateAge = (dob: string): boolean => {
    if (!dob) return false;
    
    const birthDate = new Date(dob);
    
    // Check if date is valid
    if (isNaN(birthDate.getTime())) {
      console.log('Invalid date format:', dob);
      return false;
    }
    
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 18;
    }
    return age >= 18;
  };

  const validatePhoneNumber = (phone: string): boolean => {
    // Optional: Indian phone number format (10 digits)
    if (!phone) return true; // Optional field
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<GuestUserData> = {};

    console.log('=== VALIDATING FORM ===');
    console.log('Email:', formData.email, 'Valid:', validateEmail(formData.email));
    console.log('DOB:', formData.dateOfBirth, 'Valid:', validateAge(formData.dateOfBirth));
    console.log('Password:', formData.password ? '****' : 'EMPTY');
    console.log('Phone:', formData.phoneNumber || 'NOT PROVIDED', 'Valid:', formData.phoneNumber ? validatePhoneNumber(formData.phoneNumber) : 'N/A');

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
      console.log('❌ Email is required');
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      console.log('❌ Invalid email format');
    }

    // Date of Birth validation
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
      console.log('❌ DOB is required');
    } else if (!validateAge(formData.dateOfBirth)) {
      newErrors.dateOfBirth = 'You must be at least 18 years old';
      console.log('❌ Age validation failed');
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
      console.log('❌ Password is required');
    }

    // Phone number validation (optional)
    if (formData.phoneNumber && !validatePhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
      console.log('❌ Invalid phone number');
    }

    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('=== FORM SUBMISSION START ===');
    console.log('Form submitted with data:', formData);
    console.log('Current errors before validation:', errors);

    const isValid = validateForm();
    console.log('Validation result:', isValid);
    
    if (!isValid) {
      console.log('Form validation failed, errors:', errors);
      toast.error('Please fix the errors in the form');
      return;
    }

    console.log('Form validation passed');

    // Validate amount
    if (!formData.amount || formData.amount < MIN_DEPOSIT_AMOUNT) {
      console.log('Amount validation failed:', formData.amount);
      toast.error(`Please enter amount (minimum ₹${MIN_DEPOSIT_AMOUNT})`);
      return;
    }

    if (formData.amount > 100000) {
      console.log('Amount too high:', formData.amount);
      toast.error('Maximum amount is ₹1,00,000');
      return;
    }

    console.log('All validations passed, calling API...');
    setIsSubmitting(true);

    try {
      console.log('Calling guestTopup API with data:', {
        email: formData.email,
        password: formData.password,
        dateOfBirth: formData.dateOfBirth,
        amount: formData.amount,
        paymentMethod: 'cashfree',
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
      });
      console.log('Date format being sent:', formData.dateOfBirth);
      console.log('Expected format: YYYY-MM-DD (e.g., 1995-05-15)');

      // Call the guest topup API
      const response = await walletService.guestTopup({
        email: formData.email,
        password: formData.password,
        dateOfBirth: formData.dateOfBirth,
        amount: formData.amount,
        paymentMethod: 'cashfree',
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
      });

      console.log('Guest topup API response:', response);

      // Validate response structure
      if (!response || !response.paymentResponse || !response.paymentResponse.paymentData) {
        console.error('Invalid API response structure:', response);
        throw new Error('Invalid response from server');
      }

      // Extract payment session ID
      const { payment_session_id } = response.paymentResponse.paymentData;
      const { transactionId, amounts } = response;

      if (!payment_session_id) {
        console.error('Payment session ID missing in response');
        throw new Error('Payment session ID not received');
      }

      console.log('Payment session ID received:', payment_session_id);
      console.log('Transaction ID:', transactionId);

      // Store transaction details in sessionStorage
      sessionStorage.setItem('guestTopupTransaction', JSON.stringify({
        transactionId,
        amounts,
        userDetails: response.userDetails,
        timestamp: new Date().toISOString(),
      }));

      toast.success('Redirecting to payment gateway...');

      // Open Cashfree payment gateway
      await paymentApi.processCashfreePayment(
        transactionId,
        payment_session_id,
        {
          onSuccess: async (data) => {
            console.log('Payment successful:', data);
            setIsSubmitting(false);
            
            toast.success(`₹${amounts.creditAmount} has been added to your wallet!`);

            // Show success message with option to create account
            setTimeout(() => {
              navigate('/payment-success', { 
                state: { 
                  isGuest: true, 
                  email: formData.email,
                  amount: amounts.creditAmount 
                } 
              });
            }, 1500);
          },
          onFailure: (error) => {
            console.error('Payment failed:', error);
            setIsSubmitting(false);
            
            toast.error(error.error?.message || 'Payment was not completed. Please try again.');
          },
          onError: (error) => {
            console.error('Payment error:', error);
            setIsSubmitting(false);
            
            toast.error('An error occurred during payment. Please try again.');
          },
        }
      );

    } catch (error: any) {
      console.error('Error processing guest topup:', error);
      setIsSubmitting(false);
      toast.error(error.response?.data?.message || error.message || 'Failed to process your request. Please try again.');
    }
  };

  const handleChange = (field: keyof GuestUserData, value: string) => {
    // Handle amount field specifically to convert to number
    if (field === 'amount') {
      const numValue = value === '' ? 0 : parseFloat(value);
      setFormData(prev => ({ ...prev, [field]: numValue }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      {/* Back Button */}
      <div className="max-w-2xl mx-auto mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify & Add Money</h1>
          <p className="text-gray-600">
            Verify your account details to proceed with wallet top-up
          </p>
        </div>

        {/* Info Banner */}
        <Card className="bg-blue-50 border border-blue-200 mb-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">Account Verification Required</h3>
              <p className="text-sm text-blue-700">
                Please verify your account by entering your registered email, password, and date of birth. 
                This ensures secure access to your wallet for adding funds.
              </p>
            </div>
          </div>
        </Card>

        {/* Form */}
        <Card className="shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </div>
              </label>
              <Input
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                error={errors.email}
                fullWidth
              />
              {!errors.email && formData.email && validateEmail(formData.email) && (
                <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                  <CheckCircle className="w-4 h-4" />
                  Valid email address
                </div>
              )}
            </div>

            {/* Optional fields removed - This is verification only, not signup */}

            {/* Amount to Add */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  Amount to Add
                </div>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">
                  ₹
                </span>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={formData.amount || ''}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  fullWidth
                  className="pl-12"
                  min={MIN_DEPOSIT_AMOUNT.toString()}
                  max="100000"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Minimum: ₹{MIN_DEPOSIT_AMOUNT} | Maximum: ₹1,00,000
              </p>
              
              {/* Quick Amount Selection */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                {quickAmounts.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleChange('amount', value.toString())}
                    className={`
                      py-2 px-3 rounded-lg font-semibold text-sm transition-all
                      ${formData.amount === value
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                      }
                    `}
                  >
                    ₹{value.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date of Birth
                </div>
              </label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                error={errors.dateOfBirth}
                fullWidth
                max={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-gray-500 mt-1">
                You must be 18 years or older to use this service
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </div>
              </label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                error={errors.password}
                fullWidth
              />
            </div>

            {/* Terms */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                By proceeding, you agree to our{' '}
                <button type="button" className="text-blue-600 hover:underline">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" className="text-blue-600 hover:underline">
                  Privacy Policy
                </button>
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Continue to Payment'}
            </Button>
          </form>
        </Card>

        {/* Benefits */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="text-center p-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Secure</h3>
            <p className="text-sm text-gray-600">Bank-level encryption</p>
          </Card>

          <Card className="text-center p-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Fast</h3>
            <p className="text-sm text-gray-600">Instant verification</p>
          </Card>

          <Card className="text-center p-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Wallet className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Quick</h3>
            <p className="text-sm text-gray-600">Add money instantly</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
