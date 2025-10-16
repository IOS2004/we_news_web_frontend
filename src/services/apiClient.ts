import axios, { AxiosInstance, AxiosError } from "axios";
import toast from "react-hot-toast";

// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://wenews.onrender.com/api";
const API_TIMEOUT = 60000; // 60 seconds for cold starts

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<any>) => {
    // Handle network errors
    if (!error.response) {
      toast.error("Network error. Please check your connection.");
      return Promise.reject(new Error("Network error"));
    }

    // Handle specific HTTP errors
    const status = error.response.status;
    const message = error.response.data?.message || "An error occurred";

    switch (status) {
      case 401:
        // Unauthorized - Clear auth and redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.error("Session expired. Please login again.");
        window.location.href = "/login";
        break;

      case 403:
        toast.error("Access denied.");
        break;

      case 404:
        toast.error("Resource not found.");
        break;

      case 422:
        // Validation error
        toast.error(message);
        break;

      case 429:
        toast.error("Too many requests. Please try again later.");
        break;

      case 500:
      case 502:
      case 503:
        toast.error("Server error. Please try again later.");
        break;

      default:
        toast.error(message);
    }

    return Promise.reject(error);
  }
);

// API Response type
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Pagination type
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Helper function to handle API calls with loading states
export async function apiCall<T>(
  promise: Promise<any>,
  options?: {
    showLoading?: boolean;
    showSuccess?: boolean;
    successMessage?: string;
    showError?: boolean;
  }
): Promise<T> {
  const {
    showLoading = false,
    showSuccess = false,
    successMessage = "Success!",
    showError = true,
  } = options || {};

  let loadingToast: string | undefined;

  try {
    if (showLoading) {
      loadingToast = toast.loading("Loading...");
    }

    const response = await promise;
    const data = response.data;

    if (loadingToast) {
      toast.dismiss(loadingToast);
    }

    if (showSuccess) {
      toast.success(successMessage);
    }

    return data;
  } catch (error: any) {
    if (loadingToast) {
      toast.dismiss(loadingToast);
    }

    if (showError && error.response?.data?.message) {
      toast.error(error.response.data.message);
    }

    throw error;
  }
}

export default apiClient;
