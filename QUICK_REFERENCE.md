# WeNews Web Frontend - Quick Reference

## 🚀 Quick Commands

```powershell
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Key Files

| File                             | Purpose                         |
| -------------------------------- | ------------------------------- |
| `src/App.tsx`                    | Main app component with routing |
| `src/main.tsx`                   | Entry point                     |
| `src/config/index.ts`            | App configuration               |
| `src/contexts/AuthContext.tsx`   | Authentication state            |
| `src/contexts/WalletContext.tsx` | Wallet state                    |
| `src/services/api.ts`            | Axios instance & interceptors   |
| `src/types/index.ts`             | TypeScript types                |
| `.env`                           | Environment variables           |

## 🎨 Common UI Components

```tsx
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Input from '@/components/common/Input';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// Button
<Button variant="primary" onClick={handleClick}>Click Me</Button>

// Card
<Card hover padding="md">Content here</Card>

// Input
<Input
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={error}
  fullWidth
/>

// Loading
<LoadingSpinner size="md" fullScreen />
```

## 🔌 Using Services

```tsx
// Auth
import { authService } from "@/services/authService";
await authService.login({ email, password });

// Wallet
import { walletService } from "@/services/walletService";
const wallet = await walletService.getWallet();

// News
import { newsService } from "@/services/newsService";
const news = await newsService.getNews(1, 20);
```

## 🪝 Using Contexts

```tsx
// Auth
import { useAuth } from "@/contexts/AuthContext";
const { user, isAuthenticated, login, logout } = useAuth();

// Wallet
import { useWallet } from "@/contexts/WalletContext";
const { wallet, refreshWallet } = useWallet();
```

## 🎨 Tailwind Shortcuts

```tsx
// Custom classes defined in index.css
<button className="btn btn-primary">Button</button>
<div className="card card-hover">Card</div>
<input className="input" />
<span className="badge badge-success">Badge</span>
```

## 🛣️ Routes

| Route          | Component   | Description           |
| -------------- | ----------- | --------------------- |
| `/`            | Redirect    | → /dashboard          |
| `/auth/signin` | SignIn      | Login page            |
| `/auth/signup` | SignUp      | Registration page     |
| `/dashboard`   | Dashboard   | Main dashboard        |
| `/news`        | News        | News listing          |
| `/news/:id`    | NewsDetail  | Article detail        |
| `/trading`     | Trading     | Trading games         |
| `/wallet`      | Wallet      | Wallet & transactions |
| `/network`     | Network     | Referral tree         |
| `/plans`       | Plans       | Investment plans      |
| `/profile`     | Profile     | User profile          |
| `/settings`    | Settings    | App settings          |
| `/withdrawals` | Withdrawals | Withdrawal requests   |

## 🔧 Helper Functions

```tsx
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  truncateText,
  copyToClipboard,
  isValidEmail,
  cn,
} from "@/utils/helpers";

// Examples
formatCurrency(1250.5); // ₹1,250.50
formatDate("2024-01-15"); // 15 Jan 2024
formatRelativeTime("2024-01-15T10:00:00"); // 2 hours ago
truncateText("Long text...", 50); // Long text...
cn("class1", condition && "class2"); // Conditional classes
```

## 🎯 Creating New Pages

1. Create component in `src/pages/`:

```tsx
// src/pages/MyPage.tsx
export default function MyPage() {
  return (
    <div>
      <h1 className="text-3xl font-display font-bold mb-6">My Page</h1>
      {/* Content */}
    </div>
  );
}
```

2. Add route in `src/App.tsx`:

```tsx
<Route path="/mypage" element={<MyPage />} />
```

## 🔐 Protected Routes

All routes inside `MainLayout` are automatically protected. Users must be authenticated to access them.

## 🌐 Environment Variables

Access via `import.meta.env`:

```tsx
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

## 📱 Responsive Breakpoints

```tsx
// Tailwind breakpoints
sm: '640px'   // Mobile landscape
md: '768px'   // Tablet
lg: '1024px'  // Desktop
xl: '1280px'  // Large desktop
2xl: '1536px' // Extra large

// Usage
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
  {/* Responsive grid */}
</div>
```

## 🎨 Color Palette

```css
primary: #FF6B35 (Orange)
secondary: #2C3E50 (Dark Blue)
accent: #3498DB (Blue)
success: #27AE60 (Green)
warning: #F39C12 (Yellow)
danger: #E74C3C (Red)
```

## 📦 Adding New Dependencies

```powershell
npm install package-name
npm install -D package-name  # dev dependency
```

## 🐛 Debugging

```tsx
// Enable in browser console
localStorage.setItem("debug", "true");

// API calls are logged in development
// Check Network tab in DevTools
```

---

**For detailed documentation, see [README.md](./README.md)**
