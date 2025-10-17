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

  // Get relative time display
  const getTimeDisplay = () => {
    const now = Date.now();
    const diff = now - item.timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes === 0) {
      return 'Just now';
    } else if (minutes === 1) {
      return '1 min ago';
    } else if (minutes < 60) {
      return `${minutes} mins ago`;
    } else {
      const hours = Math.floor(minutes / 60);
      return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-4 hover:shadow-lg hover:border-purple-200 transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
              item.gameType === 'color' 
                ? 'bg-purple-100 text-purple-700' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              {getGameTypeDisplay()}
            </div>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {getTimeDisplay()}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Round: <span className="font-mono font-medium text-gray-700">#{item.roundId.slice(-8)}</span>
          </p>
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

      {/* Options Display */}
      <div className="mb-4">
        <p className="text-xs text-gray-600 mb-3 uppercase tracking-wide font-medium">
          Selected {item.gameType === 'color' ? 'Colors' : 'Numbers'}
        </p>
        <div className="bg-white p-3 rounded-xl border border-gray-100">
          {formatOptions()}
        </div>
      </div>

      {/* Amount Section */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 border-l-4 border-green-400">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Bet Amount</span>
          <span className="text-xl font-black text-green-600">₹{item.amount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Potential Win (2x)</span>
          <span className="text-sm font-bold text-purple-600">₹{item.amount * 2}</span>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
