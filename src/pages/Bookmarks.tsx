import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bookmark,
  X,
  Search,
  Filter,
  Calendar,
  Eye,
  Heart,
  Clock,
  ChevronRight
} from 'lucide-react';
import { newsApi, BookmarkedArticle } from '../services/newsApi';

const Bookmarks = () => {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<BookmarkedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'oldest'>('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadBookmarks();
  }, [selectedCategory, sortBy, currentPage]);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const filters = {
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        page: currentPage,
        limit: 20,
        sort: sortBy,
      };
      const data = await newsApi.getBookmarkedArticles(filters);
      setBookmarks(data.articles);
      setTotalPages(data.pages);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (articleId: string) => {
    try {
      await newsApi.removeBookmark(articleId);
      setBookmarks(bookmarks.filter((article) => article._id !== articleId));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  const handleArticleClick = (articleId: string) => {
    navigate(`/news/${articleId}`);
  };

  const filteredBookmarks = bookmarks.filter((article) =>
    searchQuery === '' ||
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.summary?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Bookmark className="w-8 h-8 text-blue-600" />
          Saved Articles
        </h1>
        <p className="text-gray-600 mt-1">Your bookmarked articles</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'latest' | 'oldest')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Bookmark className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Saved</div>
              <div className="text-xl font-bold text-gray-900">{bookmarks.length}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Views</div>
              <div className="text-xl font-bold text-gray-900">
                {bookmarks.reduce((sum, article) => sum + article.views, 0)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Likes</div>
              <div className="text-xl font-bold text-gray-900">
                {bookmarks.reduce((sum, article) => sum + article.likes, 0)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">This Week</div>
              <div className="text-xl font-bold text-gray-900">
                {bookmarks.filter((article) => {
                  const bookmarkedDate = new Date(article.bookmarkedAt);
                  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                  return bookmarkedDate >= weekAgo;
                }).length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bookmarks List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading bookmarks...</p>
        </div>
      ) : filteredBookmarks.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Bookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookmarks yet</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery
              ? 'No bookmarks match your search'
              : 'Start bookmarking articles to read them later'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => navigate('/news')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse News
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookmarks.map((article) => (
            <div
              key={article._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="flex">
                {/* Image */}
                {article.image && (
                  <div className="w-48 h-48 flex-shrink-0">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 pr-4">
                      <h2
                        onClick={() => handleArticleClick(article._id)}
                        className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer line-clamp-2"
                      >
                        {article.title}
                      </h2>
                      {article.summary && (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{article.summary}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveBookmark(article._id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove bookmark"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {article.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(article.publishedAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {article.views}
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {article.likes}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Bookmarked on {formatDate(article.bookmarkedAt)}
                    </div>
                    <button
                      onClick={() => handleArticleClick(article._id)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      Read Article
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Bookmarks;
