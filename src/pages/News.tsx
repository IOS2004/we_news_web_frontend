import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTopHeadlines, getArticlesByLanguage } from '@/services/externalNewsApi';
import { Article } from '@/types/news';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const categories = [
  { label: 'All', value: 'all' },
  { label: 'हिंदी / Hindi', value: 'hindi' },
  { label: 'Tech', value: 'technology' },
  { label: 'Business', value: 'business' },
  { label: 'Sports', value: 'sports' },
  { label: 'Entertainment', value: 'entertainment' },
];

export default function News() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'News - WeNews';
  }, []);

  useEffect(() => {
    fetchArticles(selectedCategory);
  }, [selectedCategory]);

  const fetchArticles = async (category: string) => {
    try {
      setLoading(true);
      setError(null);

      let fetchedArticles: Article[] = [];

      if (category === 'all') {
        fetchedArticles = await getTopHeadlines();
      } else if (category === 'hindi') {
        fetchedArticles = await getArticlesByLanguage('hi', 'भारत समाचार');
      } else {
        fetchedArticles = await getTopHeadlines(category as any);
      }

      setArticles(fetchedArticles);
      
      if (fetchedArticles.length === 0) {
        setError('No news available for this category');
      }
    } catch (err: any) {
      console.error('Error fetching articles:', err);
      setError('Error loading news. Please try again.');
      toast.error('Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  const handleArticleClick = (article: Article) => {
    // Save article to sessionStorage for the detail page
    sessionStorage.setItem('currentArticle', JSON.stringify(article));
    navigate(`/news/${article.id || encodeURIComponent(article.url || article.title)}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">News</h1>
        <p className="text-muted-foreground">Stay updated with latest news</p>
      </div>

      {/* Category Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => setSelectedCategory(category.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category.value
                ? 'bg-primary text-white'
                : 'bg-card text-foreground hover:bg-accent'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">{error}</p>
          <button
            onClick={() => fetchArticles(selectedCategory)}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      )}

      {/* Articles Grid */}
      {!loading && !error && articles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <div
              key={article.id || article.url || index}
              className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden group bg-card rounded-lg border"
              onClick={() => handleArticleClick(article)}
            >
              {/* Article Image */}
              {article.thumbnail && (
                <div className="w-full h-48 overflow-hidden">
                  <img
                    src={article.thumbnail}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=News';
                    }}
                  />
                </div>
              )}

              {/* Article Content */}
              <div className="p-4">
                {/* Category & Time */}
                <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
                  <span className="px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                    {article.category}
                  </span>
                  <span>{article.timeAgo}</span>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>

                {/* Description */}
                {article.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                    {article.description}
                  </p>
                )}

                {/* Read More Button */}
                <div className="flex items-center text-primary text-sm font-medium">
                  <span>Read more</span>
                  <svg
                    className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && articles.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">No articles found</p>
        </div>
      )}
    </div>
  );
}
