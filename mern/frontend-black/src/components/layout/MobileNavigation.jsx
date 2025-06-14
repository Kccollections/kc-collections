import React from 'react';
import { Link } from 'react-router-dom';

const MobileNavigation = ({ isActive }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 shadow-top z-50 block md:hidden border-t border-gray-700">
      <nav className="flex justify-around items-center py-2">
        <Link 
          to="/" 
          className="flex flex-col items-center"
        >
          <div className={`p-2 rounded-full ${isActive('/') ? 'bg-purple-900 text-purple-400' : 'text-gray-400'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <span className={`text-xs ${isActive('/') ? 'text-purple-400 font-medium' : 'text-gray-400'}`}>Home</span>
        </Link>
        
        <Link 
          to="/shop" 
          className="flex flex-col items-center"
        >
          <div className={`p-2 rounded-full ${isActive('/shop') ? 'bg-purple-900 text-purple-400' : 'text-gray-400'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <span className={`text-xs ${isActive('/shop') ? 'text-purple-400 font-medium' : 'text-gray-400'}`}>Shop</span>
        </Link>
        
        <Link 
          to="/user/cart" 
          className="flex flex-col items-center"
        >
          <div className={`p-2 rounded-full ${isActive('/user/cart') ? 'bg-purple-900 text-purple-400' : 'text-gray-400'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <span className={`text-xs ${isActive('/user/cart') ? 'text-purple-400 font-medium' : 'text-gray-400'}`}>Cart</span>
        </Link>
        
        <Link 
          to="/user/wishlist" 
          className="flex flex-col items-center"
        >
          <div className={`p-2 rounded-full ${isActive('/user/wishlist') ? 'bg-purple-900 text-purple-400' : 'text-gray-400'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className={`text-xs ${isActive('/user/wishlist') ? 'text-purple-400 font-medium' : 'text-gray-400'}`}>Wishlist</span>
        </Link>
        
        <Link 
          to="/user/account" 
          className="flex flex-col items-center"
        >
          <div className={`p-2 rounded-full ${isActive('/user/account') ? 'bg-purple-900 text-purple-400' : 'text-gray-400'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <span className={`text-xs ${isActive('/user/account') ? 'text-purple-400 font-medium' : 'text-gray-400'}`}>Account</span>
        </Link>
      </nav>
    </div>
  );
};

export default MobileNavigation;