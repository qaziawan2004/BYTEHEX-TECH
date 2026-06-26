import React, { useState, useEffect } from 'react';
import { 
  X, CreditCard, ArrowLeft, CheckCircle, Minus, Plus, 
  Shield, Truck, Award, Zap, ShoppingBag
} from 'lucide-react';
import { formatPrice, validateCheckout, applyDiscount } from '../utils/helpers';

const CheckoutModal = ({ 
  isOpen, onClose, cart, cartTotal, onUpdateQuantity, onRemove, onClearCart, showToast 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });
  const [errors, setErrors] = useState({});
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setOrderComplete(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formatted = value;
    
    if (name === 'cardNumber') {
      formatted = value.replace(/\D/g, '').slice(0, 16);
      formatted = formatted.replace(/(.{4})/g, '$1 ').trim();
    }
    if (name === 'expiry') {
      formatted = value.replace(/\D/g, '').slice(0, 4);
      if (formatted.length >= 2) {
        formatted = formatted.slice(0, 2) + '/' + formatted.slice(2);
      }
    }
    if (name === 'cvv') {
      formatted = value.replace(/\D/g, '').slice(0, 4);
    }
    
    setFormData({ ...formData, [name]: formatted });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleDiscount = () => {
    const discount = applyDiscount(cartTotal, discountCode);
    if (discount > 0) {
      setDiscountApplied(discount);
      showToast(`🎉 ${discount * 100}% discount applied!`, 'success');
    } else {
      showToast('Invalid discount code', 'error');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateCheckout(formData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToast('Please fix the errors', 'error');
      return;
    }

    setIsSubmitting(true);
    
    setTimeout(() => {
      onClearCart();
      setOrderComplete(true);
      setIsSubmitting(false);
      showToast('🎉 Thanks for Shopping!', 'success');
      
      setTimeout(() => {
        onClose();
        setFormData({ name: '', email: '', address: '', cardNumber: '', expiry: '', cvv: '' });
        setDiscountApplied(0);
        setDiscountCode('');
        setOrderComplete(false);
      }, 2000);
      
    }, 1500);
  };

  const finalTotal = cartTotal * (1 - discountApplied);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Success View
  if (orderComplete) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
        <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-3xl max-w-md w-full p-10 shadow-2xl animate-fade-in text-center border border-emerald-500/20">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 rounded-t-3xl" />
          <div className="w-24 h-24 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border-2 border-emerald-500/30">
            <CheckCircle className="w-12 h-12 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Order Complete! 🎉</h2>
          <p className="text-gray-400 mb-2">Thank you for shopping with</p>
          <p className="text-xl font-bold text-emerald-400 mb-6">PremiumVella</p>
          <button 
            onClick={() => {
              onClose();
              setOrderComplete(false);
              setFormData({ name: '', email: '', address: '', cardNumber: '', expiry: '', cvv: '' });
              setDiscountApplied(0);
              setDiscountCode('');
            }}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3.5 rounded-2xl font-semibold transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-white/5 animate-fade-in">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400" />
        
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-black/50 backdrop-blur-sm border-b border-white/5">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all duration-200 border border-white/5 hover:border-emerald-500/30"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Cart</span>
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-gray-300">{itemCount} items</span>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-xl hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(92vh-80px)] custom-scrollbar">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left Column - Order Summary */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-emerald-400 rounded-full" />
                <h3 className="text-lg font-bold text-white">Order Summary</h3>
              </div>
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item) => (
                  <div key={item.id} className="group flex items-center gap-4 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/5 hover:border-emerald-500/20">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-white truncate">{item.name}</h4>
                      <p className="text-sm font-bold text-emerald-400">{formatPrice(item.price)}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <button 
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} 
                          className="w-7 h-7 rounded-full border border-white/10 hover:border-emerald-500/50 flex items-center justify-center hover:bg-emerald-500/10 transition-all duration-200 text-gray-400 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-medium text-white w-6 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} 
                          className="w-7 h-7 rounded-full border border-white/10 hover:border-emerald-500/50 flex items-center justify-center hover:bg-emerald-500/10 transition-all duration-200 text-gray-400 hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <button 
                      onClick={() => onRemove(item.id)} 
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-xl hover:bg-rose-500/10 transition-all duration-200 text-rose-400 hover:text-rose-300"
                    >
                      <span className="text-xs font-medium">✕</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Trust Badges */}
              <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border border-white/5">
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-gray-400">Secure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-teal-400" />
                    <span className="text-xs text-gray-400">Free Ship</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-gray-400">Premium</span>
                  </div>
                </div>
              </div>

              {/* Cart Total */}
              <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total</span>
                  <span className="text-2xl font-bold text-emerald-400">{formatPrice(cartTotal)}</span>
                </div>
              </div>
            </div>

            {/* Right Column - Payment Form (No Icons) */}
            <div className="lg:col-span-3">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-emerald-400 rounded-full" />
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  Payment Details
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name & Email - 2 Column */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Full Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="John Doe" 
                      className={`w-full px-4 py-3 rounded-2xl bg-white/5 border ${errors.name ? 'border-rose-500' : 'border-white/10'} text-white placeholder-gray-500 focus:outline-none transition-all duration-200 ${focusedField === 'name' ? 'ring-2 ring-emerald-500/50' : ''}`} 
                    />
                    {errors.name && <p className="text-rose-400 text-xs mt-1.5">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="john@example.com" 
                      className={`w-full px-4 py-3 rounded-2xl bg-white/5 border ${errors.email ? 'border-rose-500' : 'border-white/10'} text-white placeholder-gray-500 focus:outline-none transition-all duration-200 ${focusedField === 'email' ? 'ring-2 ring-emerald-500/50' : ''}`} 
                    />
                    {errors.email && <p className="text-rose-400 text-xs mt-1.5">{errors.email}</p>}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Shipping Address</label>
                  <textarea 
                    name="address" 
                    value={formData.address} 
                    onChange={handleChange} 
                    onFocus={() => setFocusedField('address')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="123 Main St, City, State, ZIP" 
                    rows="2" 
                    className={`w-full px-4 py-3 rounded-2xl bg-white/5 border ${errors.address ? 'border-rose-500' : 'border-white/10'} text-white placeholder-gray-500 focus:outline-none transition-all duration-200 resize-none ${focusedField === 'address' ? 'ring-2 ring-emerald-500/50' : ''}`} 
                  />
                  {errors.address && <p className="text-rose-400 text-xs mt-1.5">{errors.address}</p>}
                </div>

                {/* Card Number */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Card Number</label>
                  <input 
                    type="text" 
                    name="cardNumber" 
                    value={formData.cardNumber} 
                    onChange={handleChange} 
                    onFocus={() => setFocusedField('cardNumber')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="1234 5678 9012 3456" 
                    className={`w-full px-4 py-3 rounded-2xl bg-white/5 border ${errors.cardNumber ? 'border-rose-500' : 'border-white/10'} text-white placeholder-gray-500 focus:outline-none transition-all duration-200 ${focusedField === 'cardNumber' ? 'ring-2 ring-emerald-500/50' : ''}`} 
                  />
                  {errors.cardNumber && <p className="text-rose-400 text-xs mt-1.5">{errors.cardNumber}</p>}
                </div>

                {/* Expiry & CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Expiry</label>
                    <input 
                      type="text" 
                      name="expiry" 
                      value={formData.expiry} 
                      onChange={handleChange} 
                      onFocus={() => setFocusedField('expiry')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="MM/YY" 
                      className={`w-full px-4 py-3 rounded-2xl bg-white/5 border ${errors.expiry ? 'border-rose-500' : 'border-white/10'} text-white placeholder-gray-500 focus:outline-none transition-all duration-200 ${focusedField === 'expiry' ? 'ring-2 ring-emerald-500/50' : ''}`} 
                    />
                    {errors.expiry && <p className="text-rose-400 text-xs mt-1.5">{errors.expiry}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">CVV</label>
                    <input 
                      type="password" 
                      name="cvv" 
                      value={formData.cvv} 
                      onChange={handleChange} 
                      onFocus={() => setFocusedField('cvv')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="123" 
                      className={`w-full px-4 py-3 rounded-2xl bg-white/5 border ${errors.cvv ? 'border-rose-500' : 'border-white/10'} text-white placeholder-gray-500 focus:outline-none transition-all duration-200 ${focusedField === 'cvv' ? 'ring-2 ring-emerald-500/50' : ''}`} 
                    />
                    {errors.cvv && <p className="text-rose-400 text-xs mt-1.5">{errors.cvv}</p>}
                  </div>
                </div>

                {/* Discount Code */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Discount Code</label>
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      value={discountCode} 
                      onChange={(e) => setDiscountCode(e.target.value)} 
                      placeholder="SAVE10, WELCOME, etc." 
                      className="flex-1 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-200" 
                    />
                    <button 
                      type="button" 
                      onClick={handleDiscount} 
                      className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 whitespace-nowrap"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                {/* Order Total */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Subtotal</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  {discountApplied > 0 && (
                    <div className="flex justify-between text-sm text-emerald-400">
                      <span>Discount ({discountApplied * 100}%)</span>
                      <span>-{formatPrice(cartTotal * discountApplied)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold text-white mt-2 pt-2 border-t border-white/10">
                    <span>Total</span>
                    <span className="text-emerald-400">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting || cart.length === 0} 
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-600 disabled:to-gray-700 text-white py-4 rounded-2xl font-bold transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 flex items-center justify-center gap-3 text-lg"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Place Order • {formatPrice(finalTotal)}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;