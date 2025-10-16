import { apiClient, apiCall, ApiResponse } from "./apiClient";
import { User } from "./authApi";

// Types
export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  avatar?: string;
  preferences?: {
    categories?: string[];
    language?: string;
    notifications?: boolean;
  };
}

export interface SavedArticle {
  id: string;
  articleId: string;
  userId: string;
  article: any;
  savedAt: string;
}

export interface ReadingHistory {
  id: string;
  articleId: string;
  userId: string;
  article: any;
  readAt: string;
  timeSpent?: number;
}

// User Profile API Service
class UserService {
  /**
   * Get user profile
   */
  async getProfile(): Promise<User> {
    const response = await apiCall<ApiResponse<{ user: User }>>(
      apiClient.get("/user/profile")
    );
    return response.data!.user;
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await apiCall<ApiResponse<{ user: User }>>(
      apiClient.put("/user/profile", data),
      {
        showLoading: true,
        showSuccess: true,
        successMessage: "Profile updated successfully!",
      }
    );

    // Update stored user in localStorage
    const updatedUser = response.data!.user;
    localStorage.setItem("user", JSON.stringify(updatedUser));

    return updatedUser;
  }

  /**
   * Get user preferences
   */
  async getPreferences(): Promise<any> {
    const response = await apiCall<ApiResponse<{ preferences: any }>>(
      apiClient.get("/user/preferences")
    );
    return response.data!.preferences;
  }

  /**
   * Update user preferences
   */
  async updatePreferences(preferences: {
    categories?: string[];
    language?: string;
    notifications?: boolean;
  }): Promise<any> {
    const response = await apiCall<ApiResponse<{ preferences: any }>>(
      apiClient.put("/user/preferences", { preferences }),
      {
        showLoading: true,
        showSuccess: true,
        successMessage: "Preferences updated!",
      }
    );
    return response.data!.preferences;
  }

  /**
   * Get saved articles
   */
  async getSavedArticles(params?: {
    page?: number;
    limit?: number;
  }): Promise<{ articles: SavedArticle[]; pagination: any }> {
    const response = await apiCall<
      ApiResponse<{
        savedArticles: SavedArticle[];
        pagination: any;
      }>
    >(apiClient.get("/user/saved-articles", { params }));
    return {
      articles: response.data!.savedArticles,
      pagination: response.data!.pagination,
    };
  }

  /**
   * Save an article
   */
  async saveArticle(articleId: string): Promise<void> {
    await apiCall<ApiResponse>(
      apiClient.post("/user/save-article", { articleId }),
      {
        showSuccess: true,
        successMessage: "Article saved!",
      }
    );
  }

  /**
   * Unsave an article
   */
  async unsaveArticle(articleId: string): Promise<void> {
    await apiCall<ApiResponse>(
      apiClient.delete(`/user/saved-articles/${articleId}`),
      {
        showSuccess: true,
        successMessage: "Article removed from saved!",
      }
    );
  }

  /**
   * Get reading history
   */
  async getReadingHistory(params?: {
    page?: number;
    limit?: number;
  }): Promise<{ history: ReadingHistory[]; pagination: any }> {
    const response = await apiCall<
      ApiResponse<{
        history: ReadingHistory[];
        pagination: any;
      }>
    >(apiClient.get("/user/reading-history", { params }));
    return {
      history: response.data!.history,
      pagination: response.data!.pagination,
    };
  }

  /**
   * Add article to reading history
   */
  async addToReadingHistory(
    articleId: string,
    timeSpent?: number
  ): Promise<void> {
    await apiCall<ApiResponse>(
      apiClient.post("/user/reading-history", { articleId, timeSpent })
    );
  }

  /**
   * Delete user account
   */
  async deleteAccount(password: string): Promise<void> {
    await apiCall<ApiResponse>(
      apiClient.delete("/user/account", { data: { password } }),
      {
        showLoading: true,
        showSuccess: true,
        successMessage: "Account deleted successfully!",
      }
    );

    // Clear localStorage and redirect to login
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }
}

export const userService = new UserService();
export default userService;
