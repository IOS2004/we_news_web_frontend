import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/authService';
import { STORAGE_KEYS } from '@/config';
import type { User, LoginCredentials, SignUpData } from '@/types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);

      console.log('🔐 Auth Init - Token exists:', !!token);
      console.log('🔐 Auth Init - User data exists:', !!userData);

      if (token && userData) {
        try {
          // Parse and set user from localStorage immediately for faster UI
          const cachedUser = JSON.parse(userData);
          console.log('👤 Cached user loaded:', cachedUser);
          console.log('👤 User name:', cachedUser.firstName, cachedUser.lastName);
          setUser(cachedUser);
          
          // Then verify token is still valid by fetching current user
          try {
            const currentUser = await authService.getCurrentUser();
            console.log('✅ Token verified, fresh user data:', currentUser);
            console.log('✅ Fresh user name:', currentUser.firstName, currentUser.lastName);
            setUser(currentUser);
          } catch (verifyError) {
            // If verification fails but we have cached data, keep using it
            console.log('⚠️ Token verification failed, using cached user data:', verifyError);
          }
        } catch (error) {
          // Token invalid or corrupted data, clear storage
          console.log('❌ Auth initialization failed, clearing session:', error);
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER_DATA);
          setUser(null);
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);
      const { user, token } = response.data;

      // Store auth data
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      
      setUser(user);
      toast.success('Login successful!');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const signUp = async (data: SignUpData) => {
    try {
      const response = await authService.signUp(data);
      const { user, token } = response.data;

      // Store auth data
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      
      setUser(user);
      toast.success('Account created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Sign up failed');
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = async (data: Partial<User>) => {
    try {
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Update failed');
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signUp,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
