# Trading System Integration Guide

## Backend Analysis Summary

### Available APIs

#### 1. User Trading Endpoints (`/api/trading/`)

**Place Trade**

- **Endpoint**: `POST /api/trading/place-trade`
- **Auth**: Required
- **Body**:
  ```json
  {
    "roundId": "string",
    "tradeType": "colour" | "number",
    "selection": "red" | "blue" | ... | 0-100,
    "amount": number
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Trade placed successfully",
    "data": {
      "trade": {
        "tradeId": "string",
        "userId": "string",
        "amount": number,
        "timestamp": "timestamp"
      },
      "transaction": {
        "transactionId": "string",
        "amount": number,
        "previousBalance": number,
        "newBalance": number
      },
      "roundInfo": {
        "roundId": "string",
        "roundNumber": number,
        "roundType": "colour" | "number"
      }
    }
  }
  ```

**Get Active Rounds**

- **Endpoint**: `GET /api/trading/active-rounds?roundType=colour|number`
- **Auth**: Required
- **Response**:
  ```json
  {
    "success": true,
    "count": number,
    "data": [
      {
        "id": "string",
        "roundId": "string",
        "roundNumber": number,
        "roundType": "colour" | "number",
        "startTime": "timestamp",
        "resultDeclarationTime": "timestamp",
        "status": "active" | "completed" | "cancelled",
        "colorTradeSummary": {
          "red": { "totalAmount": number, "totalTrades": number },
          ...
        },
        "numberTradeSummary": {
          "0": { "totalAmount": number, "totalTrades": number },
          ...
        },
        "totalColorAmount": number,
        "totalNumberAmount": number,
        "totalTrades": number
      }
    ]
  }
  ```

**Get Round Details**

- **Endpoint**: `GET /api/trading/rounds/:roundId`
- **Auth**: Required

**Get My Trades in Round**

- **Endpoint**: `GET /api/trading/rounds/:roundId/my-trades`
- **Auth**: Required
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "roundId": "string",
      "userId": "string",
      "colorTrades": {
        "red": [{ "tradeId": "string", "amount": number, "timestamp": "timestamp" }],
        ...
      },
      "numberTrades": {
        "0": [{ "tradeId": "string", "amount": number, "timestamp": "timestamp" }],
        ...
      },
      "totalColorAmount": number,
      "totalNumberAmount": number,
      "totalAmount": number
    }
  }
  ```

**Get All My Trades**

- **Endpoint**: `GET /api/trading/my-trades`
- **Auth**: Required

**Check My Winnings**

- **Endpoint**: `GET /api/trading/rounds/:roundId/winnings`
- **Auth**: Required
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "hasWon": boolean,
      "winnings": [
        {
          "userId": "string",
          "amount": number,
          "tradeType": "colour" | "number",
          "selection": "string | number"
        }
      ],
      "totalAmount": number,
      "result": "red" | 42,
      "walletBalance": number
    }
  }
  ```

**Get Wallet Balance**

- **Endpoint**: `GET /api/trading/wallet-balance`
- **Auth**: Required

### Trading Options

**Color Trading (12 colors)**:

- red
- blue
- green
- yellow
- orange
- purple
- pink
- brown
- cyan
- magenta
- lime
- violet

**Number Trading**:

- Numbers: 0 to 100 (101 total numbers)

### Round Lifecycle

1. **Active**: Round is open for trading
2. **Closed**: Trading period ended, waiting for results
3. **Completed**: Results declared, winners paid
4. **Cancelled**: Round cancelled by admin

### Socket.IO Events

**Client -> Server**:

- `join:trading` - Join trading room for color or number
  ```javascript
  socket.emit("join:trading", { gameType: "color" | "number" });
  ```
- `join:round` - Join specific round room
  ```javascript
  socket.emit("join:round", { roundId: "string" });
  ```

**Server -> Client**:

- `round:created` - New round created
- `round:updated` - Round data updated (new trades, time updates)
- `round:closed` - Round closed for trading
- `round:finalized` - Results declared, winners announced
- `trade:placed` - Someone placed a trade
- `countdown:tick` - Countdown timer update

### Wallet Integration

- Trades deduct from wallet balance automatically
- Winners receive payouts to wallet automatically
- All transactions recorded in wallet history with trading category

## Frontend Implementation Plan

### 1. TypeScript Interfaces (types/trading.ts)

```typescript
interface TradingRound {
  id: string;
  roundId: string;
  roundNumber: number;
  roundType: "colour" | "number";
  startTime: any;
  resultDeclarationTime: any;
  status: "active" | "completed" | "cancelled";
  result?: string | number;
  colorTradeSummary?: Record<
    string,
    { totalAmount: number; totalTrades: number }
  >;
  numberTradeSummary?: Record<
    number,
    { totalAmount: number; totalTrades: number }
  >;
  totalColorAmount?: number;
  totalNumberAmount?: number;
  totalTrades?: number;
}

interface Trade {
  tradeId: string;
  userId: string;
  amount: number;
  timestamp: any;
}

interface UserTrades {
  roundId: string;
  userId: string;
  colorTrades: Record<string, Trade[]>;
  numberTrades: Record<number, Trade[]>;
  totalColorAmount: number;
  totalNumberAmount: number;
  totalAmount: number;
}
```

### 2. API Service (services/tradingApi.ts)

- `placeTrade(roundId, tradeType, selection, amount)`
- `getActiveRounds(roundType?)`
- `getRoundDetails(roundId)`
- `getMyTradesInRound(roundId)`
- `getAllMyTrades()`
- `checkMyWinnings(roundId)`
- `getWalletBalance()`

### 3. UI Components

**ColorTrading.tsx**:

- Display active color round
- Show countdown timer
- 12 color buttons with bet amounts
- Quick bet amount selection (100, 500, 1000, 5000)
- Wallet balance display
- My trades in current round
- Result declaration when round ends

**NumberTrading.tsx**:

- Display active number round
- Show countdown timer
- Number grid (0-100) or number picker
- Quick bet amount selection
- Wallet balance display
- My trades in current round
- Result declaration when round ends

**TradingHistory.tsx**:

- List all past rounds
- Show trades made in each round
- Show winnings/losses
- Filter by color/number/all

### 4. Socket Integration

- Connect to Socket.IO server
- Join trading rooms on component mount
- Listen for round updates and countdown
- Update UI in real-time
- Show result animations

### 5. Navigation

- Add "Color Trading" and "Number Trading" to main menu
- Add "Trading History" to profile/dashboard menu
