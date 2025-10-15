# API Endpoint Mapping - WeNews Backend

## Base URL
```
https://wenews.onrender.com/api
```

## 📌 Actual Backend Routes (Verified from Source Code)

### 🔐 Authentication Routes (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/signup` | User registration with optional referralCode | No |
| POST | `/auth/login` | User login | No |
| POST | `/auth/logout` | User logout | Yes |
| POST | `/auth/refresh` | Refresh JWT token | Yes |
| POST | `/auth/change-password` | Change user password | Yes |
| GET | `/auth/me` | Get current user info | Yes |

### 👤 User Routes (`/api/user`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/user/profile` | Get user profile | Yes |
| PUT | `/user/profile` | Update user profile | Yes |
| GET | `/user/saved-articles` | Get saved articles with pagination | Yes |
| POST | `/user/save-article` | Save an article | Yes |
| DELETE | `/user/saved-articles/:articleId` | Remove saved article | Yes |
| GET | `/user/preferences` | Get user preferences | Yes |
| PUT | `/user/preferences` | Update user preferences | Yes |

### 💰 Wallet Routes (`/api/wallet`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/wallet` | Get wallet details (balance, transactions) | Yes |
| GET | `/wallet/transactions` | Get transaction history with filters | Yes |
| GET | `/wallet/can-pay` | Check if user can pay amount | Yes |
| POST | `/wallet/topup` | Initiate wallet top-up | Yes |
| POST | `/wallet/pay` | Process service payment | Yes |
| POST | `/wallet/refund` | Request refund | Yes |
| POST | `/wallet/topup/success` | Handle topup success callback | No |
| POST | `/wallet/topup/failure` | Handle topup failure callback | No |

**Note**: No direct withdrawal endpoint found. Withdrawals likely handled through:
- Earnings withdrawal system
- Admin approval process
- Or integrated with payment gateway

### 📈 Earnings Routes (`/api/earnings`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/earnings/daily` | Get daily earnings with pagination | Yes |
| GET | `/earnings/today` | Get today's earnings | Yes |
| GET | `/earnings/summary` | Get earnings summary for date range | Yes |
| GET | `/earnings/level` | Get user level and rewards | Yes |
| POST | `/earnings/experience` | Add experience points | Yes |
| GET | `/earnings/rewards` | Get level rewards | Yes |
| POST | `/earnings/daily-login` | Process daily login reward | Yes |
| GET | `/earnings/stats` | Get earnings statistics | Yes |

### 🔗 Referral Routes (`/api/referrals`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/referrals/info` | Get referral info (code, stats, earnings) | Yes |
| GET | `/referrals/tree` | Get referral tree (query: levels) | Yes |
| GET | `/referrals/validate/:referralCode` | Validate referral code | No (Public) |
| GET | `/referrals/statistics` | Get referral statistics (Admin) | Yes (Admin) |
| POST | `/referrals/distribute-commission` | Distribute commissions (Admin) | Yes (Admin) |
| GET | `/referrals/commission-rates` | Get commission rates | No (Public) |

### 💎 Investment Routes (`/api/investment`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/investment/plans` | Get all investment plans | No (Public) |
| GET | `/investment/levels` | Get level structure | No (Public) |
| POST | `/investment/purchase` | Purchase investment plan | Yes |
| GET | `/investment/my-investment` | Get user's current investment | Yes |
| POST | `/investment/claim-daily` | Claim daily earnings | Yes |
| GET | `/investment/daily-status` | Get daily earning status | Yes |

### 🎮 Trading Routes (`/api/trading`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/trading/rounds` | List trading rounds (query: gameType, status, limit) | No (Public) |
| GET | `/trading/rounds/:id` | Get specific round details | No (Public) |
| POST | `/trading/orders` | Place trading order | Yes |
| GET | `/trading/my-orders` | Get user's trading orders | Yes |

### 📰 News Routes (`/api/news`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/news` | Get all news with filters (page, limit, category, status, language, featured, trending, search) | No (Public) |
| GET | `/news/trending` | Get trending news | No (Public) |
| GET | `/news/featured` | Get featured news | No (Public) |
| GET | `/news/category/:category` | Get news by category | No (Public) |
| GET | `/news/:id` | Get single news article | No (Public) |
| POST | `/news/:id/view` | Increment view count | No (Public) |
| POST | `/news/:id/like` | Like/unlike article | Yes |
| POST | `/news/:id/comment` | Add comment | Yes |
| GET | `/news/:id/comments` | Get article comments | No (Public) |

### 📊 Dashboard Routes (`/api/dashboard`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/dashboard/overview` | Get dashboard overview | Yes |
| GET | `/dashboard/stats` | Get quick stats | Yes |
| GET | `/dashboard/earnings` | Get earnings summary (query: period) | Yes |
| GET | `/dashboard/progress` | Get user progress | Yes |

### 🪙 Coins Routes (`/api/coins`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/coins/balance` | Get user coin balance | Yes |
| GET | `/coins/transactions` | Get coin transaction history | Yes |
| POST | `/coins/earn` | Earn coins for activity | Yes |
| POST | `/coins/convert` | Convert coins to wallet balance | Yes |
| GET | `/coins/rates` | Get conversion rates | No (Public) |

### 💳 Payment Routes
| Endpoint | Description |
|----------|-------------|
| `/api/v1/cashfree/*` | Cashfree payment gateway routes |
| `/api/v1/payments/*` | Easebuzz payment gateway routes |

## 🔄 Key Differences from Old Documentation

### ❌ INCORRECT (Old Docs)
```javascript
// DON'T USE THESE:
GET /api/wallet/balance          // ❌ Wrong
GET /api/wallet/withdrawals      // ❌ Not found
POST /api/wallet/withdraw        // ❌ Not found
GET /api/referral/stats          // ❌ Wrong path (missing 's')
GET /api/referral/network        // ❌ Wrong path
POST /api/investment/purchase-plan // ❌ Wrong endpoint
GET /api/investment/my-investments // ❌ Wrong (plural)
```

### ✅ CORRECT (Actual Backend)
```javascript
// USE THESE:
GET /api/wallet                  // ✅ Returns wallet with balance + transactions
GET /api/wallet/transactions     // ✅ For detailed transaction history
// No direct withdrawal endpoint - use earnings/refund system
GET /api/referrals/info          // ✅ Correct (with 's')
GET /api/referrals/tree          // ✅ Correct
POST /api/investment/purchase    // ✅ Correct
GET /api/investment/my-investment // ✅ Correct (singular)
```

## 📝 Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ] // Optional validation errors
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

## 🔒 Authentication

All authenticated routes require a JWT Bearer token:
```
Authorization: Bearer <token>
```

Token is returned on successful login/signup and should be stored in localStorage.

## ⚠️ Important Notes

1. **Withdrawal System**: No direct `/wallet/withdraw` endpoint found. Withdrawals appear to be handled through:
   - Earnings system with approval workflow
   - Admin withdrawal management (`/api/admin/withdrawals`)
   - Payment gateway integration

2. **Referral Path**: Always use `/api/referrals` (with 's'), not `/api/referral`

3. **Investment**: User's investment is singular (`my-investment`), not plural

4. **Wallet Balance**: Get wallet balance from `/api/wallet` response, not a separate endpoint

5. **Public Endpoints**: News, trading rounds, investment plans, and referral validation are public (no auth required)

6. **Query Parameters**: Most list endpoints support standard pagination:
   - `page` (default: 1)
   - `limit` (default: 20, max: 100)

7. **Validation**: Backend uses `express-validator` for all input validation. Check for `errors` array in 400 responses.

## 🧪 Testing

Health check endpoint:
```
GET /api/health
```

Returns server status and available features.
