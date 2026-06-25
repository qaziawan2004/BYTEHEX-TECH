import React, { useState } from 'react';
import { 
  X, CreditCard, User, Mail, MapPin, Lock, Tag, 
  Shield, Truck, Award, Sparkles, Zap, Crown,
  ArrowLeft, CheckCircle, AlertCircle
} from 'lucide-react';
import { formatPrice, validateCheckout, applyDiscount } from '../utils/helpers';

const CheckoutModal = ({ isOpen, onClose, cartTotal, onClearCart, showToast }) => {
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
  const [step, setStep] = useState(1);
  const [orderComplete, setOrderComplete] = useState(false);

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
      setOrderComplete(true);
      setIsSubmitting(false);
      showToast('🎉 Order placed successfully!', 'success');
      
      setTimeout(() => {
        onClearCart();
        onClose();
        setOrderComplete(false);
        setFormData({ name: '', email: '', address: '', cardNumber: '', expiry: '', cvv: '' });
        setDiscountApplied(0);
        setDiscountCode('');
        setStep(1);
      }, 2000);
    }, 2000);
  };

  const finalTotal = cartTotal * (1 - discountApplied);

  const FieldIcon = ({ name, className = "w-5 h-5" }) => {
    const icons = {
      name: User,
      email: Mail,
      address: MapPin,
      cardNumber: CreditCard,
      expiry: Calendar,
      cvv: Lock,
    };
    const Icon = icons[name] || User;
    return <Icon className={className} />;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content p-6 md:p-8">
          {/* Header with Back Button */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onClose}
              className="back-button"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Shop
            </button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Secure Checkout
              </span>
            </div>
          </div>

          {orderComplete ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-12 h-12 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Order Complete! 🎉</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Thank you for your purchase</p>
              <button onClick={onClose} className="btn-primary mt-6">
                Continue Shopping
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column - Form */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-500" />
                    Shipping Details
                  </h2>

                  {/* Name */}
                  <div className="checkout-field">
                    <label>Full Name</label>
                    <div className="input-wrapper">
                      <User className="input-icon" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className={errors.name ? 'error' : ''}
                      />
                    </div>
                    {errors.name && (
                      <p className="error-text">
                        <AlertCircle className="w-3 h-3" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="checkout-field">
                    <label>Email Address</label>
                    <div className="input-wrapper">
                      <Mail className="input-icon" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className={errors.email ? 'error' : ''}
                      />
                    </div>
                    {errors.email && (
                      <p className="error-text">
                        <AlertCircle className="w-3 h-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="checkout-field">
                    <label>Shipping Address</label>
                    <div className="input-wrapper">
                      <MapPin className="input-icon" style={{ top: '1rem' }} />
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="123 Main St, City, State, ZIP"
                        rows="2"
                        className={errors.address ? 'error' : ''}
                      />
                    </div>
                    {errors.address && (
                      <p className="error-text">
                        <AlertCircle className="w-3 h-3" />
                        {errors.address}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Column - Payment */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-indigo-500" />
                    Payment Details
                  </h2>

                  {/* Card Number */}
                  <div className="checkout-field">
                    <label>Card Number</label>
                    <div className="input-wrapper">
                      <CreditCard className="input-icon" />
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        placeholder="1234 5678 9012 3456"
                        className={errors.cardNumber ? 'error' : ''}
                      />
                    </div>
                    {errors.cardNumber && (
                      <p className="error-text">
                        <AlertCircle className="w-3 h-3" />
                        {errors.cardNumber}
                      </p>
                    )}
                  </div>

                  {/* Expiry & CVV */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="checkout-field">
                      <label>Expiry Date</label>
                      <input
                        type="text"
                        name="expiry"
                        value={formData.expiry}
                        onChange={handleChange}
                        placeholder="MM/YY"
                        className={errors.expiry ? 'error' : ''}
                      />
                      {errors.expiry && (
                        <p className="error-text">
                          <AlertCircle className="w-3 h-3" />
                          {errors.expiry}
                        </p>
                      )}
                    </div>
                    <div className="checkout-field">
                      <label>CVV</label>
                      <div className="input-wrapper">
                        <Lock className="input-icon" />
                        <input
                          type="password"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleChange}
                          placeholder="123"
                          className={errors.cvv ? 'error' : ''}
                        />
                      </div>
                      {errors.cvv && (
                        <p className="error-text">
                          <AlertCircle className="w-3 h-3" />
                          {errors.cvv}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Discount Code */}
                  <div className="checkout-field">
                    <label>Discount Code</label>
                    <div className="flex gap-2">
                      <div className="input-wrapper flex-1">
                        <Tag className="input-icon" />
                        <input
                          type="text"
                          value={discountCode}
                          onChange={(e) => setDiscountCode(e.target.value)}
                          placeholder="SAVE10, WELCOME, etc."
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleDiscount}
                        className="btn-secondary whitespace-nowrap px-4"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-indigo-50 dark:from-emerald-900/20 dark:to-indigo-900/20 border border-emerald-100 dark:border-emerald-800/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="font-semibold">{formatPrice(cartTotal)}</span>
                </div>
                {discountApplied > 0 && (
                  <div className="flex items-center justify-between mb-2 text-emerald-600 dark:text-emerald-400">
                    <span className="text-sm">Discount ({discountApplied * 100}%)</span>
                    <span>-{formatPrice(cartTotal * discountApplied)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-emerald-200 dark:border-emerald-800/30">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                    {formatPrice(finalTotal)}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full mt-4 text-center flex items-center justify-center gap-2"
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
                      <Zap className="w-4 h-4" />
                      Place Order • {formatPrice(finalTotal)}
                    </>
                  )}
                </button>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-500" />
                  Secure Payment
                </span>
                <span className="flex items-center gap-1">
                  <Truck className="w-3 h-3 text-indigo-500" />
                  Free Shipping
                </span>
                <span className="flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-500" />
                  Guaranteed
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// Calendar icon for expiry
const Calendar = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

export default CheckoutModal;