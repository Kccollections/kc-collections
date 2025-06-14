import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const WishlistItem = ({ item, onAddToCart, onRemove }) => {
  // Handle image path properly - check if it's already a full URL, add API_URL if needed
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/placeholder.png';
    
    // If it's already a full URL, use it
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // If it starts with a slash, append to API_URL
    if (imagePath.startsWith('/')) {
      return `${API_URL}${imagePath}`;
    }
    
    // Otherwise, append with a slash
    return `${API_URL}/${imagePath}`;
  };

  return (
    <li className="p-4 flex flex-col sm:flex-row sm:items-center">
      <div className="flex-shrink-0 w-full sm:w-auto flex items-center mb-4 sm:mb-0">
        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
          <img 
            src={getImageUrl(item.image)}
            alt={item.name} 
            className="h-full w-full object-cover object-center"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/placeholder.png';
            }}
          />
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-base font-medium text-gray-900">
            <Link to={`/product/${item.id}`} className="hover:text-purple-700">
              {item.name}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-gray-500">${item.price.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="flex flex-col xs:flex-row gap-2 sm:ml-auto">
        <Button
          onClick={() => onAddToCart(item)}
          size="sm"
        >
          Add to Cart
        </Button>
        <Button
          onClick={() => onRemove(item.id)}
          variant="secondary"
          size="sm"
        >
          Remove
        </Button>
      </div>
    </li>
  );
};

export default WishlistItem;