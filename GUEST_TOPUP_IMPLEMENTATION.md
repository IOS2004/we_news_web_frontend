# Guest Top-up Implementation Summary

## Overview
Implemented a complete guest wallet top-up flow that allows users to add money without creating an account, integrating with the Cashfree payment gateway.

## Implementation Details

### 1. API Service Integration (`src/services/walletApi.ts`)

Added a new `guestTopup()` method to the `WalletService` class:

```typescript
async guestTopup(data: {
  email: string;
  password: string;
  dateOfBirth: string;
  amount: number;
  paymentMethod: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}): Promise<Response>
```

**Endpoint:** `POST /wallet/standalone/topup`

**Request Body:**
```json
{
  "email": "testuser@gmail.com",
  "password": "123456",
  "dateOfBirth": "1995-05-15",
  "amount": 1000,
  "paymentMethod": "cashfree",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "9876543210"
}
```

**Response Structure:**
```json
{
  "success": true,
  "message": "Wallet topup initiated successfully",
  "data": {
    "transactionId": "WALLET_1760610501976_50A0AFFA",
    "amounts": {
      "originalAmount": 1000,
      "discountAmount": 100,
      "discountedAmount": 900,
      "gstAmount": 162,
      "finalAmount": 1062,
      "creditAmount": 1000
    },
    "paymentResponse": {
      "paymentGateway": "cashfree",
      "paymentUrl": "https://sandbox.cashfree.com/pg/checkout?payment_session_id=...",
      "paymentData": {
        "payment_session_id": "session_...",
        "cf_order_id": 2198380169,
        "order_id": "WALLET_1760610501976_50A0AFFA",
        "order_amount": 1062,
        "order_status": "ACTIVE"
      }
    },
    "userDetails": {
      "userId": "wsUiBMspToSZ2cDPv4qk",
      "name": "Test User",
      "email": "testuser@gmail.com",
      "phone": "9876543210",
      "referralCode": "testuser123_mgt3guu0"
    }
  }
}
```

### 2. Guest Top-up Page Updates (`src/pages/GuestTopup.tsx`)

#### Key Changes:

1. **Added Amount Input Field**
   - Input field for entering the top-up amount
   - Quick amount selection buttons (₹100, ₹500, ₹1,000, ₹2,000, ₹5,000, ₹10,000)
   - Validation: Min ₹200, Max ₹1,00,000

2. **Updated Form Data Interface**
   ```typescript
   interface GuestUserData {
     email: string;
     dateOfBirth: string;
     password: string;
     confirmPassword: string;
     firstName?: string;
     lastName?: string;
     phoneNumber?: string;
     amount: number; // Added
   }
   ```

3. **Enhanced Form Submission Handler**
   - Validates all form fields including amount
   - Calls `walletService.guestTopup()` API
   - Extracts `payment_session_id` from response
   - Stores transaction details in `sessionStorage`
   - Redirects to Cashfree payment gateway using `paymentApi.processCashfreePayment()`

4. **Cashfree Payment Integration**
   ```typescript
   await paymentApi.processCashfreePayment(
     transactionId,
     payment_session_id,
     {
       onSuccess: (data) => {
         // Redirect to success page
         navigate('/payment-success', { 
           state: { 
             isGuest: true, 
             email: formData.email,
             amount: amounts.creditAmount 
           } 
         });
       },
       onFailure: (error) => {
         // Handle payment failure
       },
       onError: (error) => {
         // Handle payment error
       }
     }
   );
   ```

### 3. User Flow

```
1. User clicks "Pay" button (from landing page or add money page)
   ↓
2. Navigates to Guest Top-up page (/guest-topup)
   ↓
3. User fills form:
   - Email (required)
   - First Name (optional)
   - Last Name (optional)
   - Phone Number (optional)
   - Amount (required, min ₹200)
   - Date of Birth (required, 18+ years)
   - Password (required)
   - Confirm Password (required)
   ↓
4. User clicks "Continue to Payment"
   ↓
5. Frontend validates form
   ↓
6. Frontend calls API: POST /wallet/standalone/topup
   ↓
7. Backend creates guest user/transaction
   ↓
8. Backend initiates Cashfree payment order
   ↓
9. Backend returns payment_session_id
   ↓
10. Frontend opens Cashfree checkout popup
   ↓
11. User completes payment on Cashfree
   ↓
12. Cashfree redirects back with payment status
   ↓
13. Frontend navigates to success page
```

### 4. Form Validations

- **Email**: Valid email format (regex validation)
- **Age**: Must be 18+ years old (calculated from date of birth)
- **Password**: 
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
- **Phone Number** (optional): 10-digit Indian mobile number (starting with 6-9)
- **Amount**: 
  - Minimum: ₹200
  - Maximum: ₹1,00,000

### 5. Payment Gateway Integration

**Cashfree SDK Integration:**
- SDK loaded dynamically from: `https://sdk.cashfree.com/js/v3/cashfree.js`
- Payment mode: Sandbox (for testing) / Production
- Payment session created server-side
- Frontend opens checkout modal using `payment_session_id`

**Payment Callbacks:**
- `onSuccess`: Payment completed successfully
- `onFailure`: Payment declined or failed
- `onError`: Technical error during payment

### 6. Session Storage Data

**Key: `guestTopupTransaction`**
```json
{
  "transactionId": "WALLET_1760610501976_50A0AFFA",
  "amounts": {
    "originalAmount": 1000,
    "discountAmount": 100,
    "discountedAmount": 900,
    "gstAmount": 162,
    "finalAmount": 1062,
    "creditAmount": 1000
  },
  "userDetails": {
    "userId": "wsUiBMspToSZ2cDPv4qk",
    "name": "Test User",
    "email": "testuser@gmail.com",
    "phone": "9876543210",
    "referralCode": "testuser123_mgt3guu0"
  },
  "timestamp": "2025-10-16T15:58:23+05:30"
}
```

## Testing Checklist

- [ ] Form validation works correctly
- [ ] Quick amount buttons update the amount field
- [ ] API call is made with correct parameters
- [ ] Payment session ID is received from backend
- [ ] Cashfree checkout popup opens
- [ ] Payment success redirects to success page
- [ ] Payment failure shows error message
- [ ] Session storage is updated correctly
- [ ] All optional fields work correctly
- [ ] Age validation (18+) works
- [ ] Phone number validation works

## Files Modified

1. `src/services/walletApi.ts` - Added `guestTopup()` method
2. `src/pages/GuestTopup.tsx` - Complete implementation of guest top-up flow

## Dependencies

- `axios` - HTTP client
- `react-hot-toast` - Toast notifications
- `lucide-react` - Icons
- `react-router-dom` - Navigation
- Cashfree Payment Gateway SDK (loaded dynamically)

## Environment Variables

Ensure these are set in `.env`:

```env
VITE_API_URL=https://wenews.onrender.com/api
VITE_CASHFREE_APP_ID=your_cashfree_app_id
VITE_CASHFREE_MODE=sandbox
```

## Notes

- The guest user is created on the backend during the topup process
- User can create a full account later to track transactions
- Transaction details are stored in sessionStorage for reference
- Payment gateway fees and GST are calculated by the backend
- Discounts (if any) are applied by the backend

## Next Steps

1. Test the complete flow with actual Cashfree credentials
2. Create a payment success page (`/payment-success`)
3. Add option to create full account after guest topup
4. Implement payment failure handling page
5. Add transaction tracking for guest users
