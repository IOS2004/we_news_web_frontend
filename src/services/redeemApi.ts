import apiClient, { apiCall } from './apiClient';

// Types
export interface Product {
  _id: string;
  name: string;
  description: string;
  category: 'gift_card' | 'digital_credit' | 'subscription' | 'voucher';
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  stock: number;
  isActive: boolean;
  brand?: string;
  validityDays?: number;
  termsAndConditions?: string;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  product?: Product;
}

export interface Order {
  _id: string;
  userId: string;
  items: {
    productId: string;
    product: Product;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'wallet' | 'points';
  redemptionCodes?: {
    productId: string;
    code: string;
    redeemedAt?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface RedeemStats {
  totalOrders: number;
  totalSpent: number;
  pointsUsed: number;
  activeOrders: number;
  completedOrders: number;
  favoriteCategory?: string;
}

// API Methods
export const redeemApi = {
  // Get all products
  getProducts: async (filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    sort?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
  }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sort) params.append('sort', filters.sort);

    return apiCall<Product[]>(
      apiClient.get(`/redeem/products?${params.toString()}`)
    );
  },

  // Get product by ID
  getProductById: async (productId: string) => {
    return apiCall<Product>(
      apiClient.get(`/redeem/products/${productId}`)
    );
  },

  // Get featured products
  getFeaturedProducts: async () => {
    return apiCall<Product[]>(
      apiClient.get('/redeem/products/featured')
    );
  },

  // Get cart
  getCart: async () => {
    return apiCall<CartItem[]>(
      apiClient.get('/redeem/cart')
    );
  },

  // Add to cart
  addToCart: async (productId: string, quantity: number = 1) => {
    return apiCall<CartItem>(
      apiClient.post('/redeem/cart', { productId, quantity }),
      { showSuccess: true, successMessage: 'Added to cart!' }
    );
  },

  // Update cart item
  updateCartItem: async (productId: string, quantity: number) => {
    return apiCall<CartItem>(
      apiClient.put(`/redeem/cart/${productId}`, { quantity }),
      { showSuccess: true, successMessage: 'Cart updated!' }
    );
  },

  // Remove from cart
  removeFromCart: async (productId: string) => {
    return apiCall<{ success: boolean }>(
      apiClient.delete(`/redeem/cart/${productId}`),
      { showSuccess: true, successMessage: 'Removed from cart!' }
    );
  },

  // Clear cart
  clearCart: async () => {
    return apiCall<{ success: boolean }>(
      apiClient.delete('/redeem/cart'),
      { showSuccess: true, successMessage: 'Cart cleared!' }
    );
  },

  // Create order (checkout)
  createOrder: async (data: {
    items: { productId: string; quantity: number }[];
    paymentMethod: 'wallet' | 'points';
  }) => {
    return apiCall<Order>(
      apiClient.post('/redeem/orders', data),
      { showLoading: true, showSuccess: true, successMessage: 'Order placed successfully!' }
    );
  },

  // Get user orders
  getOrders: async (filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return apiCall<{ orders: Order[]; total: number; page: number; pages: number }>(
      apiClient.get(`/redeem/orders?${params.toString()}`)
    );
  },

  // Get order by ID
  getOrderById: async (orderId: string) => {
    return apiCall<Order>(
      apiClient.get(`/redeem/orders/${orderId}`)
    );
  },

  // Get redemption codes for order
  getRedemptionCodes: async (orderId: string) => {
    return apiCall<{ productId: string; productName: string; code: string; redeemedAt?: string }[]>(
      apiClient.get(`/redeem/orders/${orderId}/codes`)
    );
  },

  // Get redeem statistics
  getStats: async () => {
    return apiCall<RedeemStats>(
      apiClient.get('/redeem/stats')
    );
  },

  // Get categories
  getCategories: async () => {
    return apiCall<{ category: string; count: number; label: string }[]>(
      apiClient.get('/redeem/categories')
    );
  },

  // Check product availability
  checkAvailability: async (productId: string, quantity: number) => {
    return apiCall<{ available: boolean; stock: number }>(
      apiClient.post('/redeem/products/check-availability', {
        productId,
        quantity,
      })
    );
  },
};

export default redeemApi;
