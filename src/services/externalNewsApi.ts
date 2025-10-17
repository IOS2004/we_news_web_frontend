import axios from "axios";
import { Article } from "../types/news";

// --- Configuration ---
const API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const BASE_URL =
  import.meta.env.VITE_NEWS_API_BASE_URL || "https://api.thenewsapi.com/v1";

if (!API_KEY) {
  console.error("Missing VITE_NEWS_API_KEY in environment variables");
}

// --- Axios Instance ---
const externalNewsApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
  },
});

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

/**
 * Formats time ago in a user-friendly way for Indian audience
 */
const formatTimeAgo = (publishedAt: string): string => {
  const now = new Date();
  const published = new Date(publishedAt);
  const diffInHours = Math.floor(
    (now.getTime() - published.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) return "अभी तक / Just now";
  if (diffInHours < 24) return `${diffInHours} घंटे पहले / ${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} दिन पहले / ${diffInDays}d ago`;

  return published.toLocaleDateString("hi-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/**
 * Maps a TheNewsAPI article to the format expected by the app's UI components.
 */
const mapTheNewsApiArticleToAppArticle = (apiArticle: any): Article => {
  // Combine description and snippet for more comprehensive content
  let fullDescription = "";

  // TheNewsAPI returns: description (full text if available) and snippet (truncated preview)
  // Try to use description first (more complete), then snippet, then fallback
  if (apiArticle.description && apiArticle.snippet) {
    // If both exist, use the longer one or combine if they're different
    if (apiArticle.description !== apiArticle.snippet) {
      // If description is longer, it's likely the full content
      if (apiArticle.description.length > apiArticle.snippet.length) {
        fullDescription = apiArticle.description;
      } else {
        // Otherwise combine both for more context
        fullDescription = `${apiArticle.description}\n\n${apiArticle.snippet}`;
      }
    } else {
      fullDescription = apiArticle.description;
    }
  } else {
    // Use whichever is available
    fullDescription =
      apiArticle.description ||
      apiArticle.snippet ||
      "विवरण उपलब्ध नहीं / No description available";
  }

  // Remove trailing ellipsis and add note if content appears truncated
  const isTruncated = fullDescription.endsWith('...') || fullDescription.endsWith('…');
  if (isTruncated) {
    // Remove the ellipsis
    fullDescription = fullDescription.replace(/\.{3}$|…$/, '').trim();
    // Add helpful note in bilingual format
    fullDescription += `\n\n[पूरा लेख पढ़ने के लिए "Read Original Article" पर क्लिक करें / Click "Read Original Article" to read the full story]`;
  }

  return {
    id: apiArticle.uuid || `article-${Date.now()}-${Math.random()}`,
    title: apiArticle.title || "शीर्षक उपलब्ध नहीं / No Title Available",
    thumbnail:
      apiArticle.image_url ||
      "https://picsum.photos/800/400?random=" +
        Math.floor(Math.random() * 1000),
    category: mapCategory(
      apiArticle.categories?.[0] || "general",
      apiArticle.source || ""
    ),
    description: fullDescription,
    author: apiArticle.source || "अज्ञात / Unknown",
    timeAgo: formatTimeAgo(apiArticle.published_at),
    url: apiArticle.url,
    source: apiArticle.source || "Unknown Source",
  };
};

// --- API Service Functions ---

/**
 * Try to get full article content by UUID (if supported by the API)
 * Note: TheNewsAPI free tier may not provide full content, only snippets
 */
export const getFullArticleContent = async (
  articleId: string
): Promise<string | null> => {
  try {
    // Check if TheNewsAPI has an individual article endpoint
    const response = await externalNewsApi.get(`/news/${articleId}`, {
      params: {
        api_token: API_KEY,
      },
    });

    if (response.data?.data) {
      const article = response.data.data;
      // Try to get the most complete content available
      let content = article.content || article.description || article.snippet || null;
      
      // If content is truncated, indicate where to read full article
      if (content && (content.endsWith('...') || content.endsWith('…'))) {
        content = content.replace(/\.{3}$|…$/, '').trim();
        content += `\n\n[Full article available at the original source. Click "Read Original Article" button below.]`;
      }
      
      return content;
    }

    return null;
  } catch (error) {
    console.log("Full article content not available via API");
    return null;
  }
};

/**
 * Fetches top headlines from India (mixed Hindi/English from Indian sources)
 */
export const getTopHeadlines = async (
  category?:
    | "business"
    | "entertainment"
    | "general"
    | "health"
    | "science"
    | "sports"
    | "technology"
): Promise<Article[]> => {
  try {
    console.log("Fetching top headlines for India...");

    // Try multiple endpoints to get more articles
    const promises = [
      // Top stories endpoint
      externalNewsApi.get("/news/top", {
        params: {
          api_token: API_KEY,
          language: "en",
          limit: 25,
          ...(category &&
            category !== "general" && {
              categories: category === "technology" ? "tech" : category,
            }),
        },
      }),
      // All news endpoint for broader results
      externalNewsApi.get("/news/all", {
        params: {
          api_token: API_KEY,
          search: "India",
          language: "en",
          limit: 25,
          ...(category &&
            category !== "general" && {
              categories: category === "technology" ? "tech" : category,
            }),
        },
      }),
    ];

    const responses = await Promise.allSettled(promises);
    let allArticles: any[] = [];

    responses.forEach((result) => {
      if (result.status === "fulfilled" && result.value.data?.data) {
        allArticles = allArticles.concat(result.value.data.data);
      }
    });

    // Remove duplicates based on title
    const uniqueArticles = allArticles.filter(
      (article, index, self) =>
        index === self.findIndex((a) => a.title === article.title)
    );

    if (uniqueArticles.length > 0) {
      const articles = uniqueArticles
        .filter(
          (article: any) => article.title && article.title !== "[Removed]"
        )
        .slice(0, 20) // Limit to 20 articles
        .map(mapTheNewsApiArticleToAppArticle);

      console.log(`Fetched ${articles.length} articles from TheNewsAPI`);
      return articles;
    }

    return [];
  } catch (error: any) {
    console.error(
      "Error fetching top headlines:",
      error.response?.data || error.message
    );

    // Return sample data for development if API fails
    return getSampleArticles();
  }
};

/**
 * Fetches articles in specific language (Hindi/English) using everything endpoint
 */
export const getArticlesByLanguage = async (
  language: "hi" | "en",
  query: string = "India"
): Promise<Article[]> => {
  try {
    console.log(`Fetching articles in ${language} language...`);

    // For Hindi, try different search terms and broader approach
    const searchTerms =
      language === "hi"
        ? ["भारत", "हिंदी", "समाचार", "दिल्ली", "मुंबई", "India"]
        : [query, "India", "Indian"];

    const promises = searchTerms.map((searchTerm) =>
      externalNewsApi.get("/news/all", {
        params: {
          api_token: API_KEY,
          search: searchTerm,
          language: language,
          sort: "published_at",
          limit: 20,
        },
      })
    );

    const responses = await Promise.allSettled(promises);
    let allArticles: any[] = [];

    responses.forEach((result) => {
      if (result.status === "fulfilled" && result.value.data?.data) {
        allArticles = allArticles.concat(result.value.data.data);
      }
    });

    // Remove duplicates and filter
    const uniqueArticles = allArticles.filter(
      (article, index, self) =>
        index === self.findIndex((a) => a.title === article.title)
    );

    if (uniqueArticles.length > 0) {
      const articles = uniqueArticles
        .filter(
          (article: any) => article.title && article.title !== "[Removed]"
        )
        .slice(0, 15)
        .map(mapTheNewsApiArticleToAppArticle);

      console.log(`Fetched ${articles.length} articles in ${language}`);
      return articles;
    }

    // If no Hindi articles found, return some sample Hindi articles
    if (language === "hi") {
      return getSampleHindiArticles();
    }

    return [];
  } catch (error: any) {
    console.error(
      `Error fetching ${language} articles:`,
      error.response?.data || error.message
    );

    if (language === "hi") {
      return getSampleHindiArticles();
    }
    return [];
  }
};

/**
 * Search articles with a specific query
 */
export const searchArticles = async (query: string): Promise<Article[]> => {
  try {
    const response = await externalNewsApi.get("/news/all", {
      params: {
        api_token: API_KEY,
        search: query,
        language: "hi,en", // Both Hindi and English
        sort: "published_at",
        limit: 20,
      },
    });

    if (response.data && response.data.data) {
      return response.data.data
        .filter(
          (article: any) => article.title && article.title !== "[Removed]"
        )
        .map(mapTheNewsApiArticleToAppArticle);
    }

    return [];
  } catch (error: any) {
    console.error(
      "Error searching articles:",
      error.response?.data || error.message
    );
    return [];
  }
};

/**
 * Sample articles for development/fallback
 */
const getSampleArticles = (): Article[] => {
  return [
    {
      id: "1",
      title:
        "भारत में डिजिटल इनोवेशन का नया दौर / New Era of Digital Innovation in India",
      thumbnail: "https://picsum.photos/800/400?random=1",
      category: "Tech",
      description:
        "भारत में तकनीकी क्रांति के नए आयाम / New dimensions of technological revolution in India",
      author: "Tech Reporter",
      timeAgo: "2 घंटे पहले / 2h ago",
      source: "Sample News",
    },
    {
      id: "2",
      title: "Economic Growth और Digital Payments का भविष्य",
      thumbnail: "https://picsum.photos/800/400?random=2",
      category: "Business",
      description: "भारतीय अर्थव्यवस्था में डिजिटल भुगतान की बढ़ती भूमिका",
      author: "Economic Times",
      timeAgo: "4 घंटे पहले / 4h ago",
      source: "Sample Business",
    },
    {
      id: "3",
      title: "Bollywood Updates: Latest Entertainment News",
      thumbnail: "https://picsum.photos/800/400?random=3",
      category: "Entertainment",
      description:
        "Latest updates from Hindi film industry and entertainment world",
      author: "Entertainment Desk",
      timeAgo: "6h ago",
      source: "Sample Entertainment",
    },
  ];
};

/**
 * Sample Hindi articles for fallback
 */
const getSampleHindiArticles = (): Article[] => {
  return [
    {
      id: "hi1",
      title: "भारत में शिक्षा क्षेत्र में नई क्रांति",
      thumbnail: "https://picsum.photos/800/400?random=11",
      category: "General",
      description:
        "भारतीय शिक्षा प्रणाली में डिजिटल तकनीक का बढ़ता प्रभाव और नई संभावनाएं",
      author: "शिक्षा संवाददाता",
      timeAgo: "1 घंटा पहले",
      source: "हिंदी समाचार",
    },
    {
      id: "hi2",
      title: "दिल्ली में वायु प्रदूषण की समस्या और समाधान",
      thumbnail: "https://picsum.photos/800/400?random=12",
      category: "Health",
      description:
        "राष्ट्रीय राजधानी में बढ़ते प्रदूषण के कारण और सरकारी प्रयास",
      author: "पर्यावरण रिपोर्टर",
      timeAgo: "3 घंटे पहले",
      source: "स्वास्थ्य समाचार",
    },
    {
      id: "hi3",
      title: "भारतीय क्रिकेट टीम की जीत",
      thumbnail: "https://picsum.photos/800/400?random=13",
      category: "Sports",
      description:
        "अंतर्राष्ट्रीय मैच में भारत की शानदार जीत और खिलाड़ियों का प्रदर्शन",
      author: "खेल संवाददाता",
      timeAgo: "5 घंटे पहले",
      source: "खेल समाचार",
    },
    {
      id: "hi4",
      title: "बॉलीवुड में नए ट्रेंड और फिल्म इंडस्ट्री का भविष्य",
      thumbnail: "https://picsum.photos/800/400?random=14",
      category: "Entertainment",
      description: "हिंदी सिनेमा में आने वाले बदलाव और नई फिल्मों की घोषणा",
      author: "मनोरंजन डेस्क",
      timeAgo: "7 घंटे पहले",
      source: "मनोरंजन समाचार",
    },
    {
      id: "hi5",
      title: "भारतीय स्टार्टअप्स की सफलता की कहानी",
      thumbnail: "https://picsum.photos/800/400?random=15",
      category: "Business",
      description: "देश के युवा उद्यमियों की सफलता और नवाचार की कहानियां",
      author: "व्यापार संवाददाता",
      timeAgo: "9 घंटे पहले",
      source: "व्यापार समाचार",
    },
  ];
};

export default {
  getTopHeadlines,
  getArticlesByLanguage,
  searchArticles,
  getFullArticleContent,
};
