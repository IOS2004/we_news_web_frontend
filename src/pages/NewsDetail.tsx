import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { newsService } from '@/services/newsService';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatDate } from '@/utils/helpers';
import toast from 'react-hot-toast';

interface Article {
  id?: string;
  title: string;
  description: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source?: { id: string; name: string };
  author?: string;
  content?: string;
}

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

  const fetchArticleDetail = async (articleId: string) => {
    try {
      setLoading(true);
      
      // Decode URL if it's encoded
      const decodedId = decodeURIComponent(articleId);
      
      // Try to fetch full content from news service
      // For now, use description as content
      const content = 'Article content will be loaded here';
      setFullContent(content);
      
      // For now, we'll create a mock article since we might not have stored articles
      // In production, you'd fetch from your backend
      setArticle({
        id: decodedId,
        title: 'Article Title',
        description: content,
        url: decodedId,
        urlToImage: '',
        publishedAt: new Date().toISOString(),
        source: { id: '', name: 'News Source' },
        author: 'Unknown',
        content: content,
      });
    } catch (err: any) {
      console.error('Error fetching article:', err);
      toast.error('Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const awardReadingReward = async () => {
    try {
      // Call API to award reading reward
      await newsService.markAsRead(article!.id || article!.url);
      setHasEarnedReward(true);
      toast.success('Reading reward earned! ₹2 added to your wallet');
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
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to News
      </button>

      {/* Article Card */}
      <Card className="overflow-hidden">
        {/* Article Image */}
        {article.urlToImage && (
          <div className="w-full h-96 overflow-hidden">
            <img
              src={article.urlToImage}
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
              <span className="font-medium">{article.source?.name || 'Unknown Source'}</span>
              {article.author && <span>By {article.author}</span>}
            </div>
            <span>{formatDate(article.publishedAt)}</span>
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

          {/* Description */}
          {article.description && (
            <div className="text-lg text-muted-foreground mb-6 leading-relaxed">
              {article.description}
            </div>
          )}

          {/* Full Content */}
          <div className="prose prose-lg max-w-none mb-8">
            <div className="text-foreground leading-relaxed whitespace-pre-wrap">
              {fullContent || article.content || article.description}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 pt-6 border-t">
            <button
              onClick={handleOpenOriginal}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Read Original Article
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-6 py-3 bg-card text-foreground rounded-lg hover:bg-accent transition-colors border"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share Article
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
