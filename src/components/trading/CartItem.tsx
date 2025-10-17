import React from 'react';
import { X, Edit2 } from 'lucide-react';
import { CartItem as CartItemType } from '../../hooks/useCart';

interface CartItemProps {
  item: CartItemType;
  onRemove: (itemId: string) => void;
  onEdit?: (item: CartItemType) => void;
  showEdit?: boolean;
}

export const CartItem: React.FC<CartItemProps> = ({ item, onRemove, onEdit, showEdit = false }) => {
  const handleRemove = () => {
    onRemove(item.id);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(item);
    }
  };

  // Format options display based on game type
  const formatOptions = () => {
    if (item.gameType === 'color') {
      // For color trading, show color boxes
      return (
        <div className="flex flex-wrap gap-1.5">
          {item.options.map((color, index) => (
            <div
              key={index}
              className="w-6 h-6 rounded border-2 border-white shadow-sm"
              style={{ backgroundColor: color.toLowerCase() }}
              title={color}
            />
          ))}
        </div>
      );
    } else {
      // For number trading, show numbers as badges
      return (
        <div className="flex flex-wrap gap-1.5">
          {item.options.map((number, index) => (
            <span
              key={index}
              className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded"
            >
              {number}
            </span>
          ))}
        </div>
      );
    }
  };

  // Get game type display name
  const getGameTypeDisplay = () => {
    return item.gameType === 'color' ? 'Color Trading' : 'Number Trading';
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-3 hover:shadow-md hover:border-purple-200 transition-all duration-200 group">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${
            item.gameType === 'color' 
              ? 'bg-purple-100 text-purple-700' 
              : 'bg-blue-100 text-blue-700'
          }`}>
            {getGameTypeDisplay()}
          </div>
          <span className="text-xs text-gray-500">
            #{item.roundId.slice(-6)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {showEdit && onEdit && (
            <button
              onClick={handleEdit}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit2 size={14} />
            </button>
          )}
          <button
            onClick={handleRemove}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors group-hover:opacity-100 opacity-70"
            title="Remove from cart"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Compact Content */}
      <div className="flex items-center justify-between">
        {/* Left: Options Display */}
        <div className="flex-1 mr-3">
          <p className="text-xs text-gray-600 mb-2 font-medium">
            {item.gameType === 'color' ? 'Colors' : 'Numbers'}
          </p>
          {formatOptions()}
        </div>
        
        {/* Right: Amount */}
        <div className="text-right">
          <p className="text-xs text-gray-600 mb-1">Amount</p>
          <p className="text-lg font-bold text-purple-600">₹{item.amount}</p>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
