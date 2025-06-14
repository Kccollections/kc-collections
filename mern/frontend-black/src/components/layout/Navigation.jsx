import React from 'react';
import { Link } from 'react-router-dom';

const Navigation = ({ isActive }) => {
  return (
    <nav className="hidden md:flex space-x-8">
      <Link 
        to="/" 
        className={`font-medium ${isActive('/') ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600'}`}
      >
        Home
      </Link>
      <Link 
        to="/shop" 
        className={`font-medium ${isActive('/shop') ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600'}`}
      >
        Shop
      </Link>
      {/* <Link 
        to="/offers" 
        className={`font-medium ${isActive('/offers') ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600'}`}
      >
        Offers
      </Link>
      <Link 
        to="/about" 
        className={`font-medium ${isActive('/about') ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600'}`}
      >
        About
      </Link>
      <Link 
        to="/contact" 
        className={`font-medium ${isActive('/contact') ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600'}`}
      >
        Contact
      </Link> */}
    </nav>
  );
};

export default Navigation;