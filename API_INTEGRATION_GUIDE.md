# API Integration Guide - WeNews Web Frontend

## 📚 Overview

This guide explains how to use the API service layer to integrate backend functionality into your pages.

## 🚀 Quick Start

### 1. Import the API Services

```typescript
// Import individual services
import { walletService } from "@/services/walletApi";
import { authService } from "@/services/authApi";
import { referralService } from "@/services/referralApi";

// Or import everything
import { api } from "@/services";

// Use it
const balance = await api.wallet.getBalance();
```

### 2. Basic Usage Pattern

```typescript
import { walletService } from "@/services/walletApi";
import { useState, useEffect } from "react";

function MyComponent() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      setLoading(true);
      const data = await walletService.getBalance();
      setWallet(data);
    } catch (error) {
      console.error("Failed to load wallet:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Balance: ₹{wallet?.balance}</h1>
    </div>
  );
}
```

## 🔐 Authentication

### Login

```typescript
import { authService } from "@/services/authApi";

const handleLogin = async (email: string, password: string) => {
  try {
    const response = await authService.login({ email, password });
    // Token and user automatically stored in localStorage
    console.log("Logged in as:", response.user.name);
    // Redirect to dashboard
    router.push("/dashboard");
  } catch (error) {
    console.error("Login failed:", error);
  }
};
```

### Signup

```typescript
const handleSignup = async (data: SignupData) => {
  try {
    const response = await authService.signup({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      referralCode: data.referralCode, // Optional
    });
    console.log("Account created:", response.user.name);
    router.push("/dashboard");
  } catch (error) {
    console.error("Signup failed:", error);
  }
};
```

### Check Auth Status

```typescript
const isLoggedIn = authService.isAuthenticated();
const currentUser = authService.getStoredUser();

if (!isLoggedIn) {
  router.push("/login");
}
```

### Logout

```typescript
const handleLogout = () => {
  authService.logout();
  // Automatically redirects to /login
};
```

## 👤 User Profile

### Get Profile

```typescript
import { userService } from "@/services/userApi";

const profile = await userService.getProfile();
console.log(profile.name, profile.email);
```

### Update Profile

```typescript
const handleUpdateProfile = async (data: UpdateProfileData) => {
  try {
    const updated = await userService.updateProfile({
      firstName: data.firstName,
      lastName: data.lastName,
      profilePicture: data.profilePicture,
    });
    console.log("Profile updated:", updated);
  } catch (error) {
    console.error("Update failed:", error);
  }
};
```

### Saved Articles

```typescript
// Get saved articles
const saved = await userService.getSavedArticles({ page: 1, limit: 20 });

// Save an article
await userService.saveArticle("article-id");

// Remove from saved
await userService.unsaveArticle("article-id");
```

## 💰 Wallet & Transactions

### Get Balance

```typescript
import { walletService } from "@/services/walletApi";

const wallet = await walletService.getBalance();
console.log("Balance:", wallet.balance);
console.log("Total Earnings:", wallet.totalEarnings);
```

### Get Transactions

```typescript
const transactions = await walletService.getTransactions({
  page: 1,
  limit: 20,
  type: "credit", // 'credit' | 'debit'
  status: "completed",
});

transactions.items.forEach((txn) => {
  console.log(`${txn.type}: ₹${txn.amount} - ${txn.description}`);
});
```

### Top Up Wallet

```typescript
const handleTopUp = async (amount: number) => {
  try {
    const result = await walletService.topUp({
      amount,
      paymentMethod: "upi",
    });
    console.log("Top-up initiated:", result);
    // Redirect to payment gateway
  } catch (error) {
    console.error("Top-up failed:", error);
  }
};
```

### Request Withdrawal

```typescript
const handleWithdrawal = async (amount: number, details: any) => {
  try {
    const result = await walletService.requestWithdrawal({
      amount,
      paymentMethod: "upi",
      paymentDetails: details,
    });
    console.log("Withdrawal requested:", result);
  } catch (error) {
    console.error("Withdrawal failed:", error);
  }
};
```

### Get Wallet Stats

```typescript
const stats = await walletService.getStats();
console.log("Monthly Earnings:", stats.monthlyEarnings);
console.log("Total Withdrawn:", stats.totalWithdrawn);
```

## 🔗 Referral System

### Get Referral Info

```typescript
import { referralService } from "@/services/referralApi";

const stats = await referralService.getStats();
console.log("Referral Code:", stats.referralCode);
console.log("Total Referrals:", stats.totalReferrals);
console.log("Total Earnings:", stats.totalEarnings);
```

### Get Referral Tree

```typescript
const tree = await referralService.getTree(5); // Max 5 levels
console.log("Direct Referrals:", tree.directReferrals);
console.log("Total Network:", tree.totalReferrals);

// Recursive tree structure
tree.children.forEach((child) => {
  console.log(`Level 1: ${child.user.name}`);
});
```

### Get Referral List

```typescript
const referrals = await referralService.getReferrals({
  page: 1,
  limit: 20,
  level: 1, // Filter by level
  status: "active",
});
```

### Generate Referral Link

```typescript
const code = await referralService.getReferralCode();
const link = referralService.generateReferralLink(code);
console.log("Share this link:", link);
```

### Validate Referral Code

```typescript
const isValid = await referralService.validateCode("ABC123");
if (isValid) {
  console.log("Valid referral code!");
}
```

### Get Commission Rates

```typescript
const rates = await referralService.getCommissionRates();
console.log("Level 1:", rates.level1);
console.log("Level 2:", rates.level2);
```

## 💎 Investment Plans

### Get All Plans

```typescript
import { investmentService } from "@/services/investmentApi";

const plans = await investmentService.getPlans();
plans.forEach((plan) => {
  console.log(`${plan.name}: ₹${plan.amount} - ${plan.dailyReturn}% daily`);
});
```

### Purchase a Plan

```typescript
const handlePurchase = async (planId: string, amount: number) => {
  try {
    const investment = await investmentService.purchasePlan({
      planId,
      amount,
    });
    console.log("Investment successful:", investment);
  } catch (error) {
    console.error("Purchase failed:", error);
  }
};
```

### Get My Investment

```typescript
const investments = await investmentService.getUserInvestments();
const current = investments.items[0];

console.log("Plan:", current.plan.name);
console.log("Amount:", current.amount);
console.log("Total Earned:", current.totalEarned);
console.log("Remaining Days:", current.remainingDays);
```

### Claim Daily Earnings

```typescript
const handleClaim = async () => {
  try {
    const result = await investmentService.claimDailyEarnings();
    console.log("Earnings claimed:", result);
  } catch (error) {
    console.error("Claim failed:", error);
  }
};
```

### Get Daily Status

```typescript
const status = await investmentService.getDailyStatus();
console.log("Can claim:", status.canClaim);
console.log("Next claim at:", status.nextClaimAt);
```

## 🎮 Trading Game

### Get Current Round

```typescript
import { tradingService } from "@/services/tradingApi";

const round = await tradingService.getCurrentRound("color");
if (round) {
  console.log("Round:", round.roundNumber);
  console.log("Status:", round.status);
  console.log("Ends at:", round.endTime);
}
```

### Place a Bet

```typescript
const handleBet = async (roundId: string, selections: TradingSelection[]) => {
  try {
    const order = await tradingService.placeOrder({
      roundId,
      selections: [
        { option: "red", amount: 100 },
        { option: 5, amount: 50 },
      ],
    });
    console.log("Bet placed:", order);
  } catch (error) {
    console.error("Bet failed:", error);
  }
};
```

### Get My Orders

```typescript
const orders = await tradingService.getMyOrders({
  page: 1,
  limit: 20,
  gameType: "color",
  status: "won",
});

orders.items.forEach((order) => {
  console.log(`Order ${order.id}: ${order.status} - Profit: ₹${order.profit}`);
});
```

### Get Trading Stats

```typescript
const stats = await tradingService.getStats();
console.log("Total Orders:", stats.totalOrders);
console.log("Win Rate:", stats.winRate.toFixed(2) + "%");
console.log("Profit:", stats.profit);
```

### Get Recent Results

```typescript
const results = await tradingService.getRecentResults("color", 10);
results.forEach((r) => {
  console.log(`Round ${r.roundNumber}: ${r.result}`);
});
```

## 📊 Dashboard Data

### Get Dashboard Overview

```typescript
import { dashboardService } from "@/services/dashboardApi";

const overview = await dashboardService.getOverview();
console.log("Wallet Balance:", overview.wallet.balance);
console.log("Total Referrals:", overview.referrals.total);
console.log("Active Investments:", overview.investment.activeInvestments);
```

### Get Quick Stats

```typescript
const stats = await dashboardService.getQuickStats();
console.log("Today Earnings:", stats.todayEarnings);
console.log("Week Earnings:", stats.weekEarnings);
console.log("Month Earnings:", stats.monthEarnings);
```

### Get Earnings Summary

```typescript
const today = await dashboardService.getTodayEarnings();
const week = await dashboardService.getWeekEarnings();
const month = await dashboardService.getMonthEarnings();

console.log("Today:", today.total);
console.log("Breakdown:", today.breakdown);
```

### Refresh All Dashboard Data

```typescript
const { overview, stats, earnings, progress } =
  await dashboardService.refreshDashboard();
// All data loaded in parallel
```

## 💸 Earnings

### Get Daily Earnings

```typescript
import { earningsService } from "@/services/earningsApi";

const earnings = await earningsService.getDailyEarnings({
  page: 1,
  limit: 20,
  source: "referral", // Filter by source
});
```

### Get Today's Earnings

```typescript
const today = await earningsService.getTodayEarnings();
console.log("Total:", today.total);
console.log("From Referrals:", today.breakdown.referral);
console.log("From Investment:", today.breakdown.investment);
```

### Get User Level

```typescript
const level = await earningsService.getUserLevel();
console.log("Current Level:", level.currentLevel);
console.log("Progress:", level.progress + "%");
console.log("EXP Needed:", level.experienceNeeded);
```

### Claim Daily Login Reward

```typescript
const handleDailyLogin = async () => {
  try {
    const reward = await earningsService.processDailyLoginReward();
    console.log("Reward claimed:", reward);
  } catch (error) {
    console.error("Already claimed today");
  }
};
```

## 🎯 Best Practices

### 1. Error Handling

```typescript
try {
  const data = await walletService.getBalance();
  setWallet(data);
} catch (error: any) {
  if (error.response?.status === 401) {
    // Unauthorized - redirect to login
    authService.logout();
  } else {
    // Show error message
    console.error("Error:", error.message);
  }
}
```

### 2. Loading States

```typescript
const [loading, setLoading] = useState(false);

const loadData = async () => {
  setLoading(true);
  try {
    const data = await api.wallet.getBalance();
    setWallet(data);
  } finally {
    setLoading(false);
  }
};
```

### 3. Pagination

```typescript
const [page, setPage] = useState(1);
const [transactions, setTransactions] = useState<Transaction[]>([]);

const loadMore = async () => {
  const result = await walletService.getTransactions({
    page: page + 1,
    limit: 20,
  });

  setTransactions([...transactions, ...result.items]);
  setPage(page + 1);
};
```

### 4. Caching Data

```typescript
const [cachedData, setCachedData] = useState<any>(null);
const [lastFetch, setLastFetch] = useState<number>(0);

const getData = async (forceRefresh = false) => {
  const now = Date.now();
  const cacheExpiry = 5 * 60 * 1000; // 5 minutes

  if (!forceRefresh && cachedData && now - lastFetch < cacheExpiry) {
    return cachedData;
  }

  const data = await api.dashboard.getOverview();
  setCachedData(data);
  setLastFetch(now);
  return data;
};
```

### 5. Parallel Requests

```typescript
const loadDashboard = async () => {
  const [wallet, referrals, investments] = await Promise.all([
    walletService.getBalance(),
    referralService.getStats(),
    investmentService.getUserInvestments(),
  ]);

  setWallet(wallet);
  setReferrals(referrals);
  setInvestments(investments);
};
```

## 🚨 Common Errors

### 401 Unauthorized

- Token expired or invalid
- Solution: Call `authService.logout()` and redirect to login

### 403 Forbidden

- User doesn't have permission
- Solution: Show access denied message

### 404 Not Found

- Resource doesn't exist
- Solution: Show "not found" message

### 422 Validation Error

- Invalid input data
- Solution: Show validation errors to user

### 500 Server Error

- Backend error
- Solution: Show generic error message, retry later

## 📝 TypeScript Tips

```typescript
// All services return typed data
const wallet: Wallet = await walletService.getBalance();
const referrals: PaginatedResponse<ReferredUser> =
  await referralService.getReferrals();

// Use provided types
import type { Transaction, ReferralStats, InvestmentPlan } from "@/services";

// Type-safe parameters
const filters: { page: number; limit: number } = { page: 1, limit: 20 };
```

## 🔗 Next Steps

1. Replace mock data in pages with API calls
2. Add loading states and error handling
3. Implement data refresh on user actions
4. Add offline support (optional)
5. Test with real backend

## 📚 API Reference

See `API_ENDPOINT_MAPPING.md` for complete endpoint documentation.
