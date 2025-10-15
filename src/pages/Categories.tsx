import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Folder,
  TrendingUp,
  Newspaper,
  DollarSign,
  Globe,
  Cpu,
  Heart,
  Film,
  Zap,
  Trophy,
  Briefcase,
  ChevronRight
} from 'lucide-react';
import { newsApi, NewsCategory } from '../services/newsApi';

const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await newsApi.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('business')) return Briefcase;
    if (name.includes('tech')) return Cpu;
    if (name.includes('finance') || name.includes('money')) return DollarSign;
    if (name.includes('sport')) return Trophy;
    if (name.includes('entertainment') || name.includes('movie')) return Film;
    if (name.includes('health')) return Heart;
    if (name.includes('world') || name.includes('global')) return Globe;
    if (name.includes('trend')) return TrendingUp;
    if (name.includes('breaking') || name.includes('flash')) return Zap;
    return Newspaper;
  };

  const getCategoryColor = (index: number) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-orange-500 to-orange-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
      'from-red-500 to-red-600',
      'from-teal-500 to-teal-600',
      'from-yellow-500 to-yellow-600',
      'from-cyan-500 to-cyan-600',
    ];
    return colors[index % colors.length];
  };

  const handleCategoryClick = (category: NewsCategory) => {
    navigate(`/news?category=${category.slug}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Folder className="w-8 h-8 text-blue-600" />
          News Categories
        </h1>
        <p className="text-gray-600 mt-1">Browse news by topic</p>
      </div>

      {/* Stats Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Explore Topics</h2>
            <p className="text-blue-100">
              Discover news from {categories.length} different categories
            </p>
          </div>
          <div className="text-4xl font-bold">
            {categories.reduce((sum, cat) => sum + cat.articleCount, 0)}
            <div className="text-sm font-normal text-blue-100">Total Articles</div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories found</h3>
          <p className="text-gray-600">Categories will appear here once they are created</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            const Icon = getCategoryIcon(category.name);
            const colorClass = getCategoryColor(index);

            return (
              <div
                key={category._id}
                onClick={() => handleCategoryClick(category)}
                className="group cursor-pointer"
              >
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all transform hover:-translate-y-1">
                  {/* Category Header with Gradient */}
                  <div className={`bg-gradient-to-r ${colorClass} p-6 relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                      <Icon className="w-12 h-12 text-white mb-3" />
                      <h3 className="text-xl font-bold text-white mb-1">{category.name}</h3>
                    </div>
                  </div>

                  {/* Category Content */}
                  <div className="p-4">
                    {category.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {category.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {category.articleCount}
                        </div>
                        <div className="text-xs text-gray-500">Articles</div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Popular Categories Section */}
      {!loading && categories.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-orange-600" />
            Most Popular Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories
              .sort((a, b) => b.articleCount - a.articleCount)
              .slice(0, 6)
              .map((category) => {
                const Icon = getCategoryIcon(category.name);
                return (
                  <div
                    key={category._id}
                    onClick={() => handleCategoryClick(category)}
                    className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-gray-200"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-600">{category.articleCount} articles</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {!loading && categories.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-3xl font-bold text-blue-600 mb-1">{categories.length}</div>
            <div className="text-sm text-gray-600">Total Categories</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {categories.filter((c) => c.isActive).length}
            </div>
            <div className="text-sm text-gray-600">Active Categories</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {categories.reduce((sum, cat) => sum + cat.articleCount, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Articles</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {Math.round(
                categories.reduce((sum, cat) => sum + cat.articleCount, 0) / categories.length
              )}
            </div>
            <div className="text-sm text-gray-600">Avg per Category</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
