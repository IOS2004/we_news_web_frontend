# Troubleshooting Guide - WeNews Web Frontend

## Common Issues and Solutions

### 1. "3000ms timeout exceeded" Error on Login

**Problem**: The backend API (https://wenews.onrender.com/api) is hosted on free tier Render.com which spins down after inactivity. First request takes 30-60 seconds to wake up the server.

**Solutions**:
- ✅ **Already Fixed**: Increased API timeout to 60 seconds in `src/services/api.ts`
- ✅ **Already Fixed**: Added helpful error messages for timeout scenarios
- **User Action**: Wait for the full 60 seconds on first login. Subsequent requests will be fast.

**Alternative**: If timeout persists, check if backend is actually running:
```bash
# Test backend health
curl https://wenews.onrender.com/api/health
# Should return: {"status":"ok"}
```

---

### 2. Wallet Page Shows Blank/Crashes

**Problem**: WalletContext tries to load data before authentication completes, or API calls fail.

**Solutions**:
- ✅ **Already Fixed**: Rewrote Wallet.tsx with defensive programming
- ✅ **Already Fixed**: Added proper error handling and loading states
- ✅ **Already Fixed**: Wallet no longer loads data on mount automatically

**Features Added**:
- Loading spinner with message
- Error state with retry button
- Safe handling of missing data
- Graceful fallbacks for empty transactions

---

### 3. News Page Not Loading Articles

**Problem**: External news API (TheNewsAPI) may be slow or require API key.

**Solutions**:
- ✅ **Already Implemented**: Fallback articles when API fails
- **User Action**: Add your News API key to `.env`:
```env
VITE_NEWS_API_KEY=your_actual_api_key_here
VITE_NEWS_API_BASE_URL=https://api.thenewsapi.com/v1
```

**Get Free API Key**: https://www.thenewsapi.com/

---

### 4. TypeScript Errors in IDE

**Problem**: VS Code shows "Cannot find module" errors even though code works.

**Solutions**:
- ✅ **Already Fixed**: Installed `@types/node` package
- **User Action**: Restart VS Code TypeScript server
  - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
  - Type "TypeScript: Restart TS Server"
  - Press Enter

---

### 5. Pages Show "To be implemented" Message

**Problem**: Some pages are still stubs (Trading, Profile, Network, Plans, Settings, Withdrawals).

**Status**: 
- ✅ **Completed**: Dashboard, News, NewsDetail, Wallet (4/10 pages)
- 🚧 **Pending**: Trading (Color/Number), Profile, Network, Plans, Settings, Withdrawals (6/10 pages)

**Expected Timeline**: Phase 2 implementation in progress.

---

## Current Implementation Status

### ✅ Fully Functional Pages

1. **Dashboard** (`/dashboard`)
   - Stats cards
   - Wallet balance
   - Recent activities
   - Investment summary

2. **News Listing** (`/news`)
   - Category filters (All, Hindi, Tech, Business, Sports, Entertainment)
   - Article cards with images
   - Responsive grid layout
   - External API integration

3. **News Detail** (`/news/:id`)
   - Full article view
   - Reading timer (30 seconds)
   - Reward system (₹2 after reading)
   - Share functionality
   - Open original article

4. **Wallet** (`/wallet`)
   - Balance display
   - Add Money & Withdraw buttons
   - Quick stats (Credit/Debit/Total)
   - Transaction history
   - Refresh functionality
   - Error handling

---

## Performance Tips

### Backend API Optimization

The backend is on free tier, which means:
- **Cold Start**: 30-60 seconds for first request after inactivity
- **Warm**: < 500ms for subsequent requests
- **Auto-Sleep**: After 15 minutes of inactivity

**Recommendation**: For development, consider running backend locally:
```bash
cd backend/backend
npm install
npm start
# Backend runs on http://localhost:5000
```

Then update `.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## Debug Mode

### Enable Console Logging

All API calls are logged to console. Open browser DevTools (F12) and check:
- **Console Tab**: See API requests/responses and errors
- **Network Tab**: Monitor API call timing and status codes

### Check Current State

In browser console, type:
```javascript
// Check if user is logged in
localStorage.getItem('wenews_auth_token')

// Check stored user data
JSON.parse(localStorage.getItem('wenews_user_data'))

// Clear all data (force logout)
localStorage.clear()
window.location.reload()
```

---

## Quick Fixes

### Reset Everything
```bash
# Stop dev server (Ctrl+C)
cd F:\WeNews\web-frontend

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Restart dev server
npm run dev
```

### Clear Browser Cache
```
1. Open DevTools (F12)
2. Right-click on Refresh button
3. Select "Empty Cache and Hard Reload"
```

### Test Backend Connection
```bash
# From command line
curl https://wenews.onrender.com/api/health

# Expected output:
# {"status":"ok","message":"WeNews API is running"}
```

---

## Error Messages Explained

### "Server is taking too long to respond..."
- **Cause**: Backend cold start (first request after sleep)
- **Solution**: Wait 60 seconds and try again
- **Prevention**: Use local backend for development

### "Cannot connect to server..."
- **Cause**: No internet or backend is down
- **Solution**: Check internet connection, verify backend URL

### "401 Unauthorized"
- **Cause**: Invalid or expired token
- **Solution**: Logout and login again

### "Failed to load wallet data"
- **Cause**: API timeout or network error
- **Solution**: Click "Try Again" button or refresh page

---

## Known Limitations

1. **Backend Cold Start**: First API call takes 30-60 seconds
2. **News API**: Free tier has rate limits (100 requests/day)
3. **Stub Pages**: 6 pages still under development
4. **No Offline Mode**: Requires internet connection

---

## Getting Help

### Check These First
1. ✅ Dev server running? (`npm run dev`)
2. ✅ Backend accessible? (Try https://wenews.onrender.com/api/health)
3. ✅ Browser console errors? (F12 → Console tab)
4. ✅ Network tab shows failed requests? (F12 → Network tab)

### Still Having Issues?
1. Check `IMPLEMENTATION_PROGRESS.md` for current status
2. Review `QUALITY_ASSURANCE.md` for testing checklist
3. Clear localStorage and try again
4. Try with a fresh browser session (incognito mode)

---

**Last Updated**: 2025-10-13
**Version**: 1.0.0
**Status**: Phase 1 Complete (40% done)
