import api from "./api";
import type { News, PaginatedResponse, ApiResponse } from "@/types";

export const newsService = {
  // Get news articles
  async getNews(
    page: number = 1,
    limit: number = 20,
    category?: string
  ): Promise<PaginatedResponse<News>> {
    const response = await api.get<PaginatedResponse<News>>("/news", {
      params: { page, limit, category },
    });
    return response.data;
  },

  // Get single news article
  async getNewsById(id: string): Promise<News> {
    const response = await api.get<ApiResponse<News>>(`/news/${id}`);
    return response.data.data!;
  },

  // Mark news as read (earns reward)
  async markAsRead(newsId: string): Promise<{ earned: number }> {
    const response = await api.post<ApiResponse<{ earned: number }>>(
      `/news/${newsId}/read`
    );
    return response.data.data!;
  },

  // Get reading history
  async getReadingHistory(
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<News>> {
    const response = await api.get<PaginatedResponse<News>>("/news/history", {
      params: { page, limit },
    });
    return response.data;
  },

  // Search news
  async searchNews(
    query: string,
    page: number = 1
  ): Promise<PaginatedResponse<News>> {
    const response = await api.get<PaginatedResponse<News>>("/news/search", {
      params: { q: query, page },
    });
    return response.data;
  },
};
