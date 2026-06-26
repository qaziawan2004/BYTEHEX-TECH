import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatPrice } from '../utils/helpers';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <img
        src={item.image}
        alt={item.name}
        className="w-16 h-16 object-cover rounded-lg"
      />
      <div className="flex-1">
        <h4 className="font-medium text-sm text-gray-900 dark:text-white">{item.name}</h4>
        <p className="text-sm font-bold text-gray-900 dark:text-white">
          {formatPrice(item.price)}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
      <button
        onClick={() => onRemove(item.id)}
        className="p-2 rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
      >
        <Trash2 className="w-4 h-4 text-red-500" />
      </button>
    </div>
  );
};

export default CartItem;