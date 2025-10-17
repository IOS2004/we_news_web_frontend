import React, { useState } from 'react';
import { X, Trash2, Send, AlertCircle, Loader2 } from 'lucide-react';
import { Cart } from '../../hooks/useCart';
import { CartItem } from './CartItem';

interface CartDrawerProps {
  cart: Cart;
  isOpen: boolean;
  onClose: () => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onSubmitOrders: () => Promise<void>;
  walletBalance: number;
  isSubmitting?: boolean;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  cart,
  isOpen,
  onClose,
  onRemoveItem,
  onClearCart,
  onSubmitOrders,
  walletBalance,
  isSubmitting = false,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearCart = () => {
    if (showClearConfirm) {
      onClearCart();
      setShowClearConfirm(false);
    } else {
      setShowClearConfirm(true);
      // Auto-hide confirmation after 3 seconds
      setTimeout(() => setShowClearConfirm(false), 3000);
    }
  };

  const handleSubmit = async () => {
    await onSubmitOrders();
  };

  // Check if user has sufficient balance
  const hasInsufficientBalance = cart.finalAmount > walletBalance;

  // Group items by game type
  const colorItems = cart.items.filter((item) => item.gameType === 'color');
  const numberItems = cart.items.filter((item) => item.gameType === 'number');

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ height: '92vh', maxHeight: '92vh' }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 text-white px-6 py-5 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-black">Your Cart</h2>
                <p className="text-sm text-white/80">
                  {cart.totalItems} {cart.totalItems === 1 ? 'order' : 'orders'} ready to place
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Cart Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-6 py-4" style={{ maxHeight: 'calc(92vh - 200px)' }}>
          {cart.items.length === 0 ? (
            <div className="text-center py-16">
              <div className="relative inline-block mb-6">
                <div className="bg-gradient-to-br from-purple-100 to-blue-100 p-6 rounded-full">
                  <svg
                    className="w-16 h-16 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2">
                  <span className="block w-2 h-2 bg-white rounded-full"></span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-4">Select colors or numbers to add orders to your cart</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                <span>💡</span>
                <span>Add multiple orders before placing them all at once!</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Color Trading Orders */}
              {colorItems.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    Color Trading ({colorItems.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {colorItems.map((item) => (
                      <CartItem key={item.id} item={item} onRemove={onRemoveItem} />
                    ))}
                  </div>
                </div>
              )}

              {/* Number Trading Orders */}
              {numberItems.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Number Trading ({numberItems.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {numberItems.map((item) => (
                      <CartItem key={item.id} item={item} onRemove={onRemoveItem} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer (Always visible) */}
        <div className="flex-shrink-0 bg-gradient-to-t from-gray-50 to-white border-t border-gray-200 px-6 py-4">
          {/* Balance Warning */}
          {hasInsufficientBalance && (
            <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-400 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="bg-red-100 p-2 rounded-full">
                  <AlertCircle size={18} className="text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-800 mb-1">Insufficient Balance</p>
                  <p className="text-xs text-red-600">
                    You need ₹{cart.finalAmount} but only have ₹{walletBalance} available
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Summary Card */}
          <div className="mb-3 p-3 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl border border-purple-100">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Orders</p>
                  <p className="text-xl font-black text-gray-800">{cart.totalItems}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Potential Win</p>
                  <p className="text-xl font-black text-green-600">₹{cart.totalAmount * 2}</p>
                </div>
              </div>
              
              {/* Price Breakdown */}
              <div className="bg-white/70 rounded-xl p-3 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold text-gray-800">₹{cart.totalAmount}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Service Charge (10%):</span>
                  <span className="font-semibold text-orange-600">₹{cart.serviceCharge}</span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-purple-600">Total Amount:</span>
                    <span className="text-xl font-black text-purple-600">₹{cart.finalAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {/* Submit Orders Button - Beautiful */}
            <button
              onClick={handleSubmit}
              disabled={cart.items.length === 0 || hasInsufficientBalance || isSubmitting}
              className="group w-full py-4 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white rounded-2xl font-bold text-lg hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <>
                  <div className="relative">
                    <Loader2 size={20} className="animate-spin" />
                    <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
                  </div>
                  <span>Placing Orders...</span>
                </>
              ) : (
                <>
                  <div className="bg-white/20 p-2 rounded-full group-hover:bg-white/30 transition-colors">
                    <Send size={16} />
                  </div>
                  <span>Place All {cart.totalItems} Orders</span>
                  <div className="bg-white/20 px-2 py-1 rounded-full text-sm font-black">
                    ₹{cart.finalAmount}
                  </div>
                </>
              )}
            </button>

            {/* Clear Cart Button - Elegant */}
            <button
              onClick={handleClearCart}
              disabled={cart.items.length === 0 || isSubmitting}
              className={`w-full py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                showClearConfirm
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg hover:from-red-600 hover:to-pink-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Trash2 size={16} />
              {showClearConfirm ? 'Confirm Clear All' : 'Clear All Orders'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
