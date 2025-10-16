# Guest Top-up User Flow Diagram

## Visual Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           GUEST TOP-UP FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│  Landing Page    │
│  or Any Page     │
│                  │
│  [Pay Button] ───┼──> User clicks "Pay" or "Guest Top-up"
└──────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                         GUEST TOP-UP PAGE (/guest-topup)                     │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  📧 Email Address             → Required, email validation                   │
│  👤 First Name                → Optional                                     │
│  👤 Last Name                 → Optional                                     │
│  📱 Phone Number              → Optional, 10-digit validation                │
│                                                                               │
│  💰 Amount to Add             → Required, Min ₹200, Max ₹1,00,000           │
│     ┌─────┬─────┬─────┬─────┬─────┬─────┐                                  │
│     │ ₹100│ ₹500│₹1000│₹2000│₹5000│₹10K │ Quick Select Buttons             │
│     └─────┴─────┴─────┴─────┴─────┴─────┘                                  │
│                                                                               │
│  📅 Date of Birth             → Required, 18+ years validation               │
│  🔒 Create Password           → Required, strong password                    │
│  🔒 Confirm Password          → Required, must match                         │
│                                                                               │
│  [Continue to Payment] ───────┼──> User submits form                         │
└───────────────────────────────┼──────────────────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   FORM VALIDATION     │
                    └───────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
              ✅ Valid                ❌ Invalid
                    │                       │
                    │                       ▼
                    │           ┌───────────────────┐
                    │           │  Show Error       │
                    │           │  Messages         │
                    │           │  Stay on Page     │
                    │           └───────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                      API CALL: POST /wallet/standalone/topup                 │
├──────────────────────────────────────────────────────────────────────────────┤
│  Request Body:                                                                │
│  {                                                                            │
│    "email": "testuser@gmail.com",                                            │
│    "password": "Test@123",                                                   │
│    "dateOfBirth": "1995-05-15",                                              │
│    "amount": 1000,                                                           │
│    "paymentMethod": "cashfree",                                              │
│    "firstName": "John",                                                      │
│    "lastName": "Doe",                                                        │
│    "phoneNumber": "9876543210"                                               │
│  }                                                                            │
└───────────────────────────────────────────────────────────────────────────┬──┘
                                                                              │
                                                                              ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                             BACKEND PROCESSING                                │
├──────────────────────────────────────────────────────────────────────────────┤
│  1. Validate user data                                                        │
│  2. Create/Find guest user account                                           │
│  3. Calculate amounts (GST, discounts)                                       │
│  4. Create payment order in Cashfree                                         │
│  5. Generate payment_session_id                                              │
│  6. Return response with payment details                                     │
└───────────────────────────────────────────────────────────────────────┬──────┘
                                                                          │
                                                                          ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                              API RESPONSE                                     │
├──────────────────────────────────────────────────────────────────────────────┤
│  {                                                                            │
│    "success": true,                                                           │
│    "data": {                                                                  │
│      "transactionId": "WALLET_1760610501976_50A0AFFA",                       │
│      "amounts": {                                                             │
│        "originalAmount": 1000,                                               │
│        "finalAmount": 1062,                                                  │
│        "creditAmount": 1000                                                  │
│      },                                                                       │
│      "paymentResponse": {                                                     │
│        "paymentData": {                                                       │
│          "payment_session_id": "session_xxx",  ◄── CRITICAL                 │
│          "cf_order_id": 2198380169,                                          │
│          "order_amount": 1062                                                │
│        }                                                                      │
│      },                                                                       │
│      "userDetails": { ... }                                                  │
│    }                                                                          │
│  }                                                                            │
└───────────────────────────────────────────────────────────────────────┬──────┘
                                                                          │
                                                                          ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND PROCESSING                                    │
├──────────────────────────────────────────────────────────────────────────────┤
│  1. Extract payment_session_id from response                                 │
│  2. Store transaction details in sessionStorage                              │
│  3. Call paymentApi.processCashfreePayment()                                 │
│  4. Show toast: "Redirecting to payment gateway..."                          │
└───────────────────────────────────────────────────────────────────────┬──────┘
                                                                          │
                                                                          ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                      CASHFREE PAYMENT GATEWAY                                 │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────┐            │
│  │          Cashfree Checkout Modal Opens                       │            │
│  │                                                               │            │
│  │  Order ID: WALLET_1760610501976_50A0AFFA                    │            │
│  │  Amount: ₹1,062.00                                           │            │
│  │                                                               │            │
│  │  Payment Methods:                                            │            │
│  │  • UPI                                                       │            │
│  │  • Credit/Debit Card                                         │            │
│  │  • Net Banking                                               │            │
│  │  • Wallets                                                   │            │
│  │                                                               │            │
│  │  User selects method and completes payment                  │            │
│  └─────────────────────────────────────────────────────────────┘            │
│                                                                               │
└───────────────────────────────────────────────────────────────────────┬──────┘
                                                                          │
                    ┌─────────────────────────────────────────────────┐ │
                    │                                                   │ │
              ✅ Success                                    ❌ Failure  │ │
                    │                                                   │ │
                    ▼                                                   ▼ │
    ┌───────────────────────────┐                 ┌──────────────────────┐
    │  Payment Success          │                 │  Payment Failed      │
    │  Callback                 │                 │  Callback            │
    └───────────────────────────┘                 └──────────────────────┘
                    │                                         │
                    ▼                                         ▼
    ┌───────────────────────────┐                 ┌──────────────────────┐
    │  Show Success Toast       │                 │  Show Error Toast    │
    │  "₹1000 added to wallet"  │                 │  Stay on Page        │
    └───────────────────────────┘                 │  Allow Retry         │
                    │                              └──────────────────────┘
                    ▼
    ┌───────────────────────────┐
    │  Navigate to              │
    │  /payment-success         │
    │                           │
    │  State: {                 │
    │    isGuest: true,         │
    │    email: "...",          │
    │    amount: 1000           │
    │  }                        │
    └───────────────────────────┘
                    │
                    ▼
    ┌───────────────────────────┐
    │  Payment Success Page     │
    │                           │
    │  • Show success message   │
    │  • Display amount         │
    │  • Option to create       │
    │    full account           │
    │  • View transaction       │
    └───────────────────────────┘
```

## Key Components

### 1. Form Validation Layer
```
Email → Regex validation → Valid email format
Age → Calculate from DOB → Must be 18+
Password → Strength check → 8+ chars, uppercase, lowercase, number
Phone → Format check → 10 digits starting with 6-9
Amount → Range check → ₹200 to ₹1,00,000
```

### 2. API Integration Layer
```
Frontend (React) 
    ↓ axios
walletService.guestTopup() 
    ↓ POST request
Backend API (/wallet/standalone/topup)
    ↓ Create order
Cashfree API
    ↓ Return session
Backend Response
    ↓ JSON
Frontend Processing
```

### 3. Payment Processing Layer
```
payment_session_id 
    ↓
paymentApi.processCashfreePayment()
    ↓
Load Cashfree SDK
    ↓
Open Checkout Modal
    ↓ User pays
Cashfree processes payment
    ↓ Callback
Success/Failure Handler
```

## Data Flow Diagram

```
┌─────────────┐
│  Form Data  │
└──────┬──────┘
       │
       ▼
┌──────────────────────┐
│  Validation Engine   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐      ┌──────────────────┐
│  API Service Layer   │─────▶│  Backend API     │
└──────┬───────────────┘      └──────┬───────────┘
       │                              │
       │                              ▼
       │                      ┌──────────────────┐
       │                      │  Cashfree API    │
       │                      └──────┬───────────┘
       │                              │
       │◀─────────────────────────────┘
       │
       ▼
┌──────────────────────┐
│  Payment Processor   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Cashfree Checkout   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Success Handler     │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Navigation/UI       │
└──────────────────────┘
```

## State Management

```javascript
// Form State
formData = {
  email: string,
  firstName?: string,
  lastName?: string,
  phoneNumber?: string,
  amount: number,
  dateOfBirth: string,
  password: string,
  confirmPassword: string
}

// Validation State
errors = {
  email?: string,
  phoneNumber?: string,
  dateOfBirth?: string,
  password?: string,
  confirmPassword?: string
}

// UI State
isSubmitting: boolean

// Session Storage
guestTopupTransaction = {
  transactionId: string,
  amounts: object,
  userDetails: object,
  timestamp: string
}
```

## Error Handling Flow

```
Error Occurs
    │
    ├─ Network Error → Toast: "Check connection"
    │
    ├─ Validation Error → Show field errors
    │
    ├─ API Error → Toast: API message
    │
    ├─ Payment Error → Toast: "Payment failed"
    │
    └─ Unknown Error → Toast: "Try again"
```

## Security Considerations

1. ✅ Password validation (strong password required)
2. ✅ Age verification (18+ only)
3. ✅ Email validation (prevent fake emails)
4. ✅ HTTPS for API calls
5. ✅ Cashfree handles sensitive payment data
6. ✅ No sensitive data in localStorage (uses sessionStorage)
7. ✅ Backend validates all inputs again

## Performance Optimization

1. Form validation on change (real-time feedback)
2. Debounced API calls (if needed)
3. Lazy load Cashfree SDK (only when needed)
4. Optimistic UI updates
5. Error boundaries for crash prevention
