# News API - Quick Reference Guide

## Setup

### 1. Environment Variables
Add to `.env` file:
```env
VITE_NEWS_API_KEY=F7NzUjVFm6T4xrFSa6ZnvR3qt0GqQvqx5f1Ko0FX
VITE_NEWS_API_BASE_URL=https://api.thenewsapi.com/v1
```

### 2. Import the Service
```typescript
import { 
  getTopHeadlines, 
  getArticlesByLanguage, 
  searchArticles,
  getFullArticleContent 
} from '@/services/externalNewsApi';
import { Article } from '@/types/news';
```

## API Functions

### Get Top Headlines
```typescript
// All categories
const articles: Article[] = await getTopHeadlines();

// Specific category
const techNews: Article[] = await getTopHeadlines('technology');
```

**Available Categories:**
- `business`
- `entertainment`
- `general`
- `health`
- `science`
- `sports`
- `technology`

### Get Articles by Language
```typescript
// English articles about India
const englishNews: Article[] = await getArticlesByLanguage('en', 'India');

// Hindi articles
const hindiNews: Article[] = await getArticlesByLanguage('hi', 'भारत समाचार');
```

**Supported Languages:**
- `'en'` - English
- `'hi'` - Hindi

### Search Articles
```typescript
// Search with bilingual support
const results: Article[] = await searchArticles('cricket');
const hindiResults: Article[] = await searchArticles('क्रिकेट');
```

### Get Full Article Content
```typescript
const articleId = 'some-uuid-from-article';
const fullContent: string | null = await getFullArticleContent(articleId);

if (fullContent) {
  console.log('Full article:', fullContent);
} else {
  // Fall back to description
  console.log('Description only:', article.description);
}
```

## Article Type

```typescript
interface Article {
  id: string;                  // UUID from API
  title: string;               // Article headline
  thumbnail: string;           // Image URL
  category: string;            // Business, Tech, Sports, etc.
  description?: string;        // Article summary/content
  author?: string;             // Source name or author
  timeAgo?: string;            // "2 घंटे पहले / 2h ago"
  url?: string;                // Original article URL
  source?: string;             // News source name
}
```

## Usage in Components

### Basic News List Component
```typescript
import { useState, useEffect } from 'react';
import { getTopHeadlines } from '@/services/externalNewsApi';
import { Article } from '@/types/news';

function NewsList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const data = await getTopHeadlines('technology');
        setArticles(data);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {articles.map((article) => (
        <div key={article.id}>
          <img src={article.thumbnail} alt={article.title} />
          <h3>{article.title}</h3>
          <p>{article.description}</p>
          <span>{article.timeAgo}</span>
        </div>
      ))}
    </div>
  );
}
```

### Category Filter Component
```typescript
const categories = [
  { label: 'All', value: 'all' },
  { label: 'Hindi', value: 'hindi' },
  { label: 'Tech', value: 'technology' },
  { label: 'Business', value: 'business' },
  { label: 'Sports', value: 'sports' },
];

function NewsWithFilter() {
  const [category, setCategory] = useState('all');
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      let data: Article[];
      
      if (category === 'all') {
        data = await getTopHeadlines();
      } else if (category === 'hindi') {
        data = await getArticlesByLanguage('hi', 'भारत');
      } else {
        data = await getTopHeadlines(category as any);
      }
      
      setArticles(data);
    };

    fetchNews();
  }, [category]);

  return (
    <div>
      <div>
        {categories.map((cat) => (
          <button 
            key={cat.value}
            onClick={() => setCategory(cat.value)}
          >
            {cat.label}
          </button>
        ))}
      </div>
      
      {/* Render articles */}
    </div>
  );
}
```

### Search Component
```typescript
function NewsSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Article[]>([]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    try {
      const data = await searchArticles(query);
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search news..."
      />
      <button onClick={handleSearch}>Search</button>
      
      <div>
        {results.map((article) => (
          <div key={article.id}>{article.title}</div>
        ))}
      </div>
    </div>
  );
}
```

## Navigation Pattern

### From News List to Detail
```typescript
import { useNavigate } from 'react-router-dom';

function NewsCard({ article }: { article: Article }) {
  const navigate = useNavigate();

  const handleClick = () => {
    // Save article to sessionStorage for detail page
    sessionStorage.setItem('currentArticle', JSON.stringify(article));
    
    // Navigate to detail page
    navigate(`/news/${article.id}`);
  };

  return (
    <div onClick={handleClick} style={{ cursor: 'pointer' }}>
      <h3>{article.title}</h3>
    </div>
  );
}
```

### In Detail Page
```typescript
import { useEffect, useState } from 'react';
import { Article } from '@/types/news';
import { getFullArticleContent } from '@/services/externalNewsApi';

function NewsDetail() {
  const [article, setArticle] = useState<Article | null>(null);
  const [fullContent, setFullContent] = useState('');

  useEffect(() => {
    // Retrieve article from sessionStorage
    const cached = sessionStorage.getItem('currentArticle');
    if (cached) {
      const parsedArticle: Article = JSON.parse(cached);
      setArticle(parsedArticle);
      
      // Try to get full content
      if (parsedArticle.id) {
        getFullArticleContent(parsedArticle.id).then((content) => {
          if (content) setFullContent(content);
        });
      }
    }
  }, []);

  if (!article) return <div>Loading...</div>;

  return (
    <div>
      <h1>{article.title}</h1>
      <img src={article.thumbnail} alt={article.title} />
      <p>{fullContent || article.description}</p>
      <a href={article.url} target="_blank">Read Original</a>
    </div>
  );
}
```

## Error Handling

### With Try-Catch
```typescript
try {
  const articles = await getTopHeadlines();
  setArticles(articles);
} catch (error) {
  console.error('Failed to fetch news:', error);
  toast.error('Failed to load news. Please try again.');
  // Use fallback data or show error state
}
```

### With Loading States
```typescript
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

const fetchNews = async () => {
  try {
    setLoading(true);
    setError(null);
    const data = await getTopHeadlines();
    setArticles(data);
  } catch (err) {
    setError('Failed to load news');
  } finally {
    setLoading(false);
  }
};

// Render
if (loading) return <Spinner />;
if (error) return <ErrorMessage message={error} />;
return <NewsList articles={articles} />;
```

## Best Practices

### 1. Handle Empty Results
```typescript
const articles = await getTopHeadlines();

if (articles.length === 0) {
  // Show "No articles found" message
  return <EmptyState />;
}
```

### 2. Handle Missing Images
```tsx
<img
  src={article.thumbnail}
  alt={article.title}
  onError={(e) => {
    e.currentTarget.src = 'https://via.placeholder.com/400x300?text=News';
  }}
/>
```

### 3. Truncate Long Text
```tsx
<p className="line-clamp-3">
  {article.description}
</p>
```

### 4. Category Badge Styling
```typescript
const categoryColors = {
  Business: 'bg-blue-100 text-blue-600',
  Tech: 'bg-purple-100 text-purple-600',
  Sports: 'bg-green-100 text-green-600',
  Entertainment: 'bg-pink-100 text-pink-600',
  Politics: 'bg-red-100 text-red-600',
  General: 'bg-gray-100 text-gray-600',
};

<span className={`px-2 py-1 rounded-full ${categoryColors[article.category]}`}>
  {article.category}
</span>
```

## API Limits

- **Free Tier:** 250 requests per day
- **Rate Limit:** Reasonable usage (not documented)
- **Response Time:** Usually < 1 second

## Troubleshooting

### No Articles Returned
1. Check API key in `.env` file
2. Verify internet connection
3. Check console for API errors
4. Try different category or search term

### Images Not Loading
- Some articles may not have images
- Use placeholder images with `onError` handler
- Verify image URLs in API response

### Slow Loading
- Reduce `limit` parameter (default 20-25)
- Implement pagination instead of loading all at once
- Add loading skeletons for better UX

### Hindi Articles Not Found
- Use Hindi search terms: "भारत", "समाचार", "हिंदी"
- Some days may have fewer Hindi articles available
- Falls back to sample articles automatically

## Support

For API issues:
- TheNewsAPI Documentation: https://www.thenewsapi.com/documentation
- Support: Contact through TheNewsAPI website

For app issues:
- Check `NEWS_API_INTEGRATION.md` for detailed integration docs
- Review error logs in browser console
- Verify environment variables are set correctly
