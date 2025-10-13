# WeNews Web Frontend - Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        WeNews Web Application                        │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACE                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌───────────────┐  ┌──────────────┐  ┌──────────────────────┐    │
│  │  Auth Pages   │  │ Main Layout  │  │   Feature Pages      │    │
│  │               │  │              │  │                      │    │
│  │ • Sign In     │  │ • Sidebar    │  │ • Dashboard          │    │
│  │ • Sign Up     │  │ • Header     │  │ • News               │    │
│  │               │  │ • Navigation │  │ • Trading            │    │
│  └───────────────┘  └──────────────┘  │ • Wallet             │    │
│                                        │ • Network            │    │
│                                        │ • Plans              │    │
│                                        │ • Profile            │    │
│                                        │ • Settings           │    │
│                                        └──────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│                         COMPONENT LIBRARY                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐       │
│  │  Button  │  │   Card   │  │  Input   │  │   Loading    │       │
│  │          │  │          │  │          │  │              │       │
│  │ Variants │  │  Hover   │  │ Validate │  │   Spinner    │       │
│  │  Sizes   │  │ Padding  │  │  Error   │  │  Full Screen │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘       │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│                         ROUTING LAYER                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  React Router v6                                                     │
│  ┌─────────────────────────────────────────────────────────┐       │
│  │                                                           │       │
│  │  /                → Redirect to /dashboard               │       │
│  │  /auth/signin     → Sign In Page                         │       │
│  │  /auth/signup     → Sign Up Page                         │       │
│  │  /dashboard       → Dashboard (Protected)                │       │
│  │  /news            → News Listing (Protected)             │       │
│  │  /news/:id        → News Detail (Protected)              │       │
│  │  /trading         → Trading Games (Protected)            │       │
│  │  /wallet          → Wallet & Transactions (Protected)    │       │
│  │  /network         → Referral Network (Protected)         │       │
│  │  /plans           → Investment Plans (Protected)         │       │
│  │  /profile         → User Profile (Protected)             │       │
│  │  /settings        → App Settings (Protected)             │       │
│  │  /withdrawals     → Withdrawal Requests (Protected)      │       │
│  │                                                           │       │
│  └─────────────────────────────────────────────────────────┘       │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│                         STATE MANAGEMENT                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────┐          ┌──────────────────────┐        │
│  │   AuthContext        │          │   WalletContext      │        │
│  │                      │          │                      │        │
│  │  • user              │          │  • wallet            │        │
│  │  • isAuthenticated   │          │  • transactions      │        │
│  │  • login()           │          │  • refreshWallet()   │        │
│  │  • logout()          │          │  • addMoney()        │        │
│  │  • signUp()          │          │                      │        │
│  │  • updateUser()      │          │                      │        │
│  └──────────────────────┘          └──────────────────────┘        │
│                                                                       │
│  Local State (useState)                                              │
│  • Form data                                                         │
│  • UI state (modals, dropdowns)                                     │
│  • Loading states                                                    │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│                         SERVICE LAYER                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────┐   │
│  │  authService    │  │ walletService   │  │  newsService     │   │
│  │                 │  │                 │  │                  │   │
│  │ • login()       │  │ • getWallet()   │  │ • getNews()      │   │
│  │ • signUp()      │  │ • getTransac..()│  │ • getNewsById()  │   │
│  │ • getCurrent..()│  │ • addMoney()    │  │ • markAsRead()   │   │
│  │ • updateProf..()│  │ • verifyPaym..()│  │ • search()       │   │
│  └─────────────────┘  └─────────────────┘  └──────────────────┘   │
│                                                                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────┐   │
│  │ planService     │  │ tradingService  │  │ referralService  │   │
│  │                 │  │                 │  │                  │   │
│  │ • getPlans()    │  │ • placeTrade()  │  │ • getReferral..()│   │
│  │ • getUserInv..()│  │ • getHistory()  │  │ • getDirectRef()│   │
│  │ • purchasePlan()│  │ • getStats()    │  │ • getStats()     │   │
│  └─────────────────┘  └─────────────────┘  └──────────────────┘   │
│                                                                       │
│  ┌──────────────────┐  ┌──────────────────────────────────────┐   │
│  │ withdrawalService│  │     dashboardService                 │   │
│  │                  │  │                                      │   │
│  │ • requestWithd()│  │ • getDashboardStats()                │   │
│  │ • getHistory()   │  │ • getEarningsSummary()               │   │
│  │ • getPending()   │  │                                      │   │
│  └──────────────────┘  └──────────────────────────────────────┘   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│                         HTTP CLIENT                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Axios Instance (services/api.ts)                                    │
│  ┌─────────────────────────────────────────────────────────┐       │
│  │                                                           │       │
│  │  Request Interceptor:                                    │       │
│  │    • Add Authorization: Bearer <token>                   │       │
│  │    • Add Content-Type: application/json                  │       │
│  │                                                           │       │
│  │  Response Interceptor:                                   │       │
│  │    • Handle 401 → Logout & Redirect                      │       │
│  │    • Extract error messages                              │       │
│  │    • Return clean data                                   │       │
│  │                                                           │       │
│  └─────────────────────────────────────────────────────────┘       │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│                         BACKEND API                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Base URL: https://wenews.onrender.com/api                          │
│                                                                       │
│  Endpoints:                                                          │
│  • POST   /auth/login                                                │
│  • POST   /auth/signup                                               │
│  • GET    /auth/me                                                   │
│  • GET    /wallet                                                    │
│  • GET    /wallet/transactions                                       │
│  • GET    /news                                                      │
│  • POST   /news/:id/read                                             │
│  • GET    /plans                                                     │
│  • POST   /trading/place-bet                                         │
│  • GET    /referrals/tree                                            │
│  • POST   /withdrawals/request                                       │
│  • GET    /dashboard/stats                                           │
│  • ... and more                                                      │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                         UTILITIES & HELPERS                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  • formatCurrency()      • formatDate()         • formatDateTime()  │
│  • formatRelativeTime()  • truncateText()       • copyToClipboard() │
│  • isValidEmail()        • isValidPhone()       • getInitials()     │
│  • calculatePercentage() • formatNumberAbbr()   • debounce()        │
│  • cn() - className utility                                          │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                         TYPE SYSTEM                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  TypeScript Types (types/index.ts):                                 │
│                                                                       │
│  • User                    • LoginCredentials   • SignUpData        │
│  • AuthResponse           • Wallet              • Transaction       │
│  • News                   • NewsReadRecord      • InvestmentPlan    │
│  • UserInvestment         • Trade               • TradingStats      │
│  • ReferralNode           • DashboardStats      • WithdrawalRequest │
│  • ApiResponse<T>         • PaginatedResponse<T>                    │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                         STYLING SYSTEM                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Tailwind CSS + Custom Theme                                         │
│  ┌─────────────────────────────────────────────────────────┐       │
│  │                                                           │       │
│  │  Colors:                                                  │       │
│  │    • primary:   #FF6B35 (Orange)                         │       │
│  │    • secondary: #2C3E50 (Dark Blue)                      │       │
│  │    • accent:    #3498DB (Blue)                           │       │
│  │    • success:   #27AE60 (Green)                          │       │
│  │    • warning:   #F39C12 (Yellow)                         │       │
│  │    • danger:    #E74C3C (Red)                            │       │
│  │                                                           │       │
│  │  Fonts:                                                   │       │
│  │    • Display: Poppins (headings)                         │       │
│  │    • Body:    Inter (text)                               │       │
│  │                                                           │       │
│  │  Custom Classes:                                          │       │
│  │    • .btn, .btn-primary, .btn-secondary                  │       │
│  │    • .card, .card-hover                                  │       │
│  │    • .input                                              │       │
│  │    • .badge, .badge-success, .badge-warning              │       │
│  │                                                           │       │
│  └─────────────────────────────────────────────────────────┘       │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                         BUILD & DEPLOYMENT                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Vite Build System                                                   │
│  ┌─────────────────────────────────────────────────────────┐       │
│  │                                                           │       │
│  │  Development:                                             │       │
│  │    • npm run dev                                          │       │
│  │    • Hot Module Replacement (HMR)                        │       │
│  │    • Fast refresh                                         │       │
│  │    • Port: 3000                                           │       │
│  │                                                           │       │
│  │  Production:                                              │       │
│  │    • npm run build                                        │       │
│  │    • TypeScript compilation                              │       │
│  │    • Code splitting                                       │       │
│  │    • Tree shaking                                         │       │
│  │    • Asset optimization                                   │       │
│  │    • Output: dist/                                        │       │
│  │                                                           │       │
│  └─────────────────────────────────────────────────────────┘       │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘


╔═════════════════════════════════════════════════════════════════════╗
║                       DATA FLOW DIAGRAM                              ║
╚═════════════════════════════════════════════════════════════════════╝

User Interaction
      │
      ↓
  Page Component ──→ Context (if needed)
      │                    │
      │                    ↓
      │              Update State
      ↓
  Service Layer
      │
      ↓
  Axios (api.ts) ──→ Add Auth Token
      │
      ↓
  HTTP Request ──────────────→ Backend API
                                    │
                                    ↓
                              Process Request
                                    │
                                    ↓
  HTTP Response ←──────────────── Backend API
      │
      ↓
  Axios Interceptor ──→ Handle Errors
      │
      ↓
  Service Layer ──→ Transform Data
      │
      ↓
  Context/Component ──→ Update State
      │
      ↓
  UI Re-render ──→ Show Data to User


╔═════════════════════════════════════════════════════════════════════╗
║                       AUTHENTICATION FLOW                            ║
╚═════════════════════════════════════════════════════════════════════╝

1. User visits app
2. AuthContext checks localStorage for token
3. If token exists → Verify with backend
4. If valid → Set user state, navigate to /dashboard
5. If invalid → Clear storage, show /auth/signin

Login Process:
1. User enters credentials
2. Submit to authService.login()
3. Backend validates & returns JWT + user
4. Store token in localStorage
5. Set user in AuthContext
6. Navigate to /dashboard

Protected Routes:
1. User tries to access protected route
2. ProtectedRoute checks isAuthenticated
3. If true → Allow access
4. If false → Redirect to /auth/signin


╔═════════════════════════════════════════════════════════════════════╗
║                       SECURITY LAYERS                                ║
╚═════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────┐
│ 1. Client-Side Validation                                            │
│    • Email format, required fields, password strength                │
├─────────────────────────────────────────────────────────────────────┤
│ 2. JWT Token Authentication                                          │
│    • Stored in localStorage                                          │
│    • Auto-included in every request                                  │
├─────────────────────────────────────────────────────────────────────┤
│ 3. Protected Routes                                                  │
│    • Require authentication                                          │
│    • Auto-redirect if not authenticated                              │
├─────────────────────────────────────────────────────────────────────┤
│ 4. API Interceptors                                                  │
│    • Auto-logout on 401                                              │
│    • Error message extraction                                        │
├─────────────────────────────────────────────────────────────────────┤
│ 5. Environment Variables                                             │
│    • Sensitive config in .env (not committed)                        │
│    • Different configs for dev/prod                                  │
└─────────────────────────────────────────────────────────────────────┘
```

## 🎯 Key Architectural Decisions

### 1. **Service Layer Pattern**

- Separates API logic from UI components
- Makes testing easier
- Allows easy API changes without touching UI

### 2. **Context API for State**

- Lightweight alternative to Redux
- Perfect for auth and wallet state
- Easy to understand and maintain

### 3. **Component Composition**

- Small, focused components
- Reusable UI library
- Consistent design system

### 4. **TypeScript Throughout**

- Type safety across the app
- Better IDE support
- Catch errors at compile time

### 5. **Utility-First CSS (Tailwind)**

- Rapid development
- Consistent spacing & colors
- Responsive by default

---

**This architecture provides:**

- ✅ Separation of concerns
- ✅ Scalability
- ✅ Maintainability
- ✅ Type safety
- ✅ Performance
- ✅ Security
