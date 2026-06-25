import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { formatPrice } from '../utils/helpers';
import CheckoutModal from './CheckoutModal';

const Cart = ({ isOpen, onClose, cart, onUpdateQuantity, onRemove, cartTotal, cartCount, showToast }) => {
  const [showCheckout, setShowCheckout] = useState(false);

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
              {cartCount} items
            </span>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your cart is empty</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Start shopping to add items</p>
                <button onClick={onClose} className="btn-primary mt-6">
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-gray-900 dark:text-white">{item.name}</h4>
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatPrice(item.price)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <button onClick={() => onRemove(item.id)} className="p-2 rounded hover:bg-rose-50 dark:hover:bg-rose-900/20">
                      <Trash2 className="w-4 h-4 text-rose-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="border-t dark:border-gray-700 pt-4 mt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600 dark:text-gray-400">Total:</span>
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatPrice(cartTotal)}
                </span>
              </div>
              <button
                onClick={() => setShowCheckout(true)}
                className="btn-primary w-full"
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>

      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        cartTotal={cartTotal}
        onClearCart={() => {
          cart.forEach(item => onRemove(item.id));
        }}
        showToast={showToast}
      />
    </>
  );
};

export default Cart;