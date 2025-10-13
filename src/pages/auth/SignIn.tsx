import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Card from '@/components/common/Card';
import type { LoginCredentials } from '@/types';

export default function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginCredentials>>({});

  const validate = (): boolean => {
    const newErrors: Partial<LoginCredentials> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      setIsLoading(true);
      await login(formData);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold text-center mb-6">Sign In</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
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
          placeholder="Enter your password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          error={errors.password}
          required
          fullWidth
        />
        
        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={isLoading}
        >
          Sign In
        </Button>
      </form>
      
      <p className="text-center mt-6 text-text-secondary">
        Don't have an account?{' '}
        <Link to="/auth/signup" className="text-primary font-medium hover:underline">
          Sign Up
        </Link>
      </p>
    </Card>
  );
}
