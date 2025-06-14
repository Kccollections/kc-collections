import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Navigation from './Navigation';
import UserActions from './UserActions';
import SearchBar from './SearchBar';

const Header = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { getItemCount } = useCart();
  
  const cartItemCount = getItemCount();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-gray-800 shadow-md border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-purple-400">
            <img src="/kc.png" alt="KC Collection" className="h-12 md:h-18" />
          </Link>

          {/* Navigation */}
          <Navigation isActive={isActive} />          

          {/* Actions */}
          <UserActions user={user} cartItemCount={cartItemCount} isActive={isActive} />
        </div>
      </div>
    </header>
  );
};

export default Header;