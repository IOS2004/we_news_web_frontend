# Storage Keys Fix - Critical Bug Resolution

## Problem

After logging in, users were immediately redirected back to the signin page.

## Root Cause

**Storage Key Mismatch**:

- `AuthContext.tsx` was saving tokens to: `wenews_auth_token` and `wenews_user_data`
- `apiClient.ts`, `authApi.ts`, `userApi.ts` were reading from: `token` and `user`
- This caused the authentication token to NOT be sent with API requests
- All API calls returned 401 Unauthorized
- The 401 interceptor redirected to login, creating an infinite loop

## What Was Fixed

### 1. apiClient.ts

**Before:**

```typescript
const token = localStorage.getItem("token");
localStorage.removeItem("token");
localStorage.removeItem("user");
```

**After:**

```typescript
import { STORAGE_KEYS } from "@/config";

const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
localStorage.removeItem(STORAGE_KEYS.USER_DATA);
```

### 2. authApi.ts

**Before:**

```typescript
localStorage.setItem("token", token);
localStorage.setItem("user", JSON.stringify(user));
localStorage.getItem("token");
localStorage.getItem("user");
```

**After:**

```typescript
import { STORAGE_KEYS } from "@/config";

localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
localStorage.getItem(STORAGE_KEYS.USER_DATA);
```

### 3. userApi.ts

**Before:**

```typescript
localStorage.removeItem("token");
localStorage.removeItem("user");
```

**After:**

```typescript
import { STORAGE_KEYS } from "@/config";

localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
localStorage.removeItem(STORAGE_KEYS.USER_DATA);
```

## Storage Keys Configuration

Located in `web-frontend/src/config/index.ts`:

```typescript
export const STORAGE_KEYS = {
  AUTH_TOKEN: "wenews_auth_token",
  USER_DATA: "wenews_user_data",
  THEME: "wenews_theme",
} as const;
```

## How to Test

### Step 1: Clear Old Storage (IMPORTANT!)

Open browser console and run:

```javascript
// Clear old keys
localStorage.removeItem("token");
localStorage.removeItem("user");

// Verify new keys will be used
console.log("Old token:", localStorage.getItem("token")); // Should be null
console.log("Old user:", localStorage.getItem("user")); // Should be null
```

### Step 2: Log In Again

1. Go to `/auth/signin`
2. Enter your credentials
3. Click "Sign In"
4. You should be redirected to `/dashboard` and STAY there

### Step 3: Verify Authentication

Open browser console and run:

```javascript
console.log("Auth Token:", localStorage.getItem("wenews_auth_token")); // Should show token
console.log("User Data:", localStorage.getItem("wenews_user_data")); // Should show user object
```

### Step 4: Test Protected Pages

1. Navigate to "My Trades" page
2. Page should load without redirecting
3. No 401 errors in console

## Files Changed

1. ✅ `web-frontend/src/services/apiClient.ts` - Fixed token retrieval and clearing
2. ✅ `web-frontend/src/services/authApi.ts` - Fixed token/user storage and retrieval
3. ✅ `web-frontend/src/services/userApi.ts` - Fixed token/user clearing on account deletion
4. ✅ `web-frontend/src/contexts/AuthContext.tsx` - Already using correct keys
5. ✅ `web-frontend/src/services/api.ts` - Already using correct keys from STORAGE_KEYS

## Why This Happened

Multiple developers or different points in time created different API service files:

- Older files (`authApi.ts`, `userApi.ts`) used plain `"token"` and `"user"` keys
- Newer files (`AuthContext.tsx`, `api.ts`) used constants from `STORAGE_KEYS`
- This created an inconsistency that broke authentication

## Prevention

- ✅ Always import and use `STORAGE_KEYS` from `@/config`
- ✅ Never use hardcoded strings like `"token"` or `"user"`
- ✅ Grep search for hardcoded storage keys before deployment

## Impact

- **High Priority Fix** - Prevented all users from staying logged in
- **User Experience** - Eliminated infinite redirect loops
- **Security** - Consistent token storage improves security practices
