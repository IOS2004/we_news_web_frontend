import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { newsService } from '@/services/newsService';
import { getFullArticleContent } from '@/services/externalNewsApi';
import { Article } from '@/types/news';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { ExternalLink, Share2, ArrowLeft, Clock } from 'lucide-react';

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [fullContent, setFullContent] = useState<string>('');
  const [readingTime, setReadingTime] = useState(0);
  const [hasEarnedReward, setHasEarnedReward] = useState(false);

  useEffect(() => {
    if (id) {
      fetchArticleDetail(id);
    }
  }, [id]);

  // Track reading time for reward
  useEffect(() => {
    if (!article || hasEarnedReward) return;

    const interval = setInterval(() => {
      setReadingTime((prev) => {
        const newTime = prev + 1;
        
        // Award reading reward after 30 seconds
        if (newTime >= 30 && !hasEarnedReward) {
          awardReadingReward();
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [article, hasEarnedReward]);

  const fetchArticleDetail = async (_articleId: string) => {
    try {
      setLoading(true);
      
      // Try to get article from sessionStorage first (passed from News page)
      const cachedArticle = sessionStorage.getItem('currentArticle');
      if (cachedArticle) {
        const parsedArticle: Article = JSON.parse(cachedArticle);
        setArticle(parsedArticle);
        
        // Try to fetch full content if available
        if (parsedArticle.id) {
          const fullText = await getFullArticleContent(parsedArticle.id);
          if (fullText) {
            setFullContent(fullText);
          } else {
            setFullContent(parsedArticle.description || '');
          }
        } else {
          setFullContent(parsedArticle.description || '');
        }
      } else {
        // If no cached article, redirect back to news
        toast.error('Article not found');
        navigate('/news');
      }
    } catch (err: any) {
      console.error('Error fetching article:', err);
      toast.error('Failed to load article');
      navigate('/news');
    } finally {
      setLoading(false);
    }
  };

  const awardReadingReward = async () => {
    try {
      // Call API to award reading reward
      const articleId = article!.id || article!.url || '';
      if (articleId) {
        await newsService.markAsRead(articleId);
        setHasEarnedReward(true);
        toast.success('Reading reward earned! ₹2 added to your wallet');
      }
    } catch (error) {
      console.error('Failed to award reading reward:', error);
    }
  };

  const handleShare = async () => {
    if (!article) return;
    
    const shareUrl = article.url || window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.description,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleOpenOriginal = () => {
    if (article?.url) {
      window.open(article.url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">📰</div>
          <h2 className="text-2xl font-bold mb-2">Article Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/news')}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Back to News
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate('/news')}
        className="flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to News
      </button>

      {/* Article Card */}
      <Card className="overflow-hidden">
        {/* Article Image */}
        {article.thumbnail && (
          <div className="w-full h-96 overflow-hidden">
            <img
              src={article.thumbnail}
              alt={article.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Article Content */}
        <div className="p-8">
          {/* Source & Date */}
          <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                {article.category}
              </span>
              <span className="font-medium">{article.source || 'Unknown Source'}</span>
              {article.author && <span>By {article.author}</span>}
            </div>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {article.timeAgo}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-foreground mb-6 leading-tight">
            {article.title}
          </h1>

          {/* Reading Time Tracker */}
          {!hasEarnedReward && readingTime < 30 && (
            <div className="mb-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-primary">
                  Keep reading to earn rewards!
                </span>
                <span className="text-sm font-bold text-primary">
                  {30 - readingTime}s remaining
                </span>
              </div>
              <div className="w-full bg-primary/20 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${(readingTime / 30) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Reward Earned Badge */}
          {hasEarnedReward && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <div className="text-2xl">🎉</div>
              <div>
                <div className="font-semibold text-green-800">Reward Earned!</div>
                <div className="text-sm text-green-600">₹2 has been added to your wallet</div>
              </div>
            </div>
          )}

          {/* Full Content */}
          <div className="prose prose-lg max-w-none mb-6">
            <div className="text-foreground leading-relaxed whitespace-pre-wrap">
              {fullContent || article.description}
            </div>
          </div>

          {/* Truncated Content Notice */}
          {((fullContent || article.description || '').includes('[पूरा लेख पढ़ने के लिए') || 
            (fullContent || article.description || '').includes('Full article available')) && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <ExternalLink className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Continue Reading on Original Source
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    This is a preview. Click the button below to read the complete article on the publisher's website.
                  </p>
                  <button
                    onClick={handleOpenOriginal}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Read Full Article
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 pt-6 border-t">
            <button
              onClick={handleOpenOriginal}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
              Read Original Article
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-6 py-3 bg-card text-foreground rounded-lg hover:bg-accent transition-colors border"
            >
              <Share2 className="w-5 h-5" />
              Share Article
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
