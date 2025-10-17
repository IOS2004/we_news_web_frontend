// External News API Types (from TheNewsAPI)
export interface Article {
  id: string;
  title: string;
  thumbnail: string;
  category: string;
  description?: string;
  author?: string;
  timeAgo?: string;
  url?: string;
  source?: string;
}

// Backend News API Types
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
