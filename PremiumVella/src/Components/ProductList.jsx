import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { getCategories, filterProducts } from '../utils/helpers';
import { Search } from 'lucide-react';

const ProductList = ({ 
  products, 
  searchQuery, 
  onAddToCart, 
  wishlist,
  onToggleWishlist,
  onQuickView
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = getCategories(products);

  const filteredProducts = filterProducts(products, searchQuery, selectedCategory);

  return (
    <div className="main-content">
      {/* Category Filters */}
      <div className="category-filters">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Product Count */}
      <p className="product-count">
        Showing <span>{filteredProducts.length}</span> products
      </p>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="empty-state">
          <Search size={48} />
          <h3>No products found</h3>
          <p>Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
              isWishlisted={wishlist.some(item => item.id === product.id)}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;