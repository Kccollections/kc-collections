import React from 'react';

const WishlistSkeleton = () => {
  return (
    <div className="animate-pulse space-y-6">
      {Array(3).fill().map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-4 flex items-center">
          <div className="h-24 w-24 bg-gray-300 rounded-md"></div>
          <div className="flex-1 ml-6 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="h-8 bg-gray-300 rounded w-32 mt-4"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WishlistSkeleton;