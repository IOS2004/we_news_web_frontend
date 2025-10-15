import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Eye,
  Heart,
  Clock,
  Flame,
  ChevronRight,
  Bookmark,
  Trophy
} from 'lucide-react';
import { newsApi, NewsArticle } from '../services/newsApi';

const Trending = () => {
  const navigate = useNavigate();
  const [trendingArticles, setTrendingArticles] = useState<NewsArticle[]>([]);
  const [popularArticles, setPopularArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('week');

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [trending, popular] = await Promise.all([
        newsApi.getTrendingArticles(20),
        newsApi.getPopularArticles(selectedPeriod, 10),
      ]);
      setTrendingArticles(trending);
      setPopularArticles(popular);
    } catch (error) {
      console.error('Error loading trending data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArticleClick = (articleId: string) => {
    navigate(`/news/${articleId}`);
  };

  const handleBookmark = async (e: React.MouseEvent, articleId: string) => {
    e.stopPropagation();
    try {
      await newsApi.bookmarkArticle(articleId);
      loadData();
    } catch (error) {
      console.error('Error bookmarking article:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Flame className="w-8 h-8 text-orange-600" />
          Trending News
        </h1>
        <p className="text-gray-600 mt-1">What's hot right now</p>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-700 mr-4">Time Period:</span>
          <div className="flex gap-2">
            {(['today', 'week', 'month'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading trending news...</p>
        </div>
      ) : (
        <>
          {/* Top Trending Article */}
          {trendingArticles.length > 0 && (
            <div
              onClick={() => handleArticleClick(trendingArticles[0]._id)}
              className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
            >
              <div className="relative">
                {trendingArticles[0].image && (
                  <img
                    src={trendingArticles[0].image}
                    alt={trendingArticles[0].title}
                    className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full flex items-center gap-2 font-bold shadow-lg">
                  <Flame className="w-5 h-5" />
                  #1 Trending
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {trendingArticles[0].category}
                  </span>
                  <span className="text-sm text-gray-500">{formatDate(trendingArticles[0].publishedAt)}</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {trendingArticles[0].title}
                </h2>
                {trendingArticles[0].summary && (
                  <p className="text-gray-600 mb-4 text-lg">{trendingArticles[0].summary}</p>
                )}
                <div className="flex items-center gap-6 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    {trendingArticles[0].views.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    {trendingArticles[0].likes.toLocaleString()}
                  </div>
                  <button
                    onClick={(e) => handleBookmark(e, trendingArticles[0]._id)}
                    className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                  >
                    <Bookmark className="w-5 h-5" />
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Trending Grid */}
          {trendingArticles.length > 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                Trending Now
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingArticles.slice(1, 10).map((article, index) => (
                  <div
                    key={article._id}
                    onClick={() => handleArticleClick(article._id)}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <div className="relative">
                      {article.image && (
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                      <div className="absolute top-2 left-2 bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                        #{index + 2}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {article.category}
                        </span>
                        <span className="text-xs text-gray-500">{formatDate(article.publishedAt)}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {article.title}
                      </h3>
                      {article.summary && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{article.summary}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {article.views > 1000 ? `${(article.views / 1000).toFixed(1)}k` : article.views}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {article.likes}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Most Popular Section */}
          {popularArticles.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-600" />
                Most Popular {selectedPeriod === 'today' ? 'Today' : `This ${selectedPeriod}`}
              </h2>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
                {popularArticles.map((article, index) => (
                  <div
                    key={article._id}
                    onClick={() => handleArticleClick(article._id)}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors flex items-start gap-4"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    {article.image && (
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {article.category}
                        </span>
                        <span className="text-xs text-gray-500">{formatDate(article.publishedAt)}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{article.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {article.views.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {article.likes.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Trending;
