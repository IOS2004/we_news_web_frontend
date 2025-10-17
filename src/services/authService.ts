import api from "./api";
import type {
  LoginCredentials,
  SignUpData,
  AuthResponse,
  User,
  ApiResponse,
} from "@/types";

export const authService = {
  // Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    return response.data;
  },

  // Sign up
  async signUp(data: SignUpData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/signup", data);
    return response.data;
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await api.get<any>("/auth/me");
    console.log('📡 API Response for /auth/me:', response.data);
    
    // Handle different response formats
    if (response.data?.user) {
      return response.data.user;
    }
    if (response.data?.data?.user) {
      return response.data.data.user;
    }
    if (response.data?.data) {
      return response.data.data;
    }
    return response.data;
  },

  // Update profile
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put<ApiResponse<User>>("/auth/profile", data);
    return response.data.data!;
  },

  // Change password
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    await api.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });
  },

  // Logout (client-side only)
  logout(): void {
    localStorage.clear();
  },
};
