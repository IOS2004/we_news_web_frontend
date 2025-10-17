import React from 'react';
import { ShoppingCart } from 'lucide-react';

interface CartSummaryBarProps {
  itemCount: number;
  totalAmount: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export const CartSummaryBar: React.FC<CartSummaryBarProps> = ({
  itemCount,
  totalAmount,
  onToggle,
}) => {
  return (
    <div
      className={`fixed bottom-4 right-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl shadow-2xl transform transition-all duration-300 z-50 ${
        itemCount > 0 ? 'translate-x-0 scale-100' : 'translate-x-full scale-0'
      }`}
    >
      <button
        onClick={onToggle}
        className="flex items-center gap-3 px-6 py-4 hover:opacity-90 transition-opacity rounded-2xl border-2 border-white/30"
      >
        {/* Left Section: Cart Icon + Item Count */}
        <div className="relative">
          <ShoppingCart size={28} />
          {itemCount > 0 && (
            <span className="absolute -top-3 -right-3 bg-yellow-400 text-black text-sm font-black rounded-full w-7 h-7 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </div>
        
        {/* Center Section: Cart Info */}
        <div className="text-left">
          <p className="text-sm font-black uppercase tracking-wide">CART</p>
          <p className="text-xl font-black">₹{totalAmount}</p>
        </div>

        {/* Right Section: View Cart */}
        <div className="bg-white/20 px-3 py-1 rounded-full">
          <p className="text-xs font-bold">VIEW</p>
        </div>
      </button>
    </div>
  );
};

export default CartSummaryBar;
