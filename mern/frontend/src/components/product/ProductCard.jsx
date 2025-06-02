import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const ProductCard = ({ product, isInWishlist, onWishlistToggle, onQuickView }) => {
  const {
    id,
    name,
    price,
    startingPrice,
    sale,
    rating,
    reviewCount,
    image,
    category,
    stock,
    isNew,
    attentionLevel
  } = product;

  // Calculate discount percentage if on sale
  const discountPercentage = sale && startingPrice > price 
    ? Math.round(((startingPrice - price) / startingPrice) * 100) 
    : null;

  // Handle the image path - ensure we have a fallback
  const imageSrc = image || 'https://via.placeholder.com/300x300?text=No+Image';

  // Convert rating to stars - improved rendering
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <svg key={`star-${i}`} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.95-.69l1.07-3.292z" />
          </svg>
        );
      } else if (i === fullStars && hasHalfStar) {
        // Simplified half-star rendering that works better without SVG gradients
        stars.push(
          <div key={`star-${i}`} className="relative w-4 h-4">
            <svg className="absolute w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.95-.69l1.07-3.292z" />
            </svg>
            <div className="absolute overflow-hidden w-2 h-4">
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.95-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
        );
      } else {
        stars.push(
          <svg key={`star-${i}`} className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.95-.69l1.07-3.292z" />
          </svg>
        );
      }
    }
    
    return (
      <div className="flex" role="img" aria-label={`Rating: ${rating} out of 5 stars`}>
        {stars}
      </div>
    );
  };

  // Get badge color based on attention level
  const getBadgeColor = (level) => {
    switch (level) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-blue-100 text-blue-800';
      case 'Low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-purple-100 text-purple-800';
    }
  };

  // Handle wishlist click
  const handleWishlistClick = (e) => {
    e.preventDefault();
    if (onWishlistToggle) {
      onWishlistToggle(id);
    }
  };

  // Handle quick view click
  const handleQuickViewClick = (e) => {
    e.preventDefault();
    if (onQuickView) {
      onQuickView(product);
    }
  };
  
  return (
    <div
      className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 hover:translate-y-[-5px]"
    >
      {/* Product badges */}
      <div className="absolute top-0 left-0 z-10 p-2 space-y-1">
        {isNew && (
          <span className="inline-block px-2 py-1 text-xs font-semibold rounded-md bg-purple-100 text-purple-800">
            New
          </span>
        )}
        {sale && (
          <span className="inline-block px-2 py-1 text-xs font-semibold rounded-md bg-red-100 text-red-800">
            Sale
          </span>
        )}
        {discountPercentage && (
          <span className="inline-block px-2 py-1 text-xs font-semibold rounded-md bg-green-100 text-green-800">
            {discountPercentage}% Off
          </span>
        )}
        {attentionLevel === 'High' && (
          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-md ${getBadgeColor(attentionLevel)}`}>
            Featured
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div className="absolute top-2 right-2 z-10 flex flex-col space-y-2">
        {/* Wishlist button */}
        {onWishlistToggle && (
          <button 
            onClick={handleWishlistClick}
            className="bg-white p-2 rounded-full shadow hover:bg-gray-100 transition-colors"
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <svg className={`w-5 h-5 ${isInWishlist ? 'text-red-500 fill-current' : 'text-gray-400'}`} 
                viewBox="0 0 24 24" 
                fill={isInWishlist ? "currentColor" : "none"}
                stroke="currentColor" 
                strokeWidth={isInWishlist ? "0" : "2"}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}

        {/* Quick View button */}
        {onQuickView && (
          <button 
            onClick={handleQuickViewClick}
            className="bg-white p-2 rounded-full shadow hover:bg-gray-100 transition-colors"
            aria-label="Quick view"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        )}
      </div>

      {/* Out of stock overlay */}
      {stock === 0 && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black bg-opacity-40">
          <span className="px-4 py-2 text-sm font-bold text-white bg-black bg-opacity-70 rounded">
            Out of Stock
          </span>
        </div>
      )}

      {/* Product image */}
      <div className="aspect-square overflow-hidden">
        <Link to={`/product/${id}`}>
          <img 
            src={imageSrc}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
            }}
          />
        </Link>
      </div>

      {/* Product details */}
      <div className="p-4">
        <div className="mb-2">
          <Link to={`/shop?category=${category}`}>
            <span className="text-xs text-gray-500 hover:text-purple-600">{category}</span>
          </Link>
        </div>
        <h3 className="text-lg font-semibold mb-1 line-clamp-2">
          <Link to={`/product/${id}`} className="text-gray-800 hover:text-purple-600">
            {name}
          </Link>
        </h3>
        <div className="flex items-center mb-2">
          <div className="flex mr-2">
            {renderStars(rating)}
          </div>
          {reviewCount > 0 && (
            <span className="text-xs text-gray-400">({reviewCount} reviews)</span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div>
            {sale ? (
              <div className="flex items-center">
                <span className="text-lg font-bold text-purple-700" aria-label={`Sale price: $${price.toFixed(2)}`}>
                  ${price.toFixed(2)}
                </span>
                <span className="ml-2 text-sm text-gray-500 line-through" aria-label={`Original price: $${startingPrice.toFixed(2)}`}>
                  ${startingPrice.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-purple-700" aria-label={`Price: $${price.toFixed(2)}`}>
                ${price.toFixed(2)}
              </span>
            )}
          </div>
          <Link to={`/product/${id}`}>
            <button
              className={`px-3 py-2 text-xs font-medium text-white rounded-md transition-colors ${stock === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
              disabled={stock === 0}
              aria-disabled={stock === 0}
            >
              {stock > 0 ? 'View Details' : 'Sold Out'}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Add prop validation
ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    startingPrice: PropTypes.number,
    sale: PropTypes.bool,
    rating: PropTypes.number,
    reviewCount: PropTypes.number,
    image: PropTypes.string,
    category: PropTypes.string,
    stock: PropTypes.number,
    isNew: PropTypes.bool,
    attentionLevel: PropTypes.oneOf(['High', 'Medium', 'Low'])
  }).isRequired,
  isInWishlist: PropTypes.bool,
  onWishlistToggle: PropTypes.func,
  onQuickView: PropTypes.func
};

// Default props
ProductCard.defaultProps = {
  product: {
    startingPrice: 0,
    sale: false,
    rating: 0,
    reviewCount: 0,
    image: '',
    category: 'Uncategorized',
    stock: 0,
    isNew: false,
    attentionLevel: null
  },
  isInWishlist: false,
  onWishlistToggle: null,
  onQuickView: null
};

export default ProductCard;
