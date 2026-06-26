import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Heart, 
  Sun, 
  Moon, 
  Search, 
  Menu, 
  X,
  Bell
} from 'lucide-react';

const Navbar = ({ 
  cartCount, 
  wishlistCount, 
  darkMode, 
  toggleTheme,
  setSearchQuery,
  searchQuery,
  setShowCart,
  setShowWishlist
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="bg-black border-b border-gray-800/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            
            {/* Left Section - Logo & Brand */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-800/50 transition-colors text-gray-400"
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>

              <a href="/" className="flex items-center gap-2.5 group">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all duration-300">
                    <span className="text-white font-bold text-lg">P</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-black animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-bold text-xl tracking-tight leading-none">
                    Premium<span className="text-emerald-400">Vella</span>
                  </span>
                  <span className="text-[10px] text-gray-500 tracking-wider uppercase">Premium Store</span>
                </div>
              </a>
            </div>

            {/* Center Section - Search Bar (Icon Outside) */}
            <div className="hidden md:flex flex-1 max-w-xl mx-6">
              <div className="relative w-full flex items-center">
                {/* Search Icon - Positioned OUTSIDE the input */}
                <div className="absolute left-0 flex items-center pointer-events-none z-10">
                  <Search className="h-4 w-4 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 text-sm"
                />
                <div className="absolute right-0 flex items-center pr-1.5">
                  <kbd className="hidden sm:inline-block px-2 py-1 text-[10px] font-semibold text-gray-500 bg-gray-800/50 rounded-md border border-gray-700/50">
                    ⌘K
                  </kbd>
                </div>
              </div>
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center gap-1">
              {/* Search - Mobile */}
              <button className="md:hidden p-2 rounded-lg hover:bg-gray-800/50 transition-colors text-gray-400">
                <Search size={20} />
              </button>

              {/* Wishlist */}
              <button 
                onClick={() => setShowWishlist(true)} 
                className="relative p-2.5 rounded-xl hover:bg-gray-800/50 transition-all duration-200 group text-gray-400 hover:text-rose-400"
              >
                <Heart size={20} className="group-hover:scale-110 transition-transform" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center shadow-lg shadow-rose-500/30">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Cart */}
              <button 
                onClick={() => setShowCart(true)} 
                className="relative p-2.5 rounded-xl hover:bg-gray-800/50 transition-all duration-200 group text-gray-400 hover:text-emerald-400"
              >
                <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-emerald-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme} 
                className="p-2.5 rounded-xl hover:bg-gray-800/50 transition-all duration-200 text-gray-400 hover:text-amber-400"
              >
                {darkMode ? (
                  <Sun size={20} className="text-amber-400" />
                ) : (
                  <Moon size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden pb-3">
            <div className="relative w-full flex items-center">
              <div className="absolute left-0 flex items-center pointer-events-none z-10">
                <Search className="h-4 w-4 text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-800/50 bg-black/95 backdrop-blur-sm animate-slide-down">
            <div className="px-4 py-3 space-y-1">
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800/50 transition-colors text-gray-300 hover:text-white">
                <Heart size={18} />
                <span className="text-sm">Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="ml-auto bg-rose-500/20 text-rose-400 text-xs px-2 py-0.5 rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800/50 transition-colors text-gray-300 hover:text-white">
                <ShoppingCart size={18} />
                <span className="text-sm">Cart</span>
                {cartCount > 0 && (
                  <span className="ml-auto bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full">
                    {cartCount}
                  </span>
                )}
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800/50 transition-colors text-gray-300 hover:text-white">
                <Bell size={18} />
                <span className="text-sm">Notifications</span>
              </a>
              <div className="pt-2 border-t border-gray-800/50">
                <button 
                  onClick={toggleTheme}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800/50 transition-colors text-gray-300 hover:text-white w-full"
                >
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                  <span className="text-sm">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;