# Quick Testing Guide - Backend Trading Integration

## 🎯 Prerequisites

1. **Backend Server Running**

   ```powershell
   cd f:\WeNews\backend\backend
   npm start
   ```

   Server should be running on: `http://localhost:5000`

2. **Web Frontend Running**

   ```powershell
   cd f:\WeNews\web-frontend
   npm run dev
   ```

   Frontend should be on: `http://localhost:5173`

3. **User Authenticated**

   - Login with valid credentials
   - JWT token should be in localStorage

4. **Active Trading Rounds**
   - Use admin panel to create active rounds
   - At least one `colour` round
   - At least one `number` round

## 🧪 Test Scenarios

### Test 1: Color Trading Page

1. Navigate to `/color-trading`
2. **Verify:**

   - ✅ Wallet balance displays correctly
   - ✅ Active round information shows
   - ✅ Timer counts down from round time
   - ✅ All 12 colors are displayed
   - ✅ Bet amount buttons work

3. **Place a Trade:**

   - Select a color (e.g., Red)
   - Choose bet amount (e.g., 100)
   - Click "Place Bet"
   - **Expected:**
     - Success toast message
     - Wallet balance decreases by bet amount
     - Trade appears in "Your Bets" section
     - Selected color shows bet amount

4. **Auto-Refresh Test:**
   - Wait 5 seconds
   - **Expected:**
     - Page refreshes data automatically
     - Wallet balance stays updated
     - Timer continues counting

### Test 2: Number Trading Page

1. Navigate to `/number-trading`
2. **Verify:**

   - ✅ Wallet balance displays
   - ✅ Active round shows
   - ✅ Timer counts down
   - ✅ Numbers 0-100 grid displays

3. **Place Single Number Trade:**

   - Click on a number (e.g., 42)
   - Select bet amount (e.g., 500)
   - Click "Place Trade"
   - **Expected:**
     - Success message
     - Wallet decreases by 500
     - Number shows in "Your Bets"

4. **Place Multiple Number Trades:**
   - Select multiple numbers (e.g., 7, 13, 42)
   - Set bet amount (e.g., 100)
   - Click "Place Trades"
   - **Expected:**
     - Success message shows count (e.g., "3 trades placed")
     - Wallet decreases by 300 (100 × 3)
     - All numbers show in bet history

### Test 3: Error Handling

1. **Insufficient Balance:**

   - Select bet amount > wallet balance
   - Try to place trade
   - **Expected:** Error toast "Insufficient wallet balance"

2. **No Active Round:**

   - If no active rounds exist
   - **Expected:** "No Active Round" message with countdown

3. **Trading Closed:**
   - Wait until timer < 10 seconds
   - Try to place trade
   - **Expected:** Warning message about closing time

### Test 4: Timer Behavior

1. **Watch Timer:**

   - Note initial time (e.g., 05:00)
   - Wait 60 seconds
   - **Expected:**
     - Timer should show 04:00
     - Countdown is accurate

2. **Timer Expiry:**
   - Wait for timer to reach 00:00
   - **Expected:**
     - Page refreshes to get new round
     - New round appears (if created)
     - Or "No Active Round" message

### Test 5: Trade History

1. **View Trades:**
   - Place multiple trades in same round
   - Check "Your Bets" section
   - **Expected:**
     - All trades listed
     - Correct amounts shown
     - Total bet calculated correctly

## 🔍 Browser Console Checks

Open DevTools Console (F12) and check:

### Expected Logs:

```
✅ API calls to /trading/wallet-balance
✅ API calls to /trading/active-rounds
✅ API calls to /trading/place-trade
✅ No error messages
```

### Check Network Tab:

1. Filter: `/api/trading/`
2. **Verify:**
   - All requests return 200 status
   - Response data structure matches expected
   - Authorization header present

### Sample Response Check:

**GET /trading/wallet-balance**

```json
{
  "success": true,
  "data": {
    "balance": 10000,
    "formattedBalance": "₹10,000",
    "status": "active",
    "canTrade": true
  }
}
```

**GET /trading/active-rounds?roundType=colour**

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "...",
      "roundId": "...",
      "roundNumber": 1,
      "roundType": "colour",
      "status": "active",
      "resultDeclarationTime": {...}
    }
  ]
}
```

**POST /trading/place-trade**

```json
{
  "success": true,
  "message": "Trade placed successfully",
  "data": {
    "trade": {...},
    "transaction": {
      "transactionId": "...",
      "amount": 100,
      "previousBalance": 10000,
      "newBalance": 9900
    },
    "roundInfo": {...}
  }
}
```

## ✅ Success Criteria

- [ ] Color trading page loads without errors
- [ ] Number trading page loads without errors
- [ ] Can place color trades successfully
- [ ] Can place number trades successfully
- [ ] Wallet balance updates correctly
- [ ] Timer counts down accurately
- [ ] Auto-refresh works every 5 seconds
- [ ] Error messages display appropriately
- [ ] Trade history shows correctly
- [ ] No console errors
- [ ] All API calls return 200

## 🐛 Troubleshooting

### Issue: "Network Error"

**Solution:** Check if backend server is running on port 5000

### Issue: "Unauthorized" or 401 errors

**Solution:** Login again to get fresh JWT token

### Issue: "No Active Round"

**Solution:** Use admin panel to create active rounds

### Issue: Timer shows negative values

**Solution:** Backend round time might be in the past, create new round

### Issue: Wallet not updating

**Solution:** Check browser console for API errors, verify backend response structure

### Issue: Trades not appearing

**Solution:**

1. Check if trade was successful (success toast)
2. Verify API response in Network tab
3. Check if roundId matches active round

## 📊 Test Data Requirements

### Minimum Requirements:

- **User Account:** With at least ₹1000 balance
- **Active Colour Round:** Created and status = 'active'
- **Active Number Round:** Created and status = 'active'
- **Round Duration:** At least 5 minutes for testing

### Recommended Test Account:

- Balance: ₹10,000+
- No pending trades (start fresh)

## 🎉 Integration Test Complete!

Once all tests pass, the backend integration is confirmed working correctly.

**Next:** Test on production/staging environment
