# Authentication & Page Reload Fix

## Problem
The "My Trades" page was causing auto-reload to dashboard due to **401 Unauthorized errors**.

## Root Cause
- User's authentication token is **expired or invalid**
- When API calls fail with 401, the axios interceptor redirects to login page
- This was causing the "reload" behavior

## What Was Fixed

### 1. Fixed Axios Interceptor Redirect (`apiClient.ts`)
**Before:**
```typescript
case 401:
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  toast.error("Session expired. Please login again.");
  window.location.href = "/login"; // Wrong path!
  break;
```

**After:**
```typescript
case 401:
  // Only redirect if not already on auth pages to prevent loops
  const currentPath = window.location.pathname;
  if (!currentPath.includes('/auth/') && !currentPath.includes('/guest-topup')) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.error("Session expired. Please login again.");
    // Use setTimeout to avoid redirect during component render
    setTimeout(() => {
      window.location.href = "/auth/signin"; // Correct path!
    }, 100);
  }
  break;
```

### 2. Fixed React Hooks Dependencies

#### Trading.tsx
- Wrapped `initializeRound` and `drawWinner` in `useCallback`
- Fixed useEffect dependency arrays to prevent infinite loops
- Improved timer countdown logic to prevent constant re-renders

#### WalletContext.tsx
- Wrapped `refreshWallet`, `refreshTransactions`, and `addMoney` in `useCallback`
- This prevents these functions from changing on every render
- Fixes dependency array warnings

### 3. Improved AuthContext Error Handling
- Added console logging for debugging
- Properly clears user state when token is invalid

## Solution

### Immediate Fix
**You need to log in again** to get a fresh authentication token:

1. Go to `/auth/signin`
2. Log in with your credentials
3. Your token will be refreshed
4. "My Trades" page will work without reloading

### Check Your Token
Open browser console and run:
```javascript
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));
```

If either is `null`, you need to log in.

### Long-term Fix
Consider implementing:
1. **Token Refresh**: Auto-refresh tokens before they expire
2. **Token Expiry Check**: Check token expiry before making API calls
3. **Silent Login**: Auto-refresh using refresh tokens

## Files Changed
1. `web-frontend/src/services/apiClient.ts` - Fixed 401 redirect logic
2. `web-frontend/src/pages/Trading.tsx` - Fixed React hooks dependencies
3. `web-frontend/src/contexts/WalletContext.tsx` - Memoized callback functions
4. `web-frontend/src/contexts/AuthContext.tsx` - Improved error handling

## Testing
1. Log out completely
2. Log in with valid credentials
3. Navigate to "My Trades" page
4. Should work without any reloads

## Error Messages Explained
- **"Request failed with status code 401"** = Your token is invalid/expired
- **"Session expired. Please login again."** = You need to log in
- **"Network error"** = Can't reach the backend server
