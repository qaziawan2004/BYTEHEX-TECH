import React from 'react';
import { X, Star, ShoppingCart, Heart, ArrowLeft } from 'lucide-react';
import { formatPrice } from '../utils/helpers';

const QuickViewModal = ({ 
  isOpen, onClose, product, onAddToCart, onToggleWishlist, isWishlisted 
}) => {
  if (!isOpen || !product) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-container">
        <div className="modal-content max-w-2xl p-6">
          {/* Header with Back Button */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onClose}
              className="back-button"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Shop
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Image */}
            <div>
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>

            {/* Details */}
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{product.category}</span>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1">{product.name}</h2>
              
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="ml-1 font-semibold">{product.rating}</span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500 dark:text-gray-400">{product.reviews} reviews</span>
              </div>

              <p className="mt-4 text-gray-600 dark:text-gray-300">
                {product.description}
              </p>

              <div className="mt-4">
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatPrice(product.price)}
                </span>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    onAddToCart(product);
                    onClose();
                  }}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
                <button
                  onClick={() => onToggleWishlist(product)}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-gray-600 dark:text-gray-300'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuickViewModal;