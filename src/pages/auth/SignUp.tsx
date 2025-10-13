import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Card from '@/components/common/Card';
import type { SignUpData } from '@/types';

export default function SignUp() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState<SignUpData>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    referralCode: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<SignUpData & { confirmPassword: string }>>({});

  const validate = (): boolean => {
    const newErrors: any = {};
    
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      setIsLoading(true);
      await signUp(formData);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            type="text"
            placeholder="First name"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            error={errors.firstName}
            required
            fullWidth
          />
          
          <Input
            label="Last Name"
            type="text"
            placeholder="Last name"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            error={errors.lastName}
            required
            fullWidth
          />
        </div>
        
        <Input
          label="Username"
          type="text"
          placeholder="Choose a username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          error={errors.username}
          required
          fullWidth
        />
        
        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
          required
          fullWidth
        />
        
        <Input
          label="Password"
          type="password"
          placeholder="Create a password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          error={errors.password}
          helperText="Minimum 6 characters"
          required
          fullWidth
        />
        
        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          required
          fullWidth
        />
        
        <Input
          label="Referral Code (Optional)"
          type="text"
          placeholder="Enter referral code if you have one"
          value={formData.referralCode || ''}
          onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
          fullWidth
        />
        
        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={isLoading}
        >
          Sign Up
        </Button>
      </form>
      
      <p className="text-center mt-6 text-text-secondary">
        Already have an account?{' '}
        <Link to="/auth/signin" className="text-primary font-medium hover:underline">
          Sign In
        </Link>
      </p>
    </Card>
  );
}
