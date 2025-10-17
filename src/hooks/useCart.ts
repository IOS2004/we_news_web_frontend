import { useState, useEffect, useCallback } from 'react';

// Cart item interface
export interface CartItem {
  id: string; // Unique ID for cart item
  roundId: string;
  gameType: 'color' | 'number';
  options: string[]; // Selected options (colors or numbers)
  amount: number;
  timestamp: number;
}

// Cart state interface
export interface Cart {
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
}

// Constants
const CART_STORAGE_KEY = 'wenews_trading_cart';
const MAX_CART_ITEMS = 20;

// Generate unique cart item ID
const generateCartItemId = (): string => {
  return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Calculate total amount from cart items
const calculateTotalAmount = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + item.amount, 0);
};

export const useCart = () => {
  const [cart, setCart] = useState<Cart>({
    items: [],
    totalAmount: 0,
    totalItems: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart: CartItem[] = JSON.parse(savedCart);
        setCart({
          items: parsedCart,
          totalAmount: calculateTotalAmount(parsedCart),
          totalItems: parsedCart.length,
        });
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
      localStorage.removeItem(CART_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart.items));
      } catch (error) {
        console.error('Failed to save cart to localStorage:', error);
      }
    }
  }, [cart.items, isLoading]);

  // Add item to cart
  const addItem = useCallback(
    (item: Omit<CartItem, 'id' | 'timestamp'>): { success: boolean; message: string; cartItem?: CartItem } => {
      // Validate max items
      if (cart.items.length >= MAX_CART_ITEMS) {
        return {
          success: false,
          message: `Cart is full! Maximum ${MAX_CART_ITEMS} orders allowed per batch.`,
        };
      }

      // Validate options
      if (!item.options || item.options.length === 0) {
        return {
          success: false,
          message: 'Please select at least one option.',
        };
      }

      // Validate amount
      if (!item.amount || item.amount <= 0) {
        return {
          success: false,
          message: 'Amount must be greater than 0.',
        };
      }

      // Create new cart item
      const newCartItem: CartItem = {
        ...item,
        id: generateCartItemId(),
        timestamp: Date.now(),
      };

      // Add to cart (duplicates are allowed)
      const updatedItems = [...cart.items, newCartItem];
      setCart({
        items: updatedItems,
        totalAmount: calculateTotalAmount(updatedItems),
        totalItems: updatedItems.length,
      });

      return {
        success: true,
        message: 'Added to cart successfully!',
        cartItem: newCartItem,
      };
    },
    [cart.items]
  );

  // Remove item from cart
  const removeItem = useCallback((itemId: string): boolean => {
    setCart((prevCart) => {
      const updatedItems = prevCart.items.filter((item) => item.id !== itemId);
      return {
        items: updatedItems,
        totalAmount: calculateTotalAmount(updatedItems),
        totalItems: updatedItems.length,
      };
    });
    return true;
  }, []);

  // Update item in cart
  const updateItem = useCallback(
    (itemId: string, updates: Partial<Omit<CartItem, 'id' | 'timestamp'>>): { success: boolean; message: string } => {
      const itemIndex = cart.items.findIndex((item) => item.id === itemId);
      if (itemIndex === -1) {
        return {
          success: false,
          message: 'Item not found in cart.',
        };
      }

      // Validate amount if provided
      if (updates.amount !== undefined && updates.amount <= 0) {
        return {
          success: false,
          message: 'Amount must be greater than 0.',
        };
      }

      // Validate options if provided
      if (updates.options !== undefined && updates.options.length === 0) {
        return {
          success: false,
          message: 'Please select at least one option.',
        };
      }

      // Update item
      const updatedItems = [...cart.items];
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        ...updates,
      };

      setCart({
        items: updatedItems,
        totalAmount: calculateTotalAmount(updatedItems),
        totalItems: updatedItems.length,
      });

      return {
        success: true,
        message: 'Cart item updated successfully!',
      };
    },
    [cart.items]
  );

  // Clear entire cart
  const clearCart = useCallback(() => {
    setCart({
      items: [],
      totalAmount: 0,
      totalItems: 0,
    });
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  // Get items by game type
  const getItemsByGameType = useCallback(
    (gameType: 'color' | 'number'): CartItem[] => {
      return cart.items.filter((item) => item.gameType === gameType);
    },
    [cart.items]
  );

  // Get items by round ID
  const getItemsByRoundId = useCallback(
    (roundId: string): CartItem[] => {
      return cart.items.filter((item) => item.roundId === roundId);
    },
    [cart.items]
  );

  // Check if cart has items for specific round
  const hasItemsForRound = useCallback(
    (roundId: string): boolean => {
      return cart.items.some((item) => item.roundId === roundId);
    },
    [cart.items]
  );

  // Validate cart against wallet balance
  const validateCartBalance = useCallback(
    (walletBalance: number): { isValid: boolean; message: string } => {
      if (cart.totalAmount > walletBalance) {
        return {
          isValid: false,
          message: `Insufficient balance! Cart total: ₹${cart.totalAmount}, Available: ₹${walletBalance}`,
        };
      }
      return {
        isValid: true,
        message: 'Cart is valid.',
      };
    },
    [cart.totalAmount]
  );

  // Remove items for specific round (useful when round ends)
  const removeItemsByRoundId = useCallback((roundId: string): number => {
    let removedCount = 0;
    setCart((prevCart) => {
      const updatedItems = prevCart.items.filter((item) => {
        if (item.roundId === roundId) {
          removedCount++;
          return false;
        }
        return true;
      });
      return {
        items: updatedItems,
        totalAmount: calculateTotalAmount(updatedItems),
        totalItems: updatedItems.length,
      };
    });
    return removedCount;
  }, []);

  return {
    cart,
    isLoading,
    addItem,
    removeItem,
    updateItem,
    clearCart,
    getItemsByGameType,
    getItemsByRoundId,
    hasItemsForRound,
    validateCartBalance,
    removeItemsByRoundId,
    maxItems: MAX_CART_ITEMS,
    canAddMore: cart.items.length < MAX_CART_ITEMS,
  };
};

export default useCart;
