# Plans Page - Backend API Integration

## Overview
Fixed the Plans page to fetch investment plans from the backend API instead of using mock data, matching the implementation in the React Native app.

## Changes Made

### 1. Removed Mock Data
**Before**: 
- Used hardcoded `mockGrowthPlans` array with static data
- Plans never updated or synced with backend

**After**:
- Fetches plans dynamically from `/api/investment/plans`
- Plans are loaded on component mount
- Loading state while fetching data

### 2. Backend API Integration

#### Fetch Plans
```typescript
const loadPlans = async () => {
  // Uses apiClient with proper base URL and auth interceptors
  const response = await apiClient.get('/investment/plans');
  
  if (response.data.success && response.data.data) {
    const mappedPlans = mapBackendPlansToGrowthPlans(response.data.data);
    setGrowthPlans(mappedPlans);
  }
};
```

**Backend Response Structure**:
```typescript
{
  success: true,
  data: [
    {
      id: string;
      name: string;              // e.g., "bass", "silver", "gold"
      joiningAmount: number;     // Initial payment amount
      levels: number;            // MLM levels
      validity: number;          // Plan validity in days
      dailyReturn: number;       // Daily contribution/return
      weeklyReturn: number;      // Weekly contribution/return
      monthlyReturn: number;     // Monthly contribution/return
      isActive: boolean;
    }
  ]
}
```

#### Purchase Plan
```typescript
const handlePurchasePlan = async (plan: GrowthPlan) => {
  // Uses apiClient - automatically adds auth token via interceptor
  const response = await apiClient.post('/investment/purchase', {
    planId: plan.id,
    frequency: selectedFrequency,
  });
  
  if (response.data.success) {
    toast.success('Plan activated successfully!');
    refreshWallet();
  }
};
```

### 3. Data Mapping Function
Created `mapBackendPlansToGrowthPlans()` to transform backend data structure to frontend UI structure (matching React Native app):

```typescript
// Backend structure → Frontend structure
{
  id: backendPlan.id,
  name: "Bass Plan",                    // Capitalized
  description: "Start your journey",    // Generated based on plan type
  plans: {
    daily: { initialPayment, contributionAmount },
    weekly: { initialPayment * 0.85, contributionAmount },
    monthly: { initialPayment * 0.7, contributionAmount }
  },
  planValidity: backendPlan.validity,
  earnings: {
    daily: dailyReturn * 1.5,
    weekly: weeklyReturn * 1.5,
    monthly: monthlyReturn * 1.5
  },
  features: [...],                      // Generated based on plan type
  color: '#3B82F6',                     // Plan-specific colors
  gradient: ['#3B82F6', '#2563EB'],
  popular: index === 1                  // Second plan marked as popular
}
```

### 4. Plan Color Mapping
```typescript
const planColorMapping = {
  bass: '#3B82F6',   // Blue
  base: '#3B82F6',   // Blue
  silver: '#9CA3AF', // Gray
  gold: '#F59E0B',   // Orange
  diamond: '#8B5CF6', // Purple
  platinum: '#10B981', // Green
  elite: '#DC2626',  // Red
  eight: '#DC2626'   // Red
};
```

### 5. UI Updates

#### Changed Heading
- **Before**: "Investment Plans"
- **After**: "Return Plans"

#### Added Loading State
```tsx
{loading && (
  <div className="text-center">
    <div className="animate-spin w-12 h-12 border-4..."></div>
    <p>Loading plans...</p>
  </div>
)}
```

#### Added Empty State
```tsx
{growthPlans.length === 0 && (
  <Card>
    <div>📊</div>
    <h3>No Plans Available</h3>
    <p>Investment plans will appear here once available.</p>
  </Card>
)}
```

### 6. Purchase Flow

**Authentication**:
- JWT token automatically added via `apiClient` request interceptor
- Token retrieved from `localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)`

**Validation**:
1. Check wallet balance
2. Show confirmation dialog
3. Call backend API
4. Handle success/error response
5. Refresh wallet balance

**Backend Endpoint**: `POST /api/investment/purchase`

**Request Body**:
```json
{
  "planId": "plan123",
  "frequency": "daily" | "weekly" | "monthly"
}
```

## Backend API Endpoints Used

### GET `/api/investment/plans`
**Purpose**: Fetch all active investment plans

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "123",
      "name": "bass",
      "joiningAmount": 5000,
      "levels": 5,
      "validity": 365,
      "dailyReturn": 50,
      "weeklyReturn": 350,
      "monthlyReturn": 1500,
      "isActive": true
    }
  ]
}
```

### POST `/api/investment/purchase`
**Purpose**: Purchase an investment plan

**Headers**:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request**:
```json
{
  "planId": "123",
  "frequency": "daily"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Investment plan purchased successfully",
  "data": {
    "investment": { ... }
  }
}
```

## Consistency with React Native App

The web implementation now matches the React Native app's approach:

1. ✅ Fetches plans from `/api/investment/plans`
2. ✅ Uses same `mapBackendPlansToGrowthPlans()` mapping logic
3. ✅ Same plan color scheme and descriptions
4. ✅ Same purchase flow with backend API call
5. ✅ Same data structure and interfaces
6. ✅ Same frequency options (daily/weekly/monthly)

## Testing Checklist

- [x] Plans page loads without errors
- [x] Shows loading state while fetching plans
- [x] Shows empty state if no plans available
- [x] Displays plans with correct colors and details
- [x] Frequency toggle (daily/weekly/monthly) works
- [x] Purchase button shows correct amount
- [x] Wallet balance check works
- [x] Purchase confirmation dialog appears
- [x] Backend API call for purchase works
- [x] Success/error messages display correctly
- [x] Wallet balance refreshes after purchase
- [x] Page heading shows "Return Plans"

## Files Modified

1. **`web-frontend/src/pages/Plans.tsx`**
   - Removed mock data (85+ lines)
   - Added `BackendInvestmentPlan` interface
   - Added `mapBackendPlansToGrowthPlans()` function
   - Added `loadPlans()` async function
   - Updated `handlePurchasePlan()` with backend API call
   - Added loading state UI
   - Added empty state UI
   - Changed heading to "Return Plans"
   - Changed document title to "Return Plans - WeNews"

## Benefits

✅ **Dynamic Data**: Plans are fetched from backend, can be managed via admin panel
✅ **Real-time Sync**: Plans always show current backend state
✅ **No Mock Data**: Production-ready implementation
✅ **Consistent UX**: Matches React Native app behavior
✅ **Error Handling**: Proper loading and error states
✅ **Authentication**: Secure purchase with JWT tokens
✅ **Wallet Integration**: Balance check and refresh on purchase

## Next Steps

1. **Admin Panel**: Add plan management UI for admins to create/edit/delete plans
2. **Plan Analytics**: Track which plans are most popular
3. **Dynamic Features**: Allow admins to customize plan features
4. **Discounts**: Add promotional discounts for certain frequencies
5. **Plan Comparison**: Add side-by-side plan comparison feature
