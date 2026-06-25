import React from 'react';
import { Heart, Eye, Star } from 'lucide-react';

const ProductCard = ({ 
  product, 
  onAddToCart, 
  onToggleWishlist, 
  isWishlisted,
  onQuickView 
}) => {
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} className="product-image" />
      
      <div className="product-body">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        
        <div className="product-rating">
          <span className="stars">★</span>
          <span>{product.rating}</span>
          <span>({product.reviews})</span>
        </div>

        <div className="product-footer">
          <span className="product-price">${product.price.toFixed(2)}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleWishlist(product)}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Heart 
                size={16} 
                className={isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-gray-400'} 
              />
            </button>
            <button
              onClick={() => onQuickView(product)}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Eye size={16} className="text-gray-400" />
            </button>
            <button onClick={() => onAddToCart(product)} className="btn-add">
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;