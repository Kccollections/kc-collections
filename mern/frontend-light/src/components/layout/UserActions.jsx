import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SearchBar from './SearchBar';

const UserActions = ({ user, cartItemCount }) => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex items-center space-x-4">
                    <SearchBar />
      {/* Cart */}
      {user && (
        <>
        

          <Link to="/user/cart" className="text-gray-600 hover:text-purple-600 relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartItemCount > 0 && (
              <div className="absolute -top-2 -right-2 bg-purple-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                {cartItemCount}
              </div>
            )}
          </Link>
          
          {/* Wishlist */}
          <Link to="/user/wishlist" className="text-gray-600 hover:text-purple-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </Link>
        </>
      )}
      
      {/* Account */}
      {user ? (
        <div className="relative group z-50">
          <button className="flex items-center text-gray-600 hover:text-purple-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
          <div className="absolute right-0 w-48 p-2 mt-2 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
            <div className="py-2 px-4 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <div className="py-2">
              <Link to="/user/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-md">
                My Account
              </Link>
              <Link to="/user/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-md">
                Orders
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-md">
                  Admin Dashboard
                </Link>
              )}
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-md"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      ) : (
        <Link to="/login" className="text-gray-600 hover:text-purple-600">Login / Register</Link>
      )}
    </div>
  );
};

export default UserActions;