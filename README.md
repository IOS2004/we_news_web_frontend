# WeNews Web Frontend

A modern, responsive web application for WeNews built with **React**, **Vite**, **TypeScript**, and **Tailwind CSS**.

## 🚀 Features

- ✅ **Authentication** - Sign in/Sign up with JWT
- ✅ **Dashboard** - Overview of earnings, wallet, referrals
- ✅ **News System** - Read news articles and earn rewards
- ✅ **Trading** - Color & Number games
- ✅ **Wallet** - Balance, transactions, add money
- ✅ **Network/Referral** - View referral tree and earnings
- ✅ **Investment Plans** - Purchase and manage plans
- ✅ **Withdrawals** - Request and track withdrawals
- ✅ **Responsive Design** - Works on mobile, tablet, and desktop

## 📋 Prerequisites

- **Node.js** >= 16.0.0
- **npm** or **yarn**
- Backend API running (see `../backend/backend/README.md`)

## 🛠️ Installation

### 1. Clone and Navigate

```bash
cd web-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=https://wenews.onrender.com/api
VITE_APP_NAME=WeNews
VITE_APP_VERSION=1.0.0
VITE_CASHFREE_APP_ID=your_cashfree_app_id
VITE_CASHFREE_MODE=sandbox
```

For local development:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 🏗️ Project Structure

```
web-frontend/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── common/       # Button, Card, Input, etc.
│   │   └── ...           # Feature-specific components
│   ├── contexts/         # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── WalletContext.tsx
│   ├── layouts/          # Page layouts
│   │   ├── AuthLayout.tsx
│   │   └── MainLayout.tsx
│   ├── pages/            # Route pages
│   │   ├── auth/
│   │   ├── Dashboard.tsx
│   │   ├── News.tsx
│   │   └── ...
│   ├── services/         # API service layer
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── walletService.ts
│   │   └── ...
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Helper functions
│   ├── config/           # App configuration
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── index.html            # HTML template
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 📦 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **React Router v6** - Routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Icons
- **date-fns** - Date formatting

## 🎨 Design System

### Colors

- **Primary**: `#FF6B35` (Orange)
- **Secondary**: `#2C3E50` (Dark Blue)
- **Accent**: `#3498DB` (Blue)
- **Success**: `#27AE60` (Green)
- **Warning**: `#F39C12` (Yellow)
- **Danger**: `#E74C3C` (Red)

### Typography

- **Display Font**: Poppins
- **Body Font**: Inter

## 🔌 API Integration

All API calls are centralized in the `services/` directory:

```typescript
// Example: Login
import { authService } from "@/services/authService";

const { user, token } = await authService.login({
  email: "user@example.com",
  password: "password123",
});
```

### Available Services

- `authService` - Authentication (login, signup, profile)
- `walletService` - Wallet operations
- `newsService` - News articles
- `planService` - Investment plans
- `tradingService` - Trading games
- `referralService` - Network/referral
- `withdrawalService` - Withdrawal requests
- `dashboardService` - Dashboard stats

## 🔐 Authentication

The app uses JWT token authentication:

1. User logs in → receives JWT token
2. Token stored in `localStorage`
3. Token automatically added to all API requests
4. Protected routes check authentication status

```typescript
// Using auth context
import { useAuth } from "@/contexts/AuthContext";

const { user, isAuthenticated, login, logout } = useAuth();
```

## 📱 Responsive Design

The app is fully responsive with breakpoints:

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🧪 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Code Style

- Use **functional components** with hooks
- Use **TypeScript** for type safety
- Follow **Tailwind CSS** utility-first approach
- Keep components **small and focused**
- Use **custom hooks** for reusable logic

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

### Environment Variables

Make sure to set environment variables in your hosting platform:

- `VITE_API_BASE_URL`
- `VITE_CASHFREE_APP_ID`
- `VITE_CASHFREE_MODE`

## 🔄 State Management

- **Auth State**: Managed by `AuthContext`
- **Wallet State**: Managed by `WalletContext`
- **Local State**: React `useState` hook
- **Server State**: Direct API calls with loading/error handling

## 🎯 Roadmap

### Completed ✅

- [x] Project setup with Vite + React + TypeScript
- [x] Authentication pages (Sign In/Sign Up)
- [x] Main layout with sidebar navigation
- [x] Dashboard page with stats
- [x] API service layer
- [x] Context providers (Auth, Wallet)
- [x] Common UI components
- [x] Responsive design foundation

### To Do 🚧

- [ ] Complete News page with article list
- [ ] News detail page with reading rewards
- [ ] Trading page with Color & Number games
- [ ] Wallet page with transaction history
- [ ] Add money integration (Cashfree)
- [ ] Network page with referral tree
- [ ] Investment plans page
- [ ] Withdrawal request & history
- [ ] Profile & Settings pages
- [ ] Real-time notifications
- [ ] Advanced filtering & search
- [ ] Dark mode support
- [ ] PWA support
- [ ] Performance optimization
- [ ] Unit & Integration tests

## 📖 Documentation

- [Backend API Docs](../backend/backend/API_DOCUMENTATION.md)
- [MLM Dashboard API](../backend/MLM_DASHBOARD_API_DOCUMENTATION.md)
- [Trading Integration](../backend/TRADING_INTEGRATION_SUMMARY.md)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

Private - WeNews © 2024

## 🆘 Support

For issues or questions, contact the development team.

---

**Built with ❤️ by the WeNews Team**
