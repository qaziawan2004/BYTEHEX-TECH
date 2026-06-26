import React from 'react';
import { X, Heart, ShoppingCart, ArrowLeft } from 'lucide-react';
import { formatPrice } from '../utils/helpers';

const Wishlist = ({ isOpen, onClose, wishlist, onAddToCart, onToggleWishlist }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-container">
        <div className="modal-content max-w-md p-6">
          {/* Header with Back Button */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onClose}
              className="back-button"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Shop
            </button>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {wishlist.length} items
            </span>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {wishlist.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your wishlist is empty</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Save your favorite items here</p>
                <button onClick={onClose} className="btn-primary mt-6">
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {wishlist.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-gray-900 dark:text-white">{item.name}</h4>
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatPrice(item.price)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onAddToCart(item)}
                        className="p-2 rounded hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4 text-emerald-500" />
                      </button>
                      <button
                        onClick={() => onToggleWishlist(item)}
                        className="p-2 rounded hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                      >
                        <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Wishlist;