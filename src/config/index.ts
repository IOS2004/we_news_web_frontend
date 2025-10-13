// Environment configuration
export const config = {
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL || "https://wenews.onrender.com/api",
  appName: import.meta.env.VITE_APP_NAME || "WeNews",
  appVersion: import.meta.env.VITE_APP_VERSION || "1.0.0",
  cashfree: {
    appId: import.meta.env.VITE_CASHFREE_APP_ID || "",
    mode: import.meta.env.VITE_CASHFREE_MODE || "sandbox",
  },
} as const;

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "wenews_auth_token",
  USER_DATA: "wenews_user_data",
  THEME: "wenews_theme",
} as const;

// App constants
export const APP_CONSTANTS = {
  NEWS_CATEGORIES: [
    "Technology",
    "Business",
    "Sports",
    "Entertainment",
    "Health",
    "Science",
    "Politics",
    "World",
  ],
  TRADING_COLORS: ["Red", "Green", "Violet"],
  TRADING_NUMBERS: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  MIN_WITHDRAWAL_AMOUNT: 500,
  MAX_WITHDRAWAL_AMOUNT: 50000,
  NEWS_READING_REWARD: 0.5, // ₹0.5 per article
} as const;

export default config;
