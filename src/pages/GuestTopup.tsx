import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { ArrowLeft, User, Mail, Calendar, Lock, Shield, CheckCircle, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

interface GuestUserData {
  email: string;
  dateOfBirth: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export default function GuestTopup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<GuestUserData>({
    email: '',
    dateOfBirth: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });
  const [errors, setErrors] = useState<Partial<GuestUserData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateAge = (dob: string): boolean => {
    const birthDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 18;
    }
    return age >= 18;
  };

  const validatePassword = (password: string): boolean => {
    // At least 8 characters, one uppercase, one lowercase, one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  const validatePhoneNumber = (phone: string): boolean => {
    // Optional: Indian phone number format (10 digits)
    if (!phone) return true; // Optional field
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<GuestUserData> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Date of Birth validation
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else if (!validateAge(formData.dateOfBirth)) {
      newErrors.dateOfBirth = 'You must be at least 18 years old';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Phone number validation (optional)
    if (formData.phoneNumber && !validatePhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      // Store guest user data in sessionStorage for the add money page
      const guestData = {
        email: formData.email,
        dateOfBirth: formData.dateOfBirth,
        password: formData.password,
        isGuestTopup: true,
        timestamp: new Date().toISOString(),
      };

      sessionStorage.setItem('guestTopupData', JSON.stringify(guestData));

      toast.success('Details verified! Proceeding to payment...');

      // Navigate to add money page
      setTimeout(() => {
        navigate('/add-money', { state: { isGuest: true } });
      }, 500);

    } catch (error: any) {
      console.error('Error processing guest topup:', error);
      toast.error('Failed to process your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof GuestUserData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Guest Top-up</h1>
          <p className="text-gray-600">
            Enter your details to proceed with wallet top-up without creating an account
          </p>
        </div>

        {/* Info Banner */}
        <Card className="bg-blue-50 border border-blue-200 mb-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">Quick & Secure</h3>
              <p className="text-sm text-blue-700">
                Your information is securely stored and used only for this transaction. 
                You can create a full account later to track your transactions.
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

            {/* First Name (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  First Name <span className="text-gray-400 text-xs ml-1">(Optional)</span>
                </div>
              </label>
              <Input
                type="text"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                fullWidth
              />
            </div>

            {/* Last Name (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Last Name <span className="text-gray-400 text-xs ml-1">(Optional)</span>
                </div>
              </label>
              <Input
                type="text"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                fullWidth
              />
            </div>

            {/* Phone Number (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number <span className="text-gray-400 text-xs ml-1">(Optional)</span>
                </div>
              </label>
              <Input
                type="tel"
                placeholder="Enter your 10-digit phone number"
                value={formData.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                error={errors.phoneNumber}
                fullWidth
                maxLength={10}
              />
              {!errors.phoneNumber && formData.phoneNumber && validatePhoneNumber(formData.phoneNumber) && (
                <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                  <CheckCircle className="w-4 h-4" />
                  Valid phone number
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Enter a valid 10-digit Indian mobile number
              </p>
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
                  Create Password
                </div>
              </label>
              <Input
                type="password"
                placeholder="Enter a secure password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                error={errors.password}
                fullWidth
              />
              <div className="mt-2 space-y-1">
                <div className={`flex items-center gap-2 text-xs ${
                  formData.password.length >= 8 ? 'text-green-600' : 'text-gray-400'
                }`}>
                  <CheckCircle className="w-3 h-3" />
                  At least 8 characters
                </div>
                <div className={`flex items-center gap-2 text-xs ${
                  /[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'
                }`}>
                  <CheckCircle className="w-3 h-3" />
                  One uppercase letter
                </div>
                <div className={`flex items-center gap-2 text-xs ${
                  /[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'
                }`}>
                  <CheckCircle className="w-3 h-3" />
                  One lowercase letter
                </div>
                <div className={`flex items-center gap-2 text-xs ${
                  /\d/.test(formData.password) ? 'text-green-600' : 'text-gray-400'
                }`}>
                  <CheckCircle className="w-3 h-3" />
                  One number
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Confirm Password
                </div>
              </label>
              <Input
                type="password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                error={errors.confirmPassword}
                fullWidth
              />
              {!errors.confirmPassword && formData.confirmPassword && 
               formData.password === formData.confirmPassword && (
                <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                  <CheckCircle className="w-4 h-4" />
                  Passwords match
                </div>
              )}
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

        {/* Already have account link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/auth/signin')}
              className="text-blue-600 hover:underline font-medium"
            >
              Sign in instead
            </button>
          </p>
        </div>

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
            <p className="text-sm text-gray-600">Instant top-up</p>
          </Card>

          <Card className="text-center p-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Easy</h3>
            <p className="text-sm text-gray-600">No registration needed</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
