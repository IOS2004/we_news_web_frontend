# Quick Testing Guide - Guest Top-up Feature

## Prerequisites
- Backend server running at the configured API URL
- Cashfree sandbox credentials configured
- Frontend development server running

## Test Scenarios

### 1. Basic Happy Path
1. Navigate to `/guest-topup`
2. Fill in the form:
   - Email: `testuser@gmail.com`
   - First Name: `John` (optional)
   - Last Name: `Doe` (optional)
   - Phone: `9876543210` (optional)
   - Amount: Click ₹1,000 quick button or type amount
   - Date of Birth: Select a date that makes user 18+ years old
   - Password: `Test@123`
   - Confirm Password: `Test@123`
3. Click "Continue to Payment"
4. Verify API call is made to `/wallet/standalone/topup`
5. Verify Cashfree checkout modal opens
6. Complete payment in sandbox mode
7. Verify redirect to success page

### 2. Form Validation Tests

#### Email Validation
- ❌ Empty email → "Email is required"
- ❌ Invalid format (test@) → "Please enter a valid email address"
- ✅ Valid email (test@example.com) → Shows green checkmark

#### Age Validation
- ❌ Under 18 years → "You must be at least 18 years old"
- ✅ 18+ years → Passes validation

#### Password Validation
- ❌ Less than 8 characters → Error message
- ❌ No uppercase → "Password must be at least 8 characters with uppercase, lowercase, and number"
- ❌ No lowercase → Same error
- ❌ No number → Same error
- ✅ Valid password (Test@123) → Shows all green checkmarks

#### Password Match Validation
- ❌ Passwords don't match → "Passwords do not match"
- ✅ Passwords match → Shows green checkmark "Passwords match"

#### Phone Number Validation (Optional)
- ✅ Empty → Passes (optional field)
- ❌ Less than 10 digits → "Please enter a valid 10-digit phone number"
- ❌ Starts with 0-5 → Same error
- ✅ Valid 10-digit (9876543210) → Shows green checkmark

#### Amount Validation
- ❌ Empty → "Please enter amount (minimum ₹200)"
- ❌ Less than ₹200 → Same error
- ❌ More than ₹1,00,000 → "Maximum amount is ₹1,00,000"
- ✅ Between ₹200-₹1,00,000 → Passes validation

### 3. Quick Amount Buttons Test
1. Click each quick amount button (₹100, ₹500, ₹1,000, ₹2,000, ₹5,000, ₹10,000)
2. Verify amount field updates correctly
3. Verify selected button is highlighted with gradient

### 4. API Integration Test

**Expected Request:**
```json
POST /wallet/standalone/topup
Content-Type: application/json

{
  "email": "testuser@gmail.com",
  "password": "Test@123",
  "dateOfBirth": "1995-05-15",
  "amount": 1000,
  "paymentMethod": "cashfree",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "9876543210"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Wallet topup initiated successfully",
  "data": {
    "transactionId": "WALLET_xxx",
    "amounts": {
      "originalAmount": 1000,
      "finalAmount": 1062,
      "creditAmount": 1000
    },
    "paymentResponse": {
      "paymentData": {
        "payment_session_id": "session_xxx"
      }
    }
  }
}
```

### 5. Cashfree Payment Modal Test
1. After successful API call, verify:
   - Toast message: "Redirecting to payment gateway..."
   - Cashfree checkout modal opens
   - Order amount matches backend calculation
   - Transaction ID is correct

### 6. Payment Success Flow
1. Complete payment successfully in Cashfree
2. Verify:
   - Success toast: "₹1000 has been added to your wallet!"
   - Redirect to `/payment-success` page
   - Session storage has `guestTopupTransaction` data

### 7. Payment Failure Flow
1. Simulate payment failure in Cashfree
2. Verify:
   - Error toast message appears
   - User stays on guest topup page
   - Can retry payment

### 8. Edge Cases

#### Network Error
- Disconnect network
- Submit form
- Verify error toast: "Network error. Please check your connection."

#### Server Error
- Stop backend server
- Submit form
- Verify appropriate error message

#### Invalid Token/Auth
- Test with expired or invalid credentials
- Verify proper error handling

## Console Checks

Open browser DevTools Console and check for:
- ✅ API request logs: `"Initiating guest topup..."`
- ✅ API response logs: `"Guest topup API response:"`
- ✅ Payment session ID: `"Payment session ID: session_xxx"`
- ❌ No console errors

## Network Tab Checks

1. Open DevTools Network tab
2. Submit form
3. Verify:
   - POST request to `/wallet/standalone/topup`
   - Status: 200 OK
   - Response contains `payment_session_id`
   - Cashfree SDK script loaded

## Session Storage Check

After successful API call:
```javascript
// Check in DevTools Console
JSON.parse(sessionStorage.getItem('guestTopupTransaction'))
```

Should return:
```json
{
  "transactionId": "WALLET_xxx",
  "amounts": { ... },
  "userDetails": { ... },
  "timestamp": "2025-10-16T..."
}
```

## Testing Checklist

### Functional Tests
- [ ] All form fields accept input correctly
- [ ] All validations work as expected
- [ ] Quick amount buttons work
- [ ] API call is made with correct data
- [ ] Cashfree modal opens successfully
- [ ] Payment success flow works
- [ ] Payment failure flow works
- [ ] Error handling works

### UI/UX Tests
- [ ] Form is responsive on mobile
- [ ] All icons render correctly
- [ ] Loading states show during submission
- [ ] Toast notifications appear
- [ ] Password strength indicators work
- [ ] Validation messages are clear
- [ ] Success checkmarks appear

### Edge Cases
- [ ] Network error handling
- [ ] Server error handling
- [ ] Invalid data handling
- [ ] Duplicate submission prevention (button disabled while processing)
- [ ] Browser back button behavior

## Common Issues & Solutions

### Issue: Cashfree modal doesn't open
- **Check**: Is Cashfree SDK loaded? (Network tab)
- **Check**: Is `payment_session_id` present in API response?
- **Solution**: Verify backend Cashfree integration

### Issue: API returns 401 Unauthorized
- **Check**: Is this a guest endpoint? (shouldn't require auth)
- **Solution**: Verify backend route is public

### Issue: Payment amount mismatch
- **Check**: Backend calculates GST and discounts
- **Solution**: Verify amounts in API response

### Issue: Form won't submit
- **Check**: Are all required fields filled correctly?
- **Check**: Console for validation errors
- **Solution**: Review validation logic

## Test Data

### Valid Test Data
```
Email: testuser@gmail.com
First Name: John
Last Name: Doe
Phone: 9876543210
Date of Birth: 1995-05-15
Password: Test@123
Amount: 1000
```

### Invalid Test Data (for error testing)
```
Email: invalid-email
Date of Birth: 2020-01-01 (under 18)
Password: weak (no uppercase/number)
Phone: 123456 (invalid)
Amount: 100 (below minimum)
```

## Performance Checks
- [ ] Form renders in < 1 second
- [ ] API call completes in < 3 seconds
- [ ] Cashfree modal opens in < 2 seconds
- [ ] No memory leaks (check DevTools Performance tab)

## Accessibility Checks
- [ ] All form fields have labels
- [ ] Error messages are screen-reader friendly
- [ ] Keyboard navigation works
- [ ] Focus states are visible
- [ ] Color contrast meets WCAG standards

## Ready for Production?
- [ ] All test scenarios pass
- [ ] No console errors
- [ ] Error handling is robust
- [ ] Loading states are clear
- [ ] User experience is smooth
- [ ] Documentation is complete
