import { apiClient, apiCall, ApiResponse } from "./apiClient";
import { STORAGE_KEYS } from "@/config";

// Types
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "user" | "admin";
  referralCode: string;
  totalReferrals: number;
  referralEarnings: number;
  level: number;
  avatar?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  referralCode?: string;
  preferences?: {
    categories?: string[];
    language?: string;
    notifications?: boolean;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Authentication API Service
class AuthService {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiCall<ApiResponse<AuthResponse>>(
      apiClient.post("/auth/login", credentials),
      {
        showLoading: true,
        showSuccess: true,
        successMessage: "Login successful!",
      }
    );

    // Store token and user in localStorage
    const { token, user } = response.data!;
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

    return response.data!;
  }

  /**
   * Register new user
   */
  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await apiCall<ApiResponse<AuthResponse>>(
      apiClient.post("/auth/signup", data),
      {
        showLoading: true,
        showSuccess: true,
        successMessage: "Registration successful! Welcome aboard!",
      }
    );

    // Store token and user in localStorage
    const { token, user } = response.data!;
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

    return response.data!;
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    window.location.href = "/login";
  }

  /**
   * Get current user profile
   */
  async getMe(): Promise<User> {
    const response = await apiCall<ApiResponse<{ user: User }>>(
      apiClient.get("/auth/me")
    );
    return response.data!.user;
  }

  /**
   * Refresh JWT token
   */
  async refreshToken(): Promise<string> {
    const response = await apiCall<ApiResponse<{ token: string }>>(
      apiClient.post("/auth/refresh")
    );

    const { token } = response.data!;
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);

    return token;
  }

  /**
   * Change password
   */
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    await apiCall<ApiResponse>(apiClient.post("/auth/change-password", data), {
      showLoading: true,
      showSuccess: true,
      successMessage: "Password changed successfully!",
    });
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    return !!token;
  }

  /**
   * Get stored user from localStorage
   */
  getStoredUser(): User | null {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Get stored token from localStorage
   */
  getStoredToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }
}

export const authService = new AuthService();
export default authService;
