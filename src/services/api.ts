import axios, { AxiosInstance, AxiosError } from "axios";
import { config, STORAGE_KEYS } from "@/config";
import type { ApiResponse } from "@/types";

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 60000, // Increased to 60 seconds for slow Render.com cold starts
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse>) => {
    // Handle 401 Unauthorized - Clear auth and redirect to login
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;

      // Only redirect if not already on auth page
      if (!currentPath.startsWith("/auth")) {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        window.location.href = "/auth/signin";
      }
    }

    // Extract error message
    let message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "An unexpected error occurred";

    // Add helpful message for timeout errors
    if (error.code === 'ECONNABORTED' || message.includes('timeout')) {
      message = "Server is taking too long to respond. The backend may be starting up (this can take 30-60 seconds on free hosting). Please try again.";
    }

    // Add helpful message for network errors
    if (error.code === 'ERR_NETWORK' || !error.response) {
      message = "Cannot connect to server. Please check your internet connection or try again later.";
    }

    return Promise.reject(new Error(message));
  }
);

export default api;

// Helper function for handling API errors
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
};
