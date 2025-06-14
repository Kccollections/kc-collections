import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

const WishlistEmpty = () => {
  return (
    <div className="text-center py-16 bg-white rounded-lg shadow-md">
      <svg 
        className="mx-auto h-16 w-16 text-gray-400" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="1.5" 
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
        />
      </svg>
      <h2 className="mt-4 text-lg font-medium text-gray-900">Your wishlist is empty</h2>
      <p className="mt-2 text-gray-500">Items added to your wishlist will appear here.</p>
      <div className="mt-6">
        <Button as={Link} to="/shop">
          Browse Products
        </Button>
      </div>
    </div>
  );
};

export default WishlistEmpty;