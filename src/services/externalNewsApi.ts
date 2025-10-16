import axios from "axios";

// Configuration
const API_KEY = import.meta.env.VITE_NEWS_API_KEY || "YOUR_NEWS_API_KEY_HERE";
const BASE_URL =
  import.meta.env.VITE_NEWS_API_BASE_URL || "https://api.thenewsapi.com/v1";

// Axios Instance
const externalNewsApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
  },
});

// Types
export interface Article {
  id?: string;
  title: string;
  description: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source?: { id: string; name: string };
  author?: string;
  content?: string;
  category?: string;
}

// Helper Functions
const mapCategory = (_apiCategory: string, sourceName: string): string => {
  const sourceLower = sourceName.toLowerCase();

  if (sourceLower.includes("business") || sourceLower.includes("economic"))
    return "Business";
  if (sourceLower.includes("tech") || sourceLower.includes("technology"))
    return "Tech";
  if (sourceLower.includes("sports")) return "Sports";
  if (
    sourceLower.includes("entertainment") ||
    sourceLower.includes("bollywood")
  )
    return "Entertainment";
  if (
    sourceLower.includes("politics") ||
    sourceLower.includes("india") ||
    sourceLower.includes("news")
  )
    return "Politics";

  return "General";
};

const mapTheNewsApiArticleToAppArticle = (apiArticle: any): Article => {
  let fullDescription = "";

  if (apiArticle.description && apiArticle.snippet) {
    if (apiArticle.description !== apiArticle.snippet) {
      fullDescription = `${apiArticle.description}\n\n${apiArticle.snippet}`;
    } else {
      fullDescription = apiArticle.description;
    }
  } else {
    fullDescription =
      apiArticle.description ||
      apiArticle.snippet ||
      "No description available";
  }

  return {
    id: apiArticle.uuid || `article-${Date.now()}-${Math.random()}`,
    title: apiArticle.title || "No Title Available",
    urlToImage:
      apiArticle.image_url ||
      `https://picsum.photos/800/400?random=${Math.floor(
        Math.random() * 1000
      )}`,
    description: fullDescription,
    author: apiArticle.source || "Unknown Author",
    url: apiArticle.url || "",
    source: {
      id: apiArticle.source || "",
      name: apiArticle.source || "Unknown Source",
    },
    category: mapCategory(
      apiArticle.categories?.[0] || "",
      apiArticle.source || ""
    ),
    publishedAt: apiArticle.published_at || new Date().toISOString(),
    content: fullDescription,
  };
};

// API Functions
export const getTopHeadlines = async (
  category?: "business" | "technology" | "sports" | "entertainment"
): Promise<Article[]> => {
  try {
    const params: any = {
      language: "en",
      countries: "in",
      limit: 20,
    };

    if (category) {
      params.categories = category;
    }

    const response = await externalNewsApi.get("/news/top", { params });

    if (response.data && response.data.data) {
      return response.data.data.map(mapTheNewsApiArticleToAppArticle);
    }

    return [];
  } catch (error) {
    console.error("Error fetching top headlines:", error);
    // Return fallback articles
    return getFallbackArticles();
  }
};

export const getArticlesByLanguage = async (
  language: string,
  query?: string
): Promise<Article[]> => {
  try {
    const params: any = {
      language: language,
      countries: "in",
      limit: 20,
    };

    if (query) {
      params.search = query;
    }

    const response = await externalNewsApi.get("/news/all", { params });

    if (response.data && response.data.data) {
      return response.data.data.map(mapTheNewsApiArticleToAppArticle);
    }

    return [];
  } catch (error) {
    console.error("Error fetching articles by language:", error);
    return getFallbackArticles();
  }
};

export const getFullArticleContent = async (
  articleId: string
): Promise<string> => {
  try {
    // Try to fetch full article
    const response = await externalNewsApi.get(`/news/uuid/${articleId}`);

    if (response.data && response.data.data) {
      const article = response.data.data;
      return article.description || article.snippet || "No content available";
    }

    return "No content available";
  } catch (error) {
    console.error("Error fetching full article content:", error);
    return "Unable to load full article content. Please visit the original source.";
  }
};

// Fallback articles when API fails
const getFallbackArticles = (): Article[] => {
  return [
    {
      id: "fallback-1",
      title: "Welcome to WeNews",
      description:
        "Stay updated with the latest news from India and around the world. To see real news, add your News API key to the .env file: VITE_NEWS_API_KEY=your_key_here",
      url: "https://www.thenewsapi.com/",
      urlToImage:
        "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop",
      publishedAt: new Date().toISOString(),
      source: { id: "wenews", name: "WeNews" },
      author: "WeNews Team",
      category: "General",
    },
    {
      id: "fallback-2",
      title: "Get Your Free News API Key",
      description:
        "Visit TheNewsAPI.com to get a free API key and enable real-time news from around the world. It only takes 2 minutes to sign up!",
      url: "https://www.thenewsapi.com/",
      urlToImage:
        "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&h=400&fit=crop",
      publishedAt: new Date().toISOString(),
      source: { id: "wenews", name: "WeNews" },
      author: "WeNews Team",
      category: "General",
    },
    {
      id: "fallback-3",
      title: "Breaking: Technology News",
      description:
        "Latest updates in technology, innovation, and digital transformation. Real news will appear here once API key is configured.",
      url: "#",
      urlToImage:
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=400&fit=crop",
      publishedAt: new Date().toISOString(),
      source: { id: "wenews", name: "WeNews" },
      author: "Tech Desk",
      category: "Technology",
    },
    {
      id: "fallback-4",
      title: "Business & Economy Updates",
      description:
        "Latest business news, market updates, and economic indicators. Add your API key to see real business news from trusted sources.",
      url: "#",
      urlToImage:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
      publishedAt: new Date().toISOString(),
      source: { id: "wenews", name: "WeNews" },
      author: "Business Desk",
      category: "Business",
    },
    {
      id: "fallback-5",
      title: "Sports Highlights",
      description:
        "Get the latest sports news, scores, and highlights. Configure your News API key to see real-time sports updates.",
      url: "#",
      urlToImage:
        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=400&fit=crop",
      publishedAt: new Date().toISOString(),
      source: { id: "wenews", name: "WeNews" },
      author: "Sports Desk",
      category: "Sports",
    },
    {
      id: "fallback-6",
      title: "Entertainment & Culture",
      description:
        "Latest entertainment news, movie releases, and celebrity updates. Real entertainment news coming soon with API integration.",
      url: "#",
      urlToImage:
        "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=400&fit=crop",
      publishedAt: new Date().toISOString(),
      source: { id: "wenews", name: "WeNews" },
      author: "Entertainment Desk",
      category: "Entertainment",
    },
  ];
};

export default {
  getTopHeadlines,
  getArticlesByLanguage,
  getFullArticleContent,
};
