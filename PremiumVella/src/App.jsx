import React, { useState, useEffect } from 'react';
import { useCart } from './hooks/useCart';
import { useLocalStorage } from './hooks/useLocalStorage';
import { products as initialProducts } from './data/products';
import Navbar from './components/Navbar';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Wishlist from './components/Wishlist';
import QuickViewModal from './components/QuickViewModal';
import Footer from './components/Footer';
import './App.css';

// Simple Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-emerald-500',
    error: 'bg-rose-500',
    info: 'bg-indigo-500',
  };

  return (
    <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg text-white shadow-lg ${colors[type] || 'bg-gray-800'} animate-fade-in`}>
      {message}
    </div>
  );
};

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [toast, setToast] = useState(null);
  
  const { cart, cartTotal, cartCount, addToCart, removeFromCart, updateQuantity, clearCart } = useCart();
  const [wishlist, setWishlist] = useLocalStorage('wishlist', []);

  // Theme
  useEffect(() => {
    const theme = localStorage.getItem('store_theme');
    if (theme === 'dark') {
      setDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('store_theme', next ? 'dark' : 'light');
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        showToast('Removed from wishlist', 'info');
        return prev.filter(item => item.id !== product.id);
      } else {
        showToast('Added to wishlist ❤️', 'success');
        return [...prev, product];
      }
    });
  };

  const openQuickView = (product) => {
    setSelectedProduct(product);
    setShowQuickView(true);
  };

  const closeQuickView = () => {
    setShowQuickView(false);
    setSelectedProduct(null);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    showToast(`${product.name} added to cart! 🛒`, 'success');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <Navbar
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        darkMode={darkMode}
        toggleTheme={toggleTheme}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setShowCart={setShowCart}
        setShowWishlist={setShowWishlist}
      />

      <main className="flex-1">
        <ProductList
          products={initialProducts}
          searchQuery={searchQuery}
          onAddToCart={handleAddToCart}
          wishlist={wishlist}
          onToggleWishlist={toggleWishlist}
          onQuickView={openQuickView}
        />
      </main>

      <Footer />

      <Cart
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        cartTotal={cartTotal}
        cartCount={cartCount}
        showToast={showToast}
      />

      <Wishlist
        isOpen={showWishlist}
        onClose={() => setShowWishlist(false)}
        wishlist={wishlist}
        onAddToCart={handleAddToCart}
        onToggleWishlist={toggleWishlist}
      />

      <QuickViewModal
        isOpen={showQuickView}
        onClose={closeQuickView}
        product={selectedProduct}
        onAddToCart={handleAddToCart}
        onToggleWishlist={toggleWishlist}
        isWishlisted={selectedProduct ? wishlist.some(item => item.id === selectedProduct.id) : false}
      />
    </div>
  );
};

export default App;