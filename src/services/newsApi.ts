import apiClient, { apiCall } from './apiClient';

// Types
export interface NewsArticle {
  _id: string;
  title: string;
  content: string;
  summary?: string;
  category: string;
  author: string;
  image?: string;
  tags?: string[];
  views: number;
  likes: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  isTrending?: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewsCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  articleCount: number;
  isActive: boolean;
}

export interface NewsStats {
  totalArticles: number;
  totalViews: number;
  totalLikes: number;
  totalBookmarks: number;
  readingTime: number;
  articlesRead: number;
}

export interface BookmarkedArticle extends NewsArticle {
  bookmarkedAt: string;
}

export interface ReadingHistory {
  _id: string;
  articleId: string;
  article: NewsArticle;
  progress: number;
  readAt: string;
  completed: boolean;
}

// API Methods
export const newsApi = {
  // Get all articles
  getArticles: async (filters?: {
    category?: string;
    search?: string;
    trending?: boolean;
    page?: number;
    limit?: number;
    sort?: 'latest' | 'popular' | 'trending';
  }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.trending) params.append('trending', 'true');
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sort) params.append('sort', filters.sort);

    return apiCall<{ articles: NewsArticle[]; total: number; page: number; pages: number }>(
      apiClient.get(`/news?${params.toString()}`)
    );
  },

  // Get article by ID
  getArticleById: async (articleId: string) => {
    return apiCall<NewsArticle>(
      apiClient.get(`/news/${articleId}`)
    );
  },

  // Get trending articles
  getTrendingArticles: async (limit: number = 10) => {
    return apiCall<NewsArticle[]>(
      apiClient.get(`/news/trending?limit=${limit}`)
    );
  },

  // Get articles by category
  getArticlesByCategory: async (category: string, page: number = 1, limit: number = 20) => {
    return apiCall<{ articles: NewsArticle[]; total: number; page: number; pages: number }>(
      apiClient.get(`/news/category/${category}?page=${page}&limit=${limit}`)
    );
  },

  // Get all categories
  getCategories: async () => {
    return apiCall<NewsCategory[]>(
      apiClient.get('/news/categories')
    );
  },

  // Get category by slug
  getCategoryBySlug: async (slug: string) => {
    return apiCall<NewsCategory>(
      apiClient.get(`/news/categories/${slug}`)
    );
  },

  // Like article
  likeArticle: async (articleId: string) => {
    return apiCall<{ liked: boolean; likesCount: number }>(
      apiClient.post(`/news/${articleId}/like`),
      { showSuccess: true, successMessage: 'Article liked!' }
    );
  },

  // Unlike article
  unlikeArticle: async (articleId: string) => {
    return apiCall<{ liked: boolean; likesCount: number }>(
      apiClient.delete(`/news/${articleId}/like`),
      { showSuccess: true, successMessage: 'Article unliked!' }
    );
  },

  // Bookmark article
  bookmarkArticle: async (articleId: string) => {
    return apiCall<{ bookmarked: boolean }>(
      apiClient.post(`/news/${articleId}/bookmark`),
      { showSuccess: true, successMessage: 'Article bookmarked!' }
    );
  },

  // Remove bookmark
  removeBookmark: async (articleId: string) => {
    return apiCall<{ bookmarked: boolean }>(
      apiClient.delete(`/news/${articleId}/bookmark`),
      { showSuccess: true, successMessage: 'Bookmark removed!' }
    );
  },

  // Get bookmarked articles
  getBookmarkedArticles: async (filters?: {
    category?: string;
    page?: number;
    limit?: number;
    sort?: 'latest' | 'oldest';
  }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sort) params.append('sort', filters.sort);

    return apiCall<{ articles: BookmarkedArticle[]; total: number; page: number; pages: number }>(
      apiClient.get(`/news/bookmarks?${params.toString()}`)
    );
  },

  // Track article view
  trackView: async (articleId: string) => {
    return apiCall<{ views: number }>(
      apiClient.post(`/news/${articleId}/view`)
    );
  },

  // Get reading history
  getReadingHistory: async (page: number = 1, limit: number = 20) => {
    return apiCall<{ history: ReadingHistory[]; total: number; page: number; pages: number }>(
      apiClient.get(`/news/history?page=${page}&limit=${limit}`)
    );
  },

  // Update reading progress
  updateReadingProgress: async (articleId: string, progress: number, completed: boolean = false) => {
    return apiCall<ReadingHistory>(
      apiClient.post(`/news/${articleId}/progress`, { progress, completed })
    );
  },

  // Clear reading history
  clearReadingHistory: async () => {
    return apiCall<{ success: boolean }>(
      apiClient.delete('/news/history'),
      { showSuccess: true, successMessage: 'Reading history cleared!' }
    );
  },

  // Get news stats
  getStats: async () => {
    return apiCall<NewsStats>(
      apiClient.get('/news/stats')
    );
  },

  // Search articles
  searchArticles: async (query: string, filters?: {
    category?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    params.append('q', query);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return apiCall<{ articles: NewsArticle[]; total: number; page: number; pages: number }>(
      apiClient.get(`/news/search?${params.toString()}`)
    );
  },

  // Get related articles
  getRelatedArticles: async (articleId: string, limit: number = 5) => {
    return apiCall<NewsArticle[]>(
      apiClient.get(`/news/${articleId}/related?limit=${limit}`)
    );
  },

  // Get popular articles
  getPopularArticles: async (period: 'today' | 'week' | 'month' = 'week', limit: number = 10) => {
    return apiCall<NewsArticle[]>(
      apiClient.get(`/news/popular?period=${period}&limit=${limit}`)
    );
  },

  // Report article
  reportArticle: async (articleId: string, reason: string, description?: string) => {
    return apiCall<{ success: boolean }>(
      apiClient.post(`/news/${articleId}/report`, { reason, description }),
      { showSuccess: true, successMessage: 'Article reported!' }
    );
  },

  // Share article (track share count)
  shareArticle: async (articleId: string, platform: string) => {
    return apiCall<{ shares: number }>(
      apiClient.post(`/news/${articleId}/share`, { platform })
    );
  },
};

export default newsApi;
